import { screen } from '@/test-utils.tsx';
import { renderWithProviders } from '@/test-utils.tsx';
import userEvent from '@testing-library/user-event';
import SelectField from './SelectField.tsx';

describe('SelectField', () => {
  const mockOptions = [
    { value: '', label: 'Any' },
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
  ];

  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with label and options', () => {
    renderWithProviders(
      <SelectField
        label="Property Type"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    expect(screen.getByText('Property Type')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Any')).toBeInTheDocument();
    expect(screen.getByText('House')).toBeInTheDocument();
    expect(screen.getByText('Apartment')).toBeInTheDocument();
  });

  it('displays the selected value', () => {
    renderWithProviders(
      <SelectField
        label="Property Type"
        value="house"
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('house');
  });

  it('calls onChange when value changes', async () => {
    renderWithProviders(
      <SelectField
        label="Property Type"
        value=""
        onChange={mockOnChange}
        options={mockOptions}
      />
    );

    const select = screen.getByRole('combobox');
    const user = userEvent.setup();
    await user.selectOptions(select, 'apartment');

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('apartment');
  });
});

