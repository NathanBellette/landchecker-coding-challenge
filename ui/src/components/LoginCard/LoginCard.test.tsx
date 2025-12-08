import { screen, renderWithProviders, createMockMutation } from '@/test-utils.tsx';
import userEvent from '@testing-library/user-event';
import LoginCard from './LoginCard.tsx';

const mockUseLogin = jest.fn();
const mockGetToken = jest.fn();

jest.mock('@/hooks/useAuth.ts', () => ({
  useLogin: () => mockUseLogin(),
  getToken: () => mockGetToken(),
}));

describe('LoginCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLogin.mockReturnValue(createMockMutation());
  });

  it('renders login form with all fields', () => {
    renderWithProviders(<LoginCard />);

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Please login below')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows error when attempting to submit an empty form', async () => {
    renderWithProviders(<LoginCard />);

    const submitButton = screen.getByRole('button', { name: /Log in/i });
    const user = userEvent.setup();
    await user.click(submitButton);

    expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
  });

  it('calls login mutation when form is submitted with valid inputs', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);

    mockUseLogin.mockReturnValue(createMockMutation({ mutateAsync: mockMutateAsync }));

    renderWithProviders(<LoginCard />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /Log in/i });

    const user = userEvent.setup();
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('displays error message when login fails', async () => {
    const errorMessage = 'Invalid email or password';
    const mockMutateAsync = jest.fn().mockRejectedValue(new Error(errorMessage));

    mockUseLogin.mockReturnValue(createMockMutation({ mutateAsync: mockMutateAsync }));

    renderWithProviders(<LoginCard />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /log in/i });

    const user = userEvent.setup();
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it('shows loading state when login is pending', () => {
    mockUseLogin.mockReturnValue(createMockMutation({ isPending: true }));

    renderWithProviders(<LoginCard />);

    const submitButton = screen.getByTestId('login-form-submit-button');
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
  });

  it('calls onSuccess callback when provided and login succeeds', async () => {
    const mockOnSuccess = jest.fn();
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseLogin.mockReturnValue(createMockMutation({ mutateAsync: mockMutateAsync }));

    renderWithProviders(<LoginCard onSuccess={mockOnSuccess} />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /log in/i });

    const user = userEvent.setup();
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });
});

