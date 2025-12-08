import { renderHookWithQueryClient, createTestQueryClient } from '@/test-utils.tsx';
import { waitFor } from '@testing-library/react';
import { useProperties } from './useProperties';
import type { Property, SearchFilters } from '@/interfaces';
import { createSuccessResponse, createErrorResponse, setupHookTest } from './test-helpers';

const mockApiFetch = jest.fn();
jest.mock('@/utils/api', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const mockProperties: Property[] = [
  {
    id: 1,
    title: 'House 1',
    description: 'Description 1',
    price: 500000,
    formatted_price: '$500,000',
    bedrooms: 3,
    property_type: 'house',
    status: 'available',
    latitude: -37.8136,
    longitude: 144.9631,
    published_at: '2024-01-01T00:00:00Z',
    property_images: [],
  },
  {
    id: 2,
    title: 'Apartment 1',
    description: 'Description 2',
    price: 300000,
    formatted_price: '$300,000',
    bedrooms: 2,
    property_type: 'apartment',
    status: 'available',
    latitude: -33.8688,
    longitude: 151.2093,
    published_at: '2024-01-02T00:00:00Z',
    property_images: [],
  },
];

describe('useProperties', () => {
  beforeEach(setupHookTest);

  it('includes all filter parameters in the request', async () => {
    const filters: SearchFilters = {
      property_type: 'house',
      min_bedrooms: '2',
      max_bedrooms: '4',
      min_price: '100000',
      max_price: '500000',
    };

    mockApiFetch.mockResolvedValue(
      createSuccessResponse({
        properties: mockProperties,
        metadata: { limit: 25 },
      })
    );

    renderHookWithQueryClient(() => useProperties(filters));

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalled();
    });

    const callUrl = mockApiFetch.mock.calls[0][0] as string;
    expect(callUrl).toContain('property_type=house');
    expect(callUrl).toContain('min_bedrooms=2');
    expect(callUrl).toContain('max_bedrooms=4');
    expect(callUrl).toContain('min_price=100000');
    expect(callUrl).toContain('max_price=500000');
  });

  it('handles API errors', async () => {
    const filters: SearchFilters = {};

    mockApiFetch.mockResolvedValue(createErrorResponse());

    const { result } = renderHookWithQueryClient(() => useProperties(filters));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error)?.message).toBe('Failed to fetch properties');
  });

  it('uses correct query key with filters', () => {
    const filters: SearchFilters = {
      property_type: 'house',
      min_bedrooms: '2',
    };

    const queryClient = createTestQueryClient();
    renderHookWithQueryClient(() => useProperties(filters), { queryClient });

    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    expect(queries[0]?.queryKey).toEqual(['properties', filters]);
  });

  it('only includes non-empty filter parameters', async () => {
    const filters: SearchFilters = {
      property_type: 'house',
      min_bedrooms: '',
      max_bedrooms: '',
      min_price: '',
      max_price: '',
    };

    mockApiFetch.mockResolvedValue(
      createSuccessResponse({
        properties: mockProperties,
        metadata: { limit: 25 },
      })
    );

    renderHookWithQueryClient(() => useProperties(filters));

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalled();
    });

    const callUrl = mockApiFetch.mock.calls[0][0] as string;
    expect(callUrl).toContain('property_type=house');
    expect(callUrl).not.toContain('min_bedrooms');
    expect(callUrl).not.toContain('max_bedrooms');
    expect(callUrl).not.toContain('min_price');
    expect(callUrl).not.toContain('max_price');
  });
});

