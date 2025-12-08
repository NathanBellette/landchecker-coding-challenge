import { renderHookWithQueryClient, createTestQueryClient } from '@/test-utils.tsx';
import {
  getToken,
  setToken,
  removeToken,
  useLogin,
  useSignup,
  useLogout,
} from './useAuth';
import type { LoginCredentials, SignupCredentials } from '@/interfaces';
import {
  localStorageMock,
  createSuccessResponse,
  createErrorResponse,
  createRejectedResponse,
  setupHookTest,
} from './test-helpers';

const mockApiFetch = jest.fn();
jest.mock('@/utils/api', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

describe('useAuth utilities', () => {
  beforeEach(setupHookTest);

  describe('getToken', () => {
    it('returns null when no token is stored', () => {
      expect(getToken()).toBeNull();
    });

    it('returns the stored token', () => {
      localStorageMock.setItem('auth_token', 'test-token-123');
      expect(getToken()).toBe('test-token-123');
    });
  });

  describe('setToken', () => {
    it('stores the token in localStorage', () => {
      setToken('new-token-456');
      expect(localStorageMock.getItem('auth_token')).toBe('new-token-456');
    });
  });

  describe('removeToken', () => {
    it('removes the token from localStorage', () => {
      localStorageMock.setItem('auth_token', 'test-token');
      removeToken();
      expect(localStorageMock.getItem('auth_token')).toBeNull();
    });
  });
});

describe('useLogin', () => {
  beforeEach(setupHookTest);

  it('stores token open successful login', async () => {
    const credentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockResponse = {
      token: 'jwt-token-123',
      user: { id: 1, email: 'test@example.com' },
    };

    mockApiFetch.mockResolvedValue(createSuccessResponse(mockResponse));

    const queryClient = createTestQueryClient();
    const { result } = renderHookWithQueryClient(() => useLogin(), { queryClient });

    await result.current.mutateAsync(credentials);

    expect(mockApiFetch).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    expect(localStorageMock.getItem('auth_token')).toBe('jwt-token-123');
  });

  it('throws error when login fails', async () => {
    const credentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    mockApiFetch.mockResolvedValue(createErrorResponse({ error: 'Invalid credentials' }));

    const { result } = renderHookWithQueryClient(() => useLogin());

    await expect(result.current.mutateAsync(credentials)).rejects.toThrow('Invalid credentials');
  });

  it('throws generic error when error message is missing', async () => {
    const credentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    mockApiFetch.mockResolvedValue(createErrorResponse());

    const { result } = renderHookWithQueryClient(() => useLogin());
    await expect(result.current.mutateAsync(credentials)).rejects.toThrow('Login failed');
  });
});

describe('useSignup', () => {
  beforeEach(setupHookTest);

  it('successfully signs up and stores user data in local storage', async () => {
    const credentials: SignupCredentials = {
      email: 'newuser@example.com',
      password: 'StrongPassword123!',
    };

    const mockUser = {
      id: 2,
      email: 'newuser@example.com',
    };

    mockApiFetch.mockResolvedValue(createSuccessResponse(mockUser));

    const queryClient = createTestQueryClient();
    const { result } = renderHookWithQueryClient(() => useSignup(), { queryClient });

    const user = await result.current.mutateAsync(credentials);

    expect(mockApiFetch).toHaveBeenCalledWith('/users', {
      method: 'POST',
      body: JSON.stringify({ user: credentials }),
    });

    expect(user).toEqual(mockUser);
    expect(queryClient.getQueryData(['user'])).toEqual(mockUser);
  });

  it('throws error with formatted error message when signup fails', async () => {
    const credentials: SignupCredentials = {
      email: 'existing@example.com',
      password: 'password123',
    };

    mockApiFetch.mockResolvedValue(
      createErrorResponse({
        errors: {
          email: ['has already been taken'],
          password: ['is too short'],
        },
      })
    );

    const { result } = renderHookWithQueryClient(() => useSignup());

    await expect(result.current.mutateAsync(credentials)).rejects.toThrow(
      'email: has already been taken; password: is too short'
    );
  });

  it('throws generic error when no error message is provided', async () => {
    const credentials: SignupCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    mockApiFetch.mockResolvedValue(createErrorResponse());

    const { result } = renderHookWithQueryClient(() => useSignup());

    await expect(result.current.mutateAsync(credentials)).rejects.toThrow('Signup failed');
  });
});

describe('useLogout', () => {
  beforeEach(setupHookTest);

  it('successfully logs out and clears token', async () => {
    localStorageMock.setItem('auth_token', 'existing-token');

    mockApiFetch.mockResolvedValue(createSuccessResponse({}));

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['user'], { id: 1, email: 'test@example.com' });

    const { result } = renderHookWithQueryClient(() => useLogout(), { queryClient });

    await result.current.mutateAsync();

    expect(mockApiFetch).toHaveBeenCalledWith('/auth/logout', {
      method: 'DELETE',
    });

    expect(localStorageMock.getItem('auth_token')).toBeNull();
    expect(queryClient.getQueryData(['user'])).toBeUndefined();
  });

  it('clears token even when logout API call fails', async () => {
    localStorageMock.setItem('auth_token', 'existing-token');

    mockApiFetch.mockImplementation(() => createRejectedResponse(new Error('Network error')));

    const queryClient = createTestQueryClient();
    const { result } = renderHookWithQueryClient(() => useLogout(), { queryClient });

    await result.current.mutateAsync();

    expect(localStorageMock.getItem('auth_token')).toBeNull();
    expect(queryClient.getQueryData(['user'])).toBeUndefined();
  });

  it('does not call API when no token exists', async () => {
    const { result } = renderHookWithQueryClient(() => useLogout());

    await result.current.mutateAsync();

    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('clears all query cache on logout', async () => {
    localStorageMock.setItem('auth_token', 'existing-token');

    mockApiFetch.mockResolvedValue(createSuccessResponse({}));

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['user'], { id: 1, email: 'test@example.com' });
    queryClient.setQueryData(['properties'], { pages: [] });
    queryClient.setQueryData(['watchlists'], { properties: [] });

    const clearSpy = jest.spyOn(queryClient, 'clear');

    const { result } = renderHookWithQueryClient(() => useLogout(), { queryClient });

    await result.current.mutateAsync();

    expect(clearSpy).toHaveBeenCalled();
  });
});

