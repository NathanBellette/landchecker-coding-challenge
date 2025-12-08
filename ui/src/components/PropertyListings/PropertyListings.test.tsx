import { screen, renderWithProviders, createMockQuery, createMockInfiniteQuery, createMockMutation } from '@/test-utils.tsx';
import PropertyListings from './PropertyListings.tsx';
import type { Property } from '@/interfaces';

const mockGetToken = jest.fn();
const mockUseProperties = jest.fn();
const mockUseWatchList = jest.fn();
const mockUseAddToWatchlist = jest.fn();
const mockUseRemoveFromWatchlist = jest.fn();

jest.mock('@/hooks/useAuth.ts', () => ({
  getToken: () => mockGetToken(),
}));

jest.mock('@/hooks/useProperties.ts', () => ({
  useProperties: () => mockUseProperties(),
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

describe('PropertyListings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetToken.mockReturnValue(null);
    mockUseWatchList.mockReturnValue(createMockQuery({ data: { properties: [] } }));
    mockUseAddToWatchlist.mockReturnValue(createMockMutation());
    mockUseRemoveFromWatchlist.mockReturnValue(createMockMutation());
    mockUseProperties.mockReturnValue(
      createMockInfiniteQuery({
        data: { pages: [{ properties: mockProperties }] },
      })
    );
  });

  it('displays loading state', () => {
    mockUseProperties.mockReturnValue(createMockInfiniteQuery({ isLoading: true }));

    renderWithProviders(<PropertyListings />);

    expect(screen.getByTestId('property-listings-loading')).toHaveTextContent('Loading properties...');
  });

  it('displays error state', () => {
    const errorMessage = 'Failed to fetch properties';
    mockUseProperties.mockReturnValue(
      createMockInfiniteQuery({ error: { message: errorMessage } as Error })
    );

    renderWithProviders(<PropertyListings />);

    const errorBox = screen.getByTestId('property-listings-error');
    expect(errorBox).toHaveTextContent(`Error loading properties: ${errorMessage}`);
  });

  it('displays properties when data is loaded', () => {
    mockUseProperties.mockReturnValue(
      createMockInfiniteQuery({
        data: { pages: [{ properties: mockProperties }] },
      })
    );

    renderWithProviders(<PropertyListings />);

    expect(screen.getByTestId('property-listings-count')).toHaveTextContent('Found 2 properties');
    expect(screen.getByTestId('property-listings-grid')).toBeInTheDocument();
    expect(screen.getByText('House 1')).toBeInTheDocument();
    expect(screen.getByText('Apartment 1')).toBeInTheDocument();
  });

  it('displays empty state when no properties', () => {
    mockUseProperties.mockReturnValue(
      createMockInfiniteQuery({
        data: { pages: [{ properties: [] }] },
      })
    );

    renderWithProviders(<PropertyListings />);

    expect(screen.getByText('Found 0 properties')).toBeInTheDocument();
  });
});

