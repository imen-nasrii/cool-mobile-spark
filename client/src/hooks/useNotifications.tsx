import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import type { Notification } from '@shared/schema';

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      console.log('🔔 Fetching notifications from API...');
      console.log('🔑 Token exists:', !!localStorage.getItem('authToken'));
      try {
        const result = await apiClient.request('/notifications') as Promise<Notification[]>;
        console.log('📱 Notifications received:', Array.isArray(result) ? result.length : 0, result);
        return result;
      } catch (error) {
        console.error('❌ Notifications query error:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!localStorage.getItem('authToken'), // Only fetch if authenticated
  });

  const {
    data: unreadCount = 0
  } = useQuery({
    queryKey: ['/api/notifications/unread-count'],
    queryFn: async () => {
      console.log('📊 Fetching unread count...');
      try {
        const res: any = await apiClient.request('/notifications/unread-count');
        console.log('📊 Unread count:', res?.count || 0);
        return res?.count || 0;
      } catch (error) {
        console.error('❌ Unread count query error:', error);
        return 0;
      }
    },
    refetchInterval: 15000, // Refetch every 15 seconds
    enabled: !!localStorage.getItem('authToken'), // Only fetch if authenticated
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => 
      apiClient.request(`/notifications/${notificationId}/read`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => 
      apiClient.request('/notifications/mark-all-read', { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => 
      apiClient.request(`/notifications/${notificationId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    }
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
  };
};