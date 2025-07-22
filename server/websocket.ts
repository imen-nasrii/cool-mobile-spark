import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { messages, users, profiles } from '@shared/schema';
import { eq, or, and, desc } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  username?: string;
}

interface WebSocketMessage {
  type: 'message' | 'typing' | 'read_receipt' | 'join_conversation' | 'get_conversations';
  conversationId?: string;
  recipientId?: string;
  content?: string;
  messageId?: string;
}

interface ConnectedUser {
  userId: string;
  username: string;
  ws: AuthenticatedWebSocket;
}

const connectedUsers = new Map<string, ConnectedUser>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', async (ws: AuthenticatedWebSocket, req) => {
    console.log('WebSocket connection attempt');
    
    // Extract token from query params or headers
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(1008, 'No token provided');
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
      
      if (!user[0]) {
        ws.close(1008, 'Invalid user');
        return;
      }

      ws.userId = user[0].id;
      ws.username = user[0].display_name || user[0].email;
      
      connectedUsers.set(user[0].id, {
        userId: user[0].id,
        username: ws.username,
        ws
      });

      console.log(`User ${ws.username} connected via WebSocket`);

      // Send connection confirmation
      ws.send(JSON.stringify({
        type: 'connected',
        userId: ws.userId,
        username: ws.username
      }));

    } catch (error) {
      console.error('WebSocket auth error:', error);
      ws.close(1008, 'Authentication failed');
      return;
    }

    ws.on('message', async (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        await handleWebSocketMessage(ws, message);
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      if (ws.userId) {
        connectedUsers.delete(ws.userId);
        console.log(`User ${ws.username} disconnected`);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
}

async function handleWebSocketMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
  if (!ws.userId) return;

  switch (message.type) {
    case 'get_conversations':
      await sendUserConversations(ws);
      break;

    case 'join_conversation':
      if (message.conversationId) {
        await joinConversation(ws, message.conversationId);
      }
      break;

    case 'message':
      if (message.content && (message.conversationId || message.recipientId)) {
        await handleNewMessage(ws, message);
      }
      break;

    case 'typing':
      if (message.conversationId) {
        await broadcastTyping(ws, message.conversationId);
      }
      break;

    case 'read_receipt':
      if (message.messageId) {
        await markMessageAsRead(ws, message.messageId);
      }
      break;

    default:
      ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
  }
}

async function sendUserConversations(ws: AuthenticatedWebSocket) {
  if (!ws.userId) return;

  try {
    // Simplified conversation logic using existing messages table
    const userMessages = await db
      .select({
        id: messages.id,
        product_id: messages.product_id,
        sender_id: messages.sender_id,
        recipient_id: messages.recipient_id,
        content: messages.content,
        created_at: messages.created_at,
        sender_name: users.display_name,
        sender_email: users.email
      })
      .from(messages)
      .leftJoin(users, eq(users.id, messages.sender_id))
      .where(or(eq(messages.sender_id, ws.userId), eq(messages.recipient_id, ws.userId)))
      .orderBy(desc(messages.created_at));

    // Group by conversation
    const conversationMap = new Map();
    for (const msg of userMessages) {
      const otherUserId = msg.sender_id === ws.userId ? msg.recipient_id : msg.sender_id;
      const conversationId = `${msg.product_id}-${otherUserId}`;
      
      if (!conversationMap.has(conversationId)) {
        conversationMap.set(conversationId, {
          id: conversationId,
          other_user_id: otherUserId,
          last_message_at: msg.created_at,
          last_message_content: msg.content
        });
      }
    }

    const userConversations = Array.from(conversationMap.values());

    ws.send(JSON.stringify({
      type: 'conversations',
      data: userConversations
    }));

  } catch (error) {
    console.error('Error fetching conversations:', error);
    ws.send(JSON.stringify({ type: 'error', message: 'Failed to fetch conversations' }));
  }
}

async function joinConversation(ws: AuthenticatedWebSocket, conversationId: string) {
  if (!ws.userId) return;

  try {
    // Parse conversation ID to get product and other user
    const [productId, otherUserId] = conversationId.split('-');
    
    const conversationMessages = await db
      .select({
        id: messages.id,
        content: messages.content,
        sender_id: messages.sender_id,
        created_at: messages.created_at,
        is_read: messages.is_read,
        sender_name: users.display_name,
        sender_email: users.email
      })
      .from(messages)
      .leftJoin(users, eq(users.id, messages.sender_id))
      .where(
        and(
          eq(messages.product_id, productId),
          or(
            and(eq(messages.sender_id, ws.userId), eq(messages.recipient_id, otherUserId)),
            and(eq(messages.sender_id, otherUserId), eq(messages.recipient_id, ws.userId))
          )
        )
      )
      .orderBy(messages.created_at);

    ws.send(JSON.stringify({
      type: 'conversation_messages',
      conversationId,
      messages: conversationMessages
    }));

  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    ws.send(JSON.stringify({ type: 'error', message: 'Failed to fetch messages' }));
  }
}

async function handleNewMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
  if (!ws.userId || !message.content) return;

  try {
    let conversationId = message.conversationId;
    
    // For now, use product-based conversations without separate conversation table
    if (!conversationId && message.recipientId) {
      // We need a productId for this to work, skip for now
      return;
    }

    if (!conversationId) return;

    // Parse conversationId to get productId and recipientId
    const [productId, recipientId] = conversationId.split('-');
    
    // Insert message
    const newMessage = await db
      .insert(messages)
      .values({
        product_id: productId,
        sender_id: ws.userId,
        recipient_id: recipientId,
        content: message.content,
        message_type: 'text'
      })
      .returning();

    // Broadcast message to conversation participants
    const messageWithSender = {
      type: 'new_message',
      conversationId,
      message: {
        id: newMessage[0].id,
        content: newMessage[0].content,
        sender_id: newMessage[0].sender_id,
        created_at: newMessage[0].created_at,
        sender_name: ws.username,
        is_read: false
      }
    };

    // Send to sender
    ws.send(JSON.stringify(messageWithSender));

    // Send to recipient if online
    if (recipientId) {
      const recipientConnection = connectedUsers.get(recipientId);
      if (recipientConnection && recipientConnection.ws.readyState === WebSocket.OPEN) {
        recipientConnection.ws.send(JSON.stringify(messageWithSender));
      }
    }

  } catch (error) {
    console.error('Error handling new message:', error);
    ws.send(JSON.stringify({ type: 'error', message: 'Failed to send message' }));
  }
}

async function broadcastTyping(ws: AuthenticatedWebSocket, conversationId: string) {
  if (!ws.userId) return;

  try {
    // Parse conversationId to get other participant
    const [, otherParticipantId] = conversationId.split('-');

    // Send typing indicator to other participant
    const otherConnection = connectedUsers.get(otherParticipantId);
    if (otherConnection && otherConnection.ws.readyState === WebSocket.OPEN) {
      otherConnection.ws.send(JSON.stringify({
        type: 'typing',
        conversationId,
        userId: ws.userId,
        username: ws.username
      }));
    }

  } catch (error) {
    console.error('Error broadcasting typing:', error);
  }
}

async function markMessageAsRead(ws: AuthenticatedWebSocket, messageId: string) {
  if (!ws.userId) return;

  try {
    await db
      .update(messages)
      .set({ is_read: true })
      .where(and(eq(messages.id, messageId), eq(messages.recipient_id, ws.userId)));

    ws.send(JSON.stringify({
      type: 'message_read',
      messageId
    }));

  } catch (error) {
    console.error('Error marking message as read:', error);
  }
}

export function broadcastToUser(userId: string, message: any) {
  const userConnection = connectedUsers.get(userId);
  if (userConnection && userConnection.ws.readyState === WebSocket.OPEN) {
    userConnection.ws.send(JSON.stringify(message));
    return true;
  }
  return false;
}