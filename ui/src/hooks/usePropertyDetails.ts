import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/utils/api';
import type { Property, PropertyEvent } from '@/interfaces';

export interface PropertyDetails extends Property {
}

export interface PropertyEventsResponse {
  events: PropertyEvent[];
  count: number;
}

export const usePropertyDetails = (propertyId: number | undefined) => {
  return useQuery({
    queryKey: ['property', propertyId],
    queryFn: async (): Promise<PropertyDetails> => {
      if (!propertyId) {
        throw new Error('Property ID is required');
      }
      
      const response = await apiFetch(`/properties/${propertyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch property details');
      }

      const data = await response.json();

      if (data.id) {
        return { ...data, id: typeof data.id === 'string' ? parseInt(data.id, 10) : data.id };
      }
      
      throw new Error('Invalid property data format');
    },
    enabled: !!propertyId,
  });
};

export const usePropertyEvents = (propertyId: number | undefined) => {
  return useQuery({
    queryKey: ['property-events', propertyId],
    queryFn: async (): Promise<PropertyEventsResponse> => {
      if (!propertyId) {
        throw new Error('Property ID is required');
      }
      
      const response = await apiFetch(`/properties/${propertyId}/property_events`);
      if (!response.ok) {
        throw new Error('Failed to fetch property events');
      }

      return response.json();
    },
    enabled: !!propertyId,
  });
};

