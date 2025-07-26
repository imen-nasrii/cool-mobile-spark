import { db } from "./db";
import { conversations, messages, users, products, type Conversation, type ChatMessage, type InsertConversation, type InsertChatMessage } from "@shared/schema";
import { eq, and, desc, or } from "drizzle-orm";
import { WebSocket } from "ws";
import { notificationService } from "./notifications";

export class MessagingService {
  private connectedClients = new Map<string, WebSocket>();

  addClient(userId: string, ws: WebSocket) {
    this.connectedClients.set(userId, ws);
    
    ws.on('close', () => {
      this.connectedClients.delete(userId);
    });
  }

  async createConversation(buyerId: string, sellerId: string, productId: string): Promise<Conversation> {
    // Check if conversation already exists
    const existingConversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.buyer_id, buyerId),
          eq(conversations.seller_id, sellerId),
          eq(conversations.product_id, productId)
        )
      )
      .limit(1);

    if (existingConversation.length > 0) {
      return existingConversation[0];
    }

    // Create new conversation
    const newConversation: InsertConversation = {
      buyer_id: buyerId,
      seller_id: sellerId,
      product_id: productId,
    };

    const [conversation] = await db
      .insert(conversations)
      .values(newConversation)
      .returning();

    return conversation;
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<ChatMessage> {
    // Get conversation details for notification
    const conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (conversation.length === 0) {
      throw new Error("Conversation not found");
    }

    // Determine receiver
    const receiverId = conversation[0].buyer_id === senderId ? conversation[0].seller_id : conversation[0].buyer_id;

    // Get sender name for notification
    const senderResult = await db
      .select({ display_name: users.display_name })
      .from(users)
      .where(eq(users.id, senderId))
      .limit(1);

    const senderName = senderResult[0]?.display_name || "Un utilisateur";
    const newMessage: InsertChatMessage = {
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    };

    const [message] = await db
      .insert(messages)
      .values(newMessage)
      .returning();

    // Update conversation's last message timestamp
    await db
      .update(conversations)
      .set({ last_message_at: new Date() })
      .where(eq(conversations.id, conversationId));

    // Create notification for receiver
    await notificationService.notifyNewMessage(receiverId, senderName, conversationId);

    // Send real-time notification via WebSocket
    this.notifyUser(receiverId, {
      type: 'new_message',
      message,
      conversationId
    });

    return message;
  }

  async getConversations(userId: string): Promise<any[]> {
    const userConversations = await db
      .select({
        id: conversations.id,
        product_id: conversations.product_id,
        buyer_id: conversations.buyer_id,
        seller_id: conversations.seller_id,
        last_message_at: conversations.last_message_at,
        created_at: conversations.created_at,
        product_title: products.title,
        product_image: products.image_url,
        other_user_name: users.display_name,
        other_user_email: users.email,
      })
      .from(conversations)
      .leftJoin(products, eq(conversations.product_id, products.id))
      .leftJoin(users, or(
        and(eq(conversations.buyer_id, userId), eq(users.id, conversations.seller_id)),
        and(eq(conversations.seller_id, userId), eq(users.id, conversations.buyer_id))
      ))
      .where(or(
        eq(conversations.buyer_id, userId),
        eq(conversations.seller_id, userId)
      ))
      .orderBy(desc(conversations.last_message_at));

    // Get last message for each conversation
    const conversationsWithMessages = await Promise.all(
      userConversations.map(async (conv) => {
        const lastMessage = await db
          .select()
          .from(messages)
          .where(eq(messages.conversation_id, conv.id))
          .orderBy(desc(messages.created_at))
          .limit(1);

        const unreadCount = await db
          .select()
          .from(messages)
          .where(
            and(
              eq(messages.conversation_id, conv.id),
              eq(messages.is_read, false),
              eq(messages.sender_id, conv.buyer_id === userId ? conv.seller_id : conv.buyer_id)
            )
          );

        return {
          ...conv,
          last_message: lastMessage[0]?.content || '',
          last_message_time: lastMessage[0]?.created_at || conv.created_at,
          unread_count: unreadCount.length,
          is_buyer: conv.buyer_id === userId
        };
      })
    );

    return conversationsWithMessages;
  }

  async getMessages(conversationId: string, userId: string): Promise<ChatMessage[]> {
    // Verify user has access to this conversation
    const conversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          or(
            eq(conversations.buyer_id, userId),
            eq(conversations.seller_id, userId)
          )
        )
      )
      .limit(1);

    if (conversation.length === 0) {
      throw new Error('Unauthorized access to conversation');
    }

    // Get messages
    const conversationMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversation_id, conversationId))
      .orderBy(messages.created_at);

    // Mark messages as read
    await db
      .update(messages)
      .set({ is_read: true })
      .where(
        and(
          eq(messages.conversation_id, conversationId),
          eq(messages.sender_id, conversation[0].buyer_id === userId ? conversation[0].seller_id : conversation[0].buyer_id)
        )
      );

    return conversationMessages;
  }

  private notifyUser(userId: string, data: any) {
    const client = this.connectedClients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }
}

export const messagingService = new MessagingService();