import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/utils/api';
import type { User, LoginCredentials, SignupCredentials, AuthResponse } from '@/interfaces';

const TOKEN_KEY = 'auth_token';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(['user'], data.user);
    },
  });
};

export const useSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: SignupCredentials): Promise<User> => {
      const response = await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({
          user: credentials,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.errors 
          ? Object.entries(error.errors).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; ')
          : error.error || 'Signup failed';
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['user'], user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const token = getToken();
      if (token) {
        try {
          await apiFetch('/auth/logout', {
            method: 'DELETE',
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      }
    },
    onSuccess: () => {
      removeToken();
      queryClient.setQueryData(['user'], null);
      queryClient.clear();
    },
  });
};

