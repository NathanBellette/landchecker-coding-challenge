import { screen, renderWithProviders, createMockMutation } from '@/test-utils.tsx';
import userEvent from '@testing-library/user-event';
import SignupCard from './SignupCard.tsx';

const mockUseSignup = jest.fn();

jest.mock('@/hooks/useAuth.ts', () => ({
  useSignup: () => mockUseSignup(),
}));

describe('SignupCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSignup.mockReturnValue(createMockMutation());
  });

  it('renders signup form with all fields', () => {
    renderWithProviders(<SignupCard />);

    expect(screen.getAllByText('Sign up')[0]).toBeInTheDocument();
    expect(screen.getByText('Create a new account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();

    expect(screen.getByTestId('signup-form-submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('signup-form-cancel-button')).toBeInTheDocument();
  });

  it('shows error when submitting empty form', async () => {
    renderWithProviders(<SignupCard />);

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    const user = userEvent.setup();
    await user.click(submitButton);

    expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    renderWithProviders(<SignupCard />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    const user = userEvent.setup();
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'differentpassword');
    await user.click(submitButton);

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  it('shows error when password is too weak', async () => {
    renderWithProviders(<SignupCard />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    const user = userEvent.setup();
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'weak'); // Too weak
    await user.type(confirmPasswordInput, 'weak');
    await user.click(submitButton);

    expect(screen.getByText(/password is too weak/i)).toBeInTheDocument();
  });

  it('calls signup mutation when form is submitted with valid data', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseSignup.mockReturnValue(createMockMutation({ mutateAsync: mockMutateAsync }));

    renderWithProviders(<SignupCard />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    const user = userEvent.setup();
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'StrongPassword123!');
    await user.type(confirmPasswordInput, 'StrongPassword123!');
    await user.click(submitButton);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'StrongPassword123!',
    });
  });

  it('displays error message when signup fails', async () => {
    const errorMessage = 'Email already exists';
    const mockMutateAsync = jest.fn().mockRejectedValue(new Error(errorMessage));
    mockUseSignup.mockReturnValue(createMockMutation({ mutateAsync: mockMutateAsync }));

    renderWithProviders(<SignupCard />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    const user = userEvent.setup();
    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'StrongPassword123!');
    await user.type(confirmPasswordInput, 'StrongPassword123!');
    await user.click(submitButton);

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it('shows loading state when signup is pending', () => {
    mockUseSignup.mockReturnValue(createMockMutation({ isPending: true }));

    renderWithProviders(<SignupCard />);

    const submitButton = screen.getByTestId('signup-form-submit-button');

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Signing up...');
  });

  it('calls onSuccess callback when provided and signup succeeds', async () => {
    const mockOnSuccess = jest.fn();
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseSignup.mockReturnValue(createMockMutation({ mutateAsync: mockMutateAsync }));

    renderWithProviders(<SignupCard onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    const user = userEvent.setup();
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'StrongPassword123!');
    await user.type(confirmPasswordInput, 'StrongPassword123!');
    await user.click(submitButton);
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });
});

