import { QueryClient } from '@tanstack/react-query';
import { apiClient } from './apiClient';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Default fetcher that works with our API client
export const queryFetcher = ({ queryKey }: { queryKey: string[] }) => {
  const [endpoint, ...params] = queryKey;
  
  // Handle different API patterns
  if (params.length > 0) {
    return apiClient.request(`${endpoint}/${params.join('/')}`);
  }
  
  return apiClient.request(endpoint);
};

// Mutation helper
export const apiRequest = (endpoint: string, options?: RequestInit) => {
  return apiClient.request(endpoint, options);
};

// Re-export the apiClient for direct use
export { apiClient };