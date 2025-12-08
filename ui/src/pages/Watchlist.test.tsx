import { screen, renderWithProviders, createMockQuery } from '@/test-utils.tsx';
import userEvent from '@testing-library/user-event';
import Watchlist from './Watchlist.tsx';
import type { Property } from '@/interfaces';
import { createMockMutation } from '@/test-utils.tsx';

const mockNavigate = jest.fn();
const mockGetToken = jest.fn();
const mockUseWatchList = jest.fn();
const mockUseAddToWatchlist = jest.fn();
const mockUseRemoveFromWatchlist = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@/hooks/useAuth.ts', () => ({
  getToken: () => mockGetToken(),
}));

jest.mock('@/hooks/useWatchList.ts', () => ({
  useWatchList: () => mockUseWatchList(),
  useAddToWatchlist: () => mockUseAddToWatchlist(),
  useRemoveFromWatchlist: () => mockUseRemoveFromWatchlist(),
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

describe('Watchlist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetToken.mockReturnValue(null);
    mockUseWatchList.mockReturnValue(createMockQuery({ data: { properties: [], count: 0 } }));
    mockUseAddToWatchlist.mockReturnValue(createMockMutation());
    mockUseRemoveFromWatchlist.mockReturnValue(createMockMutation());
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockGetToken.mockReturnValue(null);
    });

    it('displays login prompt', () => {
      renderWithProviders(<Watchlist />);

      expect(screen.getByText('My Watchlist')).toBeInTheDocument();
      expect(screen.getByText('Please log in to view your watchlist')).toBeInTheDocument();
      expect(screen.getByText(/you need to be logged in to save and view properties/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    it('navigates to login page when login button is clicked', async () => {
      renderWithProviders(<Watchlist />);

      const loginButton = screen.getByRole('button', { name: /log in/i });
      const user = userEvent.setup();
      await user.click(loginButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockGetToken.mockReturnValue('mock-token');
    });

    it('displays loading state', () => {
      mockUseWatchList.mockReturnValue(createMockQuery({ isLoading: true }));

      renderWithProviders(<Watchlist />);

      expect(screen.getByText('Loading watchlist...')).toBeInTheDocument();
    });

    it('displays error state', () => {
      const errorMessage = 'Failed to fetch watchlist';
      mockUseWatchList.mockReturnValue(
        createMockQuery({ error: { message: errorMessage } as Error })
      );

      renderWithProviders(<Watchlist />);

      expect(screen.getByText(`Error loading watchlist: ${errorMessage}`)).toBeInTheDocument();
    });

    it('displays empty state when no properties', () => {
      mockUseWatchList.mockReturnValue(createMockQuery({ data: { properties: [], count: 0 } }));

      renderWithProviders(<Watchlist />);

      expect(screen.getByText('My Watchlist')).toBeInTheDocument();
      expect(screen.getByText('Your watchlist is empty')).toBeInTheDocument();
      expect(screen.getByText(/start adding properties to your watchlist/i)).toBeInTheDocument();
    });

    it('displays properties when watchlist has items', () => {
      mockUseWatchList.mockReturnValue(
        createMockQuery({
          data: {
            properties: mockProperties.map(p => ({ ...p, watchlist_id: p.id + 10 })),
            count: 2,
          },
        })
      );

      renderWithProviders(<Watchlist />);

      expect(screen.getByText('My Watchlist')).toBeInTheDocument();
      expect(screen.getByText('2 properties in your watchlist')).toBeInTheDocument();
      expect(screen.getByText('House 1')).toBeInTheDocument();
      expect(screen.getByText('Apartment 1')).toBeInTheDocument();
    });

    it('displays singular form for single property', () => {
      mockUseWatchList.mockReturnValue(
        createMockQuery({
          data: {
            properties: [{ ...mockProperties[0], watchlist_id: 10 }],
            count: 1,
          },
        })
      );

      renderWithProviders(<Watchlist />);

      expect(screen.getByText('1 property in your watchlist')).toBeInTheDocument();
    });
  });
});

