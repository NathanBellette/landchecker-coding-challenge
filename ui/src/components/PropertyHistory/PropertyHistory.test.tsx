import { screen, renderWithProviders } from '@/test-utils.tsx';
import PropertyHistory from './PropertyHistory.tsx';
import type { PropertyEvent } from '@/interfaces';

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
    data: { sold_price: 500000, sold_date: '2024-01-20T00:00:00Z' },
    created_at: '2024-01-20T14:30:00Z',
  },
];

describe('PropertyHistory', () => {
  it('displays loading state when isLoading is true', () => {
    renderWithProviders(<PropertyHistory events={[]} isLoading={true} />);

    expect(screen.getByText('Loading events...')).toBeInTheDocument();
  });

  it('displays empty state when no events', () => {
    renderWithProviders(<PropertyHistory events={[]} isLoading={false} />);

    expect(screen.getByText('No events recorded for this property.')).toBeInTheDocument();
  });

  it('displays property events when loaded', () => {
    renderWithProviders(<PropertyHistory events={mockEvents} isLoading={false} />);

    expect(screen.getByText('Property History')).toBeInTheDocument();
    expect(screen.getByText('Price Changed')).toBeInTheDocument();
    expect(screen.getByText(/from \$450,000 to \$500,000/i)).toBeInTheDocument();
    expect(screen.getByText('Sold')).toBeInTheDocument();
  });


  it('displays event dates', () => {
    renderWithProviders(<PropertyHistory events={mockEvents} isLoading={false} />);

    const allText = screen.getByText('Property History').parentElement?.textContent ?? '';
    const dateMatches = allText.match(/\d{1,2}\/\d{1,2}\/\d{4}/g) || [];
    expect(dateMatches.length).toBeGreaterThanOrEqual(2);
  });
});

