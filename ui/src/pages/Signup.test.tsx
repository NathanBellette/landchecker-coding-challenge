import { screen, renderWithProviders } from '@/test-utils.tsx';
import userEvent from '@testing-library/user-event';
import Signup from './Signup.tsx';
import { createMockMutation } from '@/test-utils.tsx';

const mockNavigate = jest.fn();
const mockUseSignup = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@/hooks/useAuth.ts', () => ({
  useSignup: () => mockUseSignup(),
}));

describe('Signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSignup.mockReturnValue(createMockMutation());
  });

  it('renders SignupCard component', () => {
    renderWithProviders(<Signup />);
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
  });

  it('navigates to login page on successful signup', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseSignup.mockReturnValue(createMockMutation({ mutateAsync: mockMutateAsync }));

    renderWithProviders(<Signup />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    const user = userEvent.setup();
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'StrongPassword123!');
    await user.type(confirmPasswordInput, 'StrongPassword123!');
    await user.click(submitButton);

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});

