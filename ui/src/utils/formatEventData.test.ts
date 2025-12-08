import { formatEventData } from './formatEventData';

describe('formatEventData', () => {
  describe('price_changed event', () => {
    it('formats price changed events correctly', () => {
      const result = formatEventData('price_changed', {
        old_price: 1000000,
        new_price: 1500000,
      });

      expect(result.label).toBe('Price Changed');
      expect(result.details).toBe('From $1,000,000 to $1,500,000');
    });

    it('handles zero prices', () => {
      const result = formatEventData('price_changed', {
        old_price: 0,
        new_price: 100000,
      });

      expect(result.label).toBe('Price Changed');
      expect(result.details).toBe('From $0 to $100,000');
    });
  });

  describe('sold event', () => {
    it('formats sold events correctly', () => {
      const result = formatEventData('sold', {
        sold_price: 500000,
        sold_date: '2024-01-20T00:00:00Z',
      });

      expect(result.label).toBe('Sold');
      expect(result.details).toContain('Sold for $500,000');
      expect(result.details).toContain('1/20/2024'); // Date format may vary by locale
    });
  });

  describe('unknown event types', () => {
    it('formats unknown event types with default formatting', () => {
      const result = formatEventData('custom_event', {
        key: 'value',
        number: 123,
      });

      expect(result.label).toBe('Custom Event');
      expect(result.details).toBe('{"key":"value","number":123}');
    });
  });

  describe('edge cases', () => {
    it('handles empty data object', () => {
      const result = formatEventData('price_changed', {});

      expect(result.label).toBe('Price Changed');
      expect(result.details).toBe('From $0 to $0');
    });

    it('handles missing price fields', () => {
      const result = formatEventData('price_changed', {
        old_price: undefined,
        new_price: null,
      });

      expect(result.label).toBe('Price Changed');
      expect(result.details).toBe('From $0 to $0');
    });
  });
});

