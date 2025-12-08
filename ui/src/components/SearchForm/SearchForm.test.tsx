import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '@/test-utils.tsx';
import SearchForm from './SearchForm.tsx';

describe('SearchForm', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('renders all form fields', () => {
    renderWithProviders(<SearchForm onSearch={mockOnSearch} />);

    expect(screen.getByText('Property Type')).toBeInTheDocument();
    expect(screen.getByText('Min Bedrooms')).toBeInTheDocument();
    expect(screen.getByText('Max Bedrooms')).toBeInTheDocument();
    expect(screen.getByText('Min Price')).toBeInTheDocument();
    expect(screen.getByText('Max Price')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('calls onSearch when form is submitted', async () => {

    renderWithProviders(<SearchForm onSearch={mockOnSearch} />);

    const selects = screen.getAllByRole('combobox');
    const user = userEvent.setup();
    await user.selectOptions(selects[0], 'house');

    const submitButton = screen.getByRole('button', { name: /search/i });
    await user.click(submitButton);

    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it('resets form when reset button is clicked', async () => {
    renderWithProviders(<SearchForm onSearch={mockOnSearch} />);

    const selects = screen.getAllByRole('combobox');
    const user = userEvent.setup();
    await user.selectOptions(selects[0], 'apartment');

    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);

    expect(mockOnSearch).toHaveBeenCalledTimes(1);

    expect(mockOnSearch).toHaveBeenNthCalledWith(1, {
      property_type: '',
      min_bedrooms: '',
      max_bedrooms: '',
      min_price: '',
      max_price: '',
    });
  });
});

