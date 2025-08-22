import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

export function useAppointments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const useConversationAppointments = (conversationId: string | null) => {
    return useQuery({
      queryKey: ['/api/appointments/conversation', conversationId],
      queryFn: () => apiRequest(`/api/appointments/conversation/${conversationId}`),
      enabled: !!conversationId,
    });
  };

  const useUserAppointments = () => {
    return useQuery({
      queryKey: ['/api/appointments/user'],
      queryFn: () => apiRequest('/api/appointments/user'),
      enabled: !!user,
    });
  };

  const createAppointment = useMutation({
    mutationFn: (appointmentData: any) =>
      apiRequest('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
  });

  const updateAppointmentStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      // Also invalidate products query to reflect reservation status
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });

  return {
    useConversationAppointments,
    useUserAppointments,
    createAppointment,
    updateAppointmentStatus,
  };
}