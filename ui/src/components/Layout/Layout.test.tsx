import { screen, renderWithProviders, createMockMutation } from '@/test-utils.tsx';
import userEvent from '@testing-library/user-event';
import Layout from './Layout.tsx';

const mockGetToken = jest.fn();
const mockUseLogout = jest.fn();

jest.mock('@/hooks/useAuth.ts', () => ({
  getToken: () => mockGetToken(),
  useLogout: () => mockUseLogout(),
}));

describe('Layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetToken.mockReturnValue(null);
    mockUseLogout.mockReturnValue(createMockMutation());
  });

  it('renders children correctly', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    expect(screen.getByText('Test Content')).toHaveTextContent('Test Content');
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockGetToken.mockReturnValue(null);
    });

    it('shows Login and Sign Up buttons', () => {
      renderWithProviders(<Layout><div>Content</div></Layout>);

      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockGetToken.mockReturnValue('mock-token');
    });

    it('shows Logout button and hides login/signup buttons', () => {
      renderWithProviders(<Layout><div>Content</div></Layout>);
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /log in/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /sign up/i })).not.toBeInTheDocument();
    });

    it('disables the logout button when logout is pending', () => {
      mockUseLogout.mockReturnValue(createMockMutation({ isPending: true }));

      renderWithProviders(<Layout><div>Content</div></Layout>);

      const logoutButton = screen.getByTestId('layout-logout-button');
      expect(logoutButton).toBeDisabled();
    });

    it('calls logout when Logout button is clicked', async () => {
      const mockMutateAsync = jest.fn().mockResolvedValue(undefined);

      mockUseLogout.mockReturnValue(createMockMutation({ mutateAsync: mockMutateAsync }));

      renderWithProviders(<Layout><div>Content</div></Layout>);

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      const user = userEvent.setup();
      await user.click(logoutButton);

      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('tab rendering', () => {
    it('renders both navigation tabs', () => {
      renderWithProviders(<Layout><div>Content</div></Layout>);

      expect(screen.getByText('All Properties')).toBeInTheDocument();
      expect(screen.getByText('My Watchlist')).toBeInTheDocument();
    });
  });
});
