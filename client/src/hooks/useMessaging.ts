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

  // WebSocket connection
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // Use the same host as the current page to avoid port issues
    const wsUrl = `${protocol}//${window.location.host}/ws?userId=${user.id}`;
    
    console.log('WebSocket URL:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
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
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
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