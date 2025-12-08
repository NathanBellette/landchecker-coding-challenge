import { screen, renderWithProviders } from '@/test-utils.tsx';
import userEvent from '@testing-library/user-event';
import Login from './Login.tsx';
import { createMockMutation } from '@/test-utils.tsx';

const mockNavigate = jest.fn();
const mockUseLogin = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@/hooks/useAuth.ts', () => ({
  useLogin: () => mockUseLogin(),
}));

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLogin.mockReturnValue(createMockMutation());
  });

  it('renders LoginCard component', () => {
    renderWithProviders(<Login />);
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('navigates to home page on successful login', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseLogin.mockReturnValue(createMockMutation({ mutateAsync: mockMutateAsync }));

    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /log in/i });

    const user = userEvent.setup();
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

