import { QueryClient } from '@tanstack/react-query';
import { apiClient } from './apiClient';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000, // 3 minutes - reduced for fresher data
      cacheTime: 10 * 60 * 1000, // 10 minutes in cache
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      retry: 1, // Reduced retry attempts for faster failure handling
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
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