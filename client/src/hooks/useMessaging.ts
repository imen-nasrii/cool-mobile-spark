import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './useAuth';

interface Conversation {
  id: string;
  product_id: string;
  product_title: string;
  product_image: string;
  other_user_name: string;
  other_user_email: string;
  last_message: string;
  last_message_time: Date;
  unread_count: number;
  is_buyer: boolean;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: Date;
}

export function useMessaging() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // WebSocket connection - Temporarily disabled
  useEffect(() => {
    if (!user || !user.id) {
      setIsConnected(false);
      return;
    }
    
    // Disable WebSocket for now to avoid confusion
    console.log('WebSocket messaging disabled for debugging');
    setIsConnected(false);
    return;

    // Determine WebSocket URL based on environment
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    
    // Construct WebSocket URL safely
    let wsUrl: string;
    
    if (window.location.hostname.includes("replit.dev")) {
      // Use same host as current page for Replit
      wsUrl = `${protocol}//${window.location.host}/ws?userId=${user.id}`;
    } else {
      // Local development - use port 5000
      wsUrl = `${protocol}//localhost:5000/ws?userId=${user.id}`;
    }
    
    
    // Validate WebSocket URL before creating connection
    if (wsUrl.includes('undefined') || !wsUrl.includes('ws')) {
      console.error('Invalid WebSocket URL detected:', wsUrl);
      setIsConnected(false);
      return;
    }

    console.log('App WebSocket connecting to:', wsUrl);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_message') {
          // Invalidate conversations and messages queries
          queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
          queryClient.invalidateQueries({ 
            queryKey: ['/api/conversations', data.conversationId, 'messages'] 
          });
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.error('Failed to connect to WebSocket URL:', wsUrl);
        setIsConnected(false);
      };

      return () => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnected(false);
    }
  }, [user, queryClient]);

  // Get conversations
  const conversationsQuery = useQuery({
    queryKey: ['/api/conversations'],
    queryFn: () => apiRequest('/conversations'),
    enabled: !!user,
  });

  // Get messages for a conversation
  const useConversationMessages = (conversationId: string | null) => {
    return useQuery({
      queryKey: ['/api/conversations', conversationId, 'messages'],
      queryFn: () => apiRequest(`/conversations/${conversationId}/messages`),
      enabled: !!conversationId && !!user,
    });
  };

  // Create conversation
  const createConversationMutation = useMutation({
    mutationFn: (data: { product_id: string; seller_id: string }) =>
      apiRequest('/conversations', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: (data: { conversationId: string; content: string }) =>
      apiRequest(`/conversations/${data.conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: data.content }),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/conversations', variables.conversationId, 'messages'] 
      });
    },
  });

  return {
    conversations: conversationsQuery.data || [],
    isLoadingConversations: conversationsQuery.isLoading,
    useConversationMessages,
    createConversation: createConversationMutation.mutateAsync,
    sendMessage: sendMessageMutation.mutateAsync,
    isConnected,
    isCreatingConversation: createConversationMutation.isPending,
    isSendingMessage: sendMessageMutation.isPending,
  };
}