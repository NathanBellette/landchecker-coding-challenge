import { renderHookWithQueryClient, createTestQueryClient } from '@/test-utils.tsx';
import { waitFor } from '@testing-library/react';
import { usePropertyDetails, usePropertyEvents } from './usePropertyDetails';
import { createSuccessResponse, createErrorResponse, setupHookTest } from './test-helpers';
import type { Property, PropertyEvent } from '@/interfaces';

const mockApiFetch = jest.fn();
jest.mock('@/utils/api', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const mockPropertyDetailsResponse = {
  id: 1,
  title: 'Beautiful House',
  description: 'A lovely property',
  price: 500000,
  formatted_price: '$500,000',
  bedrooms: 3,
  property_type: 'house',
  status: 'available',
  latitude: -37.8136,
  longitude: 144.9631,
  published_at: '2024-01-01T00:00:00Z',
  property_images: [],
};

const mockEvents: PropertyEvent[] = [
  {
    id: 1,
    event_type: 'price_changed',
    data: { old_price: 450000, new_price: 500000 },
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    event_type: 'sold',
    data: {},
    created_at: '2024-01-20T14:30:00Z',
  },
];

describe('usePropertyDetails', () => {
  beforeEach(setupHookTest);

  it('fetches and flattens property details successfully', async () => {
    mockApiFetch.mockResolvedValue(createSuccessResponse(mockPropertyDetailsResponse));

    const { result } = renderHookWithQueryClient(() => usePropertyDetails(1));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/properties/1');
    const data = result.current.data;
    expect(data?.id).toBe(1);
    expect(data?.title).toBe('Beautiful House');
    expect(data?.price).toBe(500000);
  });

  it('does not fetch when propertyId is undefined', () => {
    const { result } = renderHookWithQueryClient(() => usePropertyDetails(undefined));

    expect(result.current.isFetching).toBe(false);
    expect(mockApiFetch).not.toHaveBeenCalled();
  });


  it('handles API errors', async () => {
    mockApiFetch.mockResolvedValue(createErrorResponse());

    const { result } = renderHookWithQueryClient(() => usePropertyDetails(1));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe('Failed to fetch property details');
  });

  it('uses correct query key', () => {
    const queryClient = createTestQueryClient();
    renderHookWithQueryClient(() => usePropertyDetails(1), { queryClient });

    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    expect(queries[0]?.queryKey).toEqual(['property', 1]);
  });

  it('refetches when propertyId changes', async () => {
    mockApiFetch.mockResolvedValue(createSuccessResponse(mockPropertyDetailsResponse));

    let propertyId = 1;
    const { result, rerender } = renderHookWithQueryClient(
      () => usePropertyDetails(propertyId)
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(mockApiFetch).toHaveBeenCalledTimes(1);

    propertyId = 2;
    rerender();

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledTimes(2);
    });

    expect(mockApiFetch).toHaveBeenLastCalledWith('/properties/2');
  });
});

describe('usePropertyEvents', () => {
  beforeEach(setupHookTest);

  it('fetches property events successfully', async () => {
    mockApiFetch.mockResolvedValue(
      createSuccessResponse({
        events: mockEvents,
        count: 2,
      })
    );

    const { result } = renderHookWithQueryClient(() => usePropertyEvents(1));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/properties/1/property_events');
    expect(result.current.data?.events).toEqual(mockEvents);
    expect(result.current.data?.count).toBe(2);
  });

  it('does not fetch when propertyId is undefined', () => {
    const { result } = renderHookWithQueryClient(() => usePropertyEvents(undefined));

    expect(result.current.isFetching).toBe(false);
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('handles API errors', async () => {
    mockApiFetch.mockResolvedValue(createErrorResponse());

    const { result } = renderHookWithQueryClient(() => usePropertyEvents(1));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe('Failed to fetch property events');
  });

  it('uses correct query key', () => {
    const queryClient = createTestQueryClient();
    renderHookWithQueryClient(() => usePropertyEvents(1), { queryClient });

    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    expect(queries[0]?.queryKey).toEqual(['property-events', 1]);
  });

  it('refetches when propertyId changes', async () => {
    mockApiFetch.mockResolvedValue(
      createSuccessResponse({
        events: mockEvents,
        count: 2,
      })
    );

    let propertyId = 1;
    const { result, rerender } = renderHookWithQueryClient(
      () => usePropertyEvents(propertyId)
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(mockApiFetch).toHaveBeenCalledTimes(1);

    propertyId = 2;
    rerender();

    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledTimes(2);
    });

    expect(mockApiFetch).toHaveBeenLastCalledWith('/properties/2/property_events');
  });

  it('handles empty events array', async () => {
    mockApiFetch.mockResolvedValue(
      createSuccessResponse({
        events: [],
        count: 0,
      })
    );

    const { result } = renderHookWithQueryClient(() => usePropertyEvents(1));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.events).toEqual([]);
    expect(result.current.data?.count).toBe(0);
  });
});

