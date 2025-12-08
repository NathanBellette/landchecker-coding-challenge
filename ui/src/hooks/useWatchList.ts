import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from "@/utils/api";
import { getToken } from './useAuth';
import type { WatchlistProperty } from '@/interfaces';

export interface WatchListResponse {
    properties: WatchlistProperty[];
    count: number;
}

export const useWatchList = () => {
    const token = getToken();

    return useQuery({
        queryKey: ['watchlists'],
        queryFn: async (): Promise<WatchListResponse> => {
            const response = await apiFetch('/watchlists');
            if (!response.ok) {
                throw new Error('Failed to fetch watchlist');
            }

            return response.json();
        },
        enabled: !!token,
    });
};

export const useAddToWatchlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (propertyId: number) => {
            const response = await apiFetch('/watchlists', {
                method: 'POST',
                body: JSON.stringify({
                    watchlist: { property_id: propertyId }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add to watchlist');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watchlists'] });
        }
    });
};

export const useRemoveFromWatchlist = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (watchListId: number) => {
            const response = await apiFetch(`/watchlists/${watchListId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to remove from watchlist');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watchlists'] });
        }
    });
};