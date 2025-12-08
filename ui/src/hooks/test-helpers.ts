import { setupLocalStorageMock } from '@/test-utils.tsx';
import type { ErrorResponse } from '@/interfaces';

export const localStorageMock = setupLocalStorageMock();

export const createSuccessResponse = <T>(data: T): Response => {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  } as Response;
};

export const createErrorResponse = (error: ErrorResponse = {}): Response => {
  return {
    ok: false,
    status: 400,
    json: async () => error,
  } as Response;
};

export const createRejectedResponse = (error: Error) => Promise.reject(error);

export const setupHookTest = () => {
  jest.clearAllMocks();
  localStorageMock.clear();
};

