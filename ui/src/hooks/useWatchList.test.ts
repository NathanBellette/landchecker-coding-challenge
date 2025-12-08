import { renderHookWithQueryClient, createTestQueryClient } from '@/test-utils.tsx';
import { waitFor } from '@testing-library/react';
import {
  useWatchList,
  useAddToWatchlist,
  useRemoveFromWatchlist,
} from './useWatchList';
import type { Property, WatchlistProperty } from '@/interfaces';
import {
  createSuccessResponse,
  createErrorResponse,
  setupHookTest,
} from './test-helpers';

const mockApiFetch = jest.fn();
jest.mock('@/utils/api', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const mockGetToken = jest.fn();
jest.mock('./useAuth', () => ({
  ...jest.requireActual('./useAuth'),
  getToken: () => mockGetToken(),
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

const mockWatchlistProperties: WatchlistProperty[] = [
  {
    ...mockProperties[0],
    watchlist_id: 10,
  },
  {
    ...mockProperties[1],
    watchlist_id: 11,
  },
];

describe('useWatchList', () => {
  beforeEach(setupHookTest);

  it('fetches watchlist when user is authenticated', async () => {
    mockGetToken.mockReturnValue('test-token');
    mockApiFetch.mockResolvedValue(
      createSuccessResponse({
        properties: mockWatchlistProperties,
        count: 2,
      })
    );

    const { result } = renderHookWithQueryClient(() => useWatchList());

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(mockApiFetch).toHaveBeenCalledWith('/watchlists');
    expect(result.current.data?.properties).toEqual(mockWatchlistProperties);
    expect(result.current.data?.count).toBe(2);
  });

  it('does not fetch when user is not authenticated', () => {
    mockGetToken.mockReturnValue(null);

    const { result } = renderHookWithQueryClient(() => useWatchList());

    expect(result.current.isFetching).toBe(false);
    expect(mockApiFetch).not.toHaveBeenCalled();
  });


  it('handles API errors', async () => {
    mockGetToken.mockReturnValue('test-token');

    mockApiFetch.mockResolvedValue(createErrorResponse());

    const { result } = renderHookWithQueryClient(() => useWatchList());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe('Failed to fetch watchlist');
  });

  it('uses correct query key', () => {
    mockGetToken.mockReturnValue('test-token');

    const queryClient = createTestQueryClient();
    renderHookWithQueryClient(() => useWatchList(), { queryClient });

    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    expect(queries[0]?.queryKey).toEqual(['watchlists']);
  });

  it('handles empty watchlist', async () => {
    mockGetToken.mockReturnValue('test-token');

    mockApiFetch.mockResolvedValue(
      createSuccessResponse({
        properties: [],
        count: 0,
      })
    );

    const { result } = renderHookWithQueryClient(() => useWatchList());

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.properties).toEqual([]);
    expect(result.current.data?.count).toBe(0);
  });
});

describe('useAddToWatchlist', () => {
  beforeEach(setupHookTest);

  it('successfully adds property to watchlist and invalidates queries', async () => {
    const mockResponse = {
      id: 12,
      property_id: 1,
      user_id: 1,
    };

    mockApiFetch.mockResolvedValue(createSuccessResponse(mockResponse));

    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHookWithQueryClient(() => useAddToWatchlist(), { queryClient });

    await result.current.mutateAsync(1);

    expect(mockApiFetch).toHaveBeenCalledWith('/watchlists', {
      method: 'POST',
      body: JSON.stringify({
        watchlist: { property_id: 1 },
      }),
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['watchlists'] });
  });

  it('throws error when API call fails', async () => {
    mockApiFetch.mockResolvedValue(createErrorResponse({ error: 'Property is already in your watchlist' }));

    const { result } = renderHookWithQueryClient(() => useAddToWatchlist());

    await expect(result.current.mutateAsync(1)).rejects.toThrow(
      'Property is already in your watchlist'
    );
  });

  it('throws generic error when error message is missing', async () => {
    mockApiFetch.mockResolvedValue(createErrorResponse());

    const { result } = renderHookWithQueryClient(() => useAddToWatchlist());

    await expect(result.current.mutateAsync(1)).rejects.toThrow('Failed to add to watchlist');
  });
});

describe('useRemoveFromWatchlist', () => {
  beforeEach(setupHookTest);

  it('successfully removes property from watchlist and invalidates queries', async () => {
    mockApiFetch.mockResolvedValue(createSuccessResponse({}));

    const queryClient = createTestQueryClient();
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHookWithQueryClient(() => useRemoveFromWatchlist(), { queryClient });

    await result.current.mutateAsync(10);

    expect(mockApiFetch).toHaveBeenCalledWith('/watchlists/10', {
      method: 'DELETE',
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['watchlists'] });
  });

  it('throws error when API call fails', async () => {
    mockApiFetch.mockResolvedValue(createErrorResponse({ error: 'Watchlist item not found' }));

    const { result } = renderHookWithQueryClient(() => useRemoveFromWatchlist());

    await expect(result.current.mutateAsync(10)).rejects.toThrow('Watchlist item not found');
  });

  it('throws generic error when error message is missing', async () => {
    mockApiFetch.mockResolvedValue(createErrorResponse());

    const { result } = renderHookWithQueryClient(() => useRemoveFromWatchlist());

    await expect(result.current.mutateAsync(10)).rejects.toThrow('Failed to remove from watchlist');
  });
});

