import type { FormattedEventData } from '@/interfaces';

/**
 * Formats property event data for display
 * @param eventType - The type of event (e.g., 'price_changed', 'sold')
 * @param data - The event data object
 * @returns Formatted label and details string
 */
export const formatEventData = (
  eventType: string,
  data: Record<string, unknown>
): FormattedEventData => {
  switch (eventType) {
    case 'price_changed':
      return {
        label: 'Price Changed',
        details: `From $${Number(data.old_price || 0).toLocaleString()} to $${Number(data.new_price || 0).toLocaleString()}`,
      };
    case 'sold':
      return {
        label: 'Sold',
        details: `Sold for $${Number(data.sold_price).toLocaleString()} on ${new Date(data.sold_date as string).toLocaleDateString()}`,
      };
    default:
      return {
        label: eventType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        details: JSON.stringify(data),
      };
  }
};

