import { useInfiniteQuery } from '@tanstack/react-query';
import type { SearchFilters, Property } from '@/interfaces';
import { apiFetch } from '@/utils/api';

interface PropertiesResponse {
  properties: Property[];
  metadata: {
    limit: number;
    next_cursor?: string;
  };
}

const fetchProperties = async (filters: SearchFilters, cursor?: string): Promise<PropertiesResponse> => {
  const params = new URLSearchParams();
  const limit = 25;
  params.append('limit', limit.toString());

  if (filters.property_type) params.append('property_type', filters.property_type);
  if (filters.min_bedrooms) params.append('min_bedrooms', filters.min_bedrooms);
  if (filters.max_bedrooms) params.append('max_bedrooms', filters.max_bedrooms);
  if (filters.min_price) params.append('min_price', filters.min_price);
  if (filters.max_price) params.append('max_price', filters.max_price);
  if (cursor) params.append('cursor', cursor);

  const response = await apiFetch(`/properties?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch properties');
  }
  
  return response.json();
};

export const useProperties = (filters: SearchFilters) => {
  return useInfiniteQuery({
    queryKey: ['properties', filters],
    queryFn: ({ pageParam }) => fetchProperties(filters, pageParam),
    getNextPageParam: (lastPage) => lastPage.metadata.next_cursor || undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
