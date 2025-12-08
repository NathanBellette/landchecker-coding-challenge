import React from 'react';
import { render, type RenderOptions, renderHook, type RenderHookOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

/**
 * Render function with QueryClientProvider, Router, and ChakraProvider
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    queryClient?: QueryClient;
    initialEntries?: string[];
  }
) => {
  const {
    queryClient = createTestQueryClient(),
    initialEntries,
    ...renderOptions
  } = options || {};

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <ChakraProvider value={defaultSystem}>
        {initialEntries ? (
          <MemoryRouter initialEntries={initialEntries}>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </MemoryRouter>
        ) : (
          <BrowserRouter>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </BrowserRouter>
        )}
      </ChakraProvider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};


export * from '@testing-library/react';

/**
 * Render hook with QueryClientProvider
 */
export const renderHookWithQueryClient = <T,>(
  hook: () => T,
  options?: Omit<RenderHookOptions<T>, 'wrapper'> & {
    queryClient?: QueryClient;
  }
) => {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options || {};

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return renderHook(hook, { wrapper, ...renderOptions });
};

export const createMockMutation = (overrides?: {
  mutateAsync?: jest.Mock;
  isPending?: boolean;
}) => {
  return {
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
    ...overrides,
  };
};

export const createMockQuery = <T = unknown>(overrides?: {
  data?: T;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: Error | null;
}) => {
  return {
    data: undefined,
    isLoading: false,
    isFetching: false,
    error: null,
    ...overrides,
  };
};

export const createMockInfiniteQuery = <T = unknown>(overrides?: {
  data?: { pages: T[] };
  isLoading?: boolean;
  error?: Error | null;
  fetchNextPage?: jest.Mock;
  hasNextPage?: boolean;
}) => {
  return {
    data: undefined,
    isLoading: false,
    error: null,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    ...overrides,
  };
};

export const setupLocalStorageMock = () => {
  let store: Record<string, string> = {};

  const localStorageMock = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  return localStorageMock;
};

