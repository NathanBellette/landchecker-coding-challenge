import { screen, renderWithProviders, createMockMutation } from '@/test-utils.tsx';
import userEvent from '@testing-library/user-event';
import PropertyCard from './PropertyCard.tsx';
import type { Property } from '@/interfaces';

const mockGetToken = jest.fn();
const mockUseAddToWatchlist = jest.fn();
const mockUseRemoveFromWatchlist = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@/hooks/useAuth.ts', () => ({
  getToken: () => mockGetToken(),
}));

jest.mock('@/hooks/useWatchList.ts', () => ({
  useAddToWatchlist: () => mockUseAddToWatchlist(),
  useRemoveFromWatchlist: () => mockUseRemoveFromWatchlist(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockProperty: Property = {
  id: 1,
  title: 'Beautiful House',
  description: 'A lovely property in the suburbs',
  price: 500000,
  formatted_price: '$500,000',
  bedrooms: 3,
  property_type: 'house',
  status: 'available',
  latitude: -37.8136,
  longitude: 144.9631,
  published_at: '2024-01-01T00:00:00Z',
  property_images: [
    { id: 1, url: 'https://example.com/image.jpg', position: 1 }
  ],
};

describe('PropertyCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetToken.mockReturnValue(null);
    mockUseAddToWatchlist.mockReturnValue(createMockMutation());
    mockUseRemoveFromWatchlist.mockReturnValue(createMockMutation());
  });

  it('renders property information correctly', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />);

    expect(screen.getByTestId('property-card-title')).toHaveTextContent('Beautiful House');
    expect(screen.getByTestId('property-card-description')).toHaveTextContent('A lovely property in the suburbs');
    expect(screen.getByTestId('property-card-price')).toHaveTextContent('$500,000');
    expect(screen.getByTestId('property-card-type')).toHaveTextContent('house');
  });

  it('displays property image when available', () => {
    renderWithProviders(<PropertyCard property={mockProperty} />);

    const image = screen.getByTestId('property-card-image');
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(image).toHaveAttribute('alt', 'Beautiful House');
  });

  it('displays "No image" when property has no images', () => {
    const propertyWithoutImages = {
      ...mockProperty,
      property_images: [],
    };

    renderWithProviders(<PropertyCard property={propertyWithoutImages} />);

    expect(screen.getByTestId('property-card-no-image')).toHaveTextContent('No image');
  });

  it('displays "No description" when description is missing', () => {
    const propertyWithoutDescription = {
      ...mockProperty,
      description: null,
    };

    renderWithProviders(<PropertyCard property={propertyWithoutDescription} />);

    expect(screen.getByText('No description')).toBeInTheDocument();
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockGetToken.mockReturnValue(null);
    });

    it('shows popover content when watchlist button is clicked', async () => {
      renderWithProviders(<PropertyCard property={mockProperty} />);

      const popoverTrigger = screen.getByTestId('property-card-watchlist-button');
      const user = userEvent.setup();
      await user.click(popoverTrigger);
      
      const popoverText = await screen.findByText(/please log in to save properties/i);
      expect(popoverText).toBeInTheDocument();
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockGetToken.mockReturnValue('mock-token');
    });

    it('shows watchlist button when property is not in watchlist', () => {
      renderWithProviders(
        <PropertyCard 
          property={mockProperty}
          watchlistData={{ properties: [] }}
        />
      );

      const watchlistButton = screen.getByTestId('property-card-watchlist-button');
      expect(watchlistButton).not.toBeDisabled();
    });

    it('calls addToWatchlist when clicking watchlist button for unwatched property', async () => {
      const mockMutateAsync = jest.fn().mockResolvedValue(undefined);

      mockUseAddToWatchlist.mockReturnValue(createMockMutation({ mutateAsync: mockMutateAsync }));

      renderWithProviders(
        <PropertyCard 
          property={mockProperty}
          watchlistData={{ properties: [] }}
        />
      );

      const watchlistButton = screen.getByTestId('property-card-watchlist-button');
      const user = userEvent.setup();
      await user.click(watchlistButton);

      expect(mockMutateAsync).toHaveBeenCalledWith(1); // property id
    });

    it('calls removeFromWatchlist when clicking watchlist button for watched property', async () => {
      const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
      mockUseRemoveFromWatchlist.mockReturnValue(createMockMutation({ mutateAsync: mockMutateAsync }));

      renderWithProviders(
        <PropertyCard 
          property={mockProperty}
          watchlistData={{ 
            properties: [{ id: 1, watchlist_id: 10 }] 
          }}
        />
      );

      const watchlistButton = screen.getByTestId('property-card-watchlist-button');
      const user = userEvent.setup();
      await user.click(watchlistButton);
      expect(mockMutateAsync).toHaveBeenCalledWith(10); // watchlist_id
    });

    it('disables watchlist button when operation is pending', () => {
      mockUseAddToWatchlist.mockReturnValue(createMockMutation({ isPending: true }));

      renderWithProviders(
        <PropertyCard 
          property={mockProperty}
          watchlistData={{ properties: [] }}
          isLoadingWatchlist={false}
          isFetchingWatchlist={false}
        />
      );

      const watchlistButton = screen.getByTestId('property-card-watchlist-button');
      expect(watchlistButton).toBeDisabled();
    });

    it('disables watchlist button when watchlist data is loading', () => {
      renderWithProviders(
        <PropertyCard 
          property={mockProperty}
          watchlistData={undefined}
          isLoadingWatchlist={true}
          isFetchingWatchlist={false}
        />
      );

      const watchlistButton = screen.getByTestId('property-card-watchlist-button');
      expect(watchlistButton).toBeDisabled();
    });
  });
});

