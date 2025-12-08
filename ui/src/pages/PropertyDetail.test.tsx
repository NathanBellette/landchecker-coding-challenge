import { screen, renderWithProviders, createMockQuery } from '@/test-utils.tsx';
import userEvent from '@testing-library/user-event';
import PropertyDetail from './PropertyDetail.tsx';
import type { Property, PropertyEvent } from '@/interfaces';

const mockNavigate = jest.fn();
const mockUsePropertyDetails = jest.fn();
const mockUsePropertyEvents = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1' }),
}));

jest.mock('@/hooks/usePropertyDetails', () => ({
  usePropertyDetails: () => mockUsePropertyDetails(),
  usePropertyEvents: () => mockUsePropertyEvents(),
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
    { id: 1, url: 'https://example.com/image1.jpg', position: 1 },
    { id: 2, url: 'https://example.com/image2.jpg', position: 2 },
  ],
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
    data: { sold_price: 500000, sold_date: '2024-01-20T00:00:00Z' },
    created_at: '2024-01-20T14:30:00Z',
  },
];

describe('PropertyDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePropertyDetails.mockReturnValue(createMockQuery({ data: mockProperty }));
    mockUsePropertyEvents.mockReturnValue(createMockQuery({ data: { events: mockEvents, count: 2 } }));
  });

  it('displays loading state when property is loading', () => {
    mockUsePropertyDetails.mockReturnValue(createMockQuery({ isLoading: true }));

    renderWithProviders(<PropertyDetail />);

    expect(screen.getByText('Loading property details...')).toBeInTheDocument();
  });

  it('displays error state when property fails to load', () => {
    const errorMessage = 'Failed to fetch property';
    mockUsePropertyDetails.mockReturnValue(
      createMockQuery({ error: { message: errorMessage } as Error })
    );

    renderWithProviders(<PropertyDetail />);

    expect(screen.getByText('Error loading property')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('navigates to home when back to properties button is clicked', async () => {
    const errorMessage = 'Property not found';
    mockUsePropertyDetails.mockReturnValue(
      createMockQuery({ error: { message: errorMessage } as Error })
    );

    renderWithProviders(<PropertyDetail />);

    const backButton = screen.getByRole('button', { name: /back to properties/i });
    const user = userEvent.setup();
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('displays property details when loaded', () => {
    renderWithProviders(<PropertyDetail />);

    expect(screen.getByText('Beautiful House')).toBeInTheDocument();
    expect(screen.getByText('$500,000')).toBeInTheDocument();
    expect(screen.getByText(/bedrooms/i)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('A lovely property in the suburbs')).toBeInTheDocument();
  });

  it('displays property images when available', () => {
    renderWithProviders(<PropertyDetail />);

    const images = screen.getAllByAltText('Beautiful House');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'https://example.com/image1.jpg');
    expect(images[1]).toHaveAttribute('src', 'https://example.com/image2.jpg');
  });

  it('displays property badges correctly', () => {
    renderWithProviders(<PropertyDetail />);

    expect(screen.getByText('house')).toBeInTheDocument();
    expect(screen.getByText('available')).toBeInTheDocument();
  });

  it('navigates back when back button is clicked', async () => {
    renderWithProviders(<PropertyDetail />);

    const backButton = screen.getByRole('button', { name: /back/i });
    const user = userEvent.setup();
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('renders PropertyHistory component with events', () => {
    renderWithProviders(<PropertyDetail />);

    expect(screen.getByText('Property History')).toBeInTheDocument();
    expect(screen.getByText('Price Changed')).toBeInTheDocument();
    expect(screen.getByText('Sold')).toBeInTheDocument();
  });
});

