import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface Appointment {
  id: string;
  conversation_id: string;
  product_id: string;
  requester_id: string;
  owner_id: string;
  appointment_date: string;
  location: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
  product_title?: string;
  requester_name?: string;
  owner_name?: string;
}

export interface CreateAppointmentData {
  conversation_id: string;
  product_id: string;
  appointment_date: string;
  location?: string;
  notes?: string;
}

export const useAppointments = () => {
  return useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
    staleTime: 30000, // 30 seconds
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAppointmentData) =>
      apiRequest("/api/appointments", {
        method: "POST",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
  });
};

export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ appointmentId, status }: { appointmentId: string; status: string }) =>
      apiRequest(`/api/appointments/${appointmentId}/status`, {
        method: "PATCH",
        body: { status },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (appointmentId: string) =>
      apiRequest(`/api/appointments/${appointmentId}/cancel`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });
};