import { randomUUID } from 'expo-crypto';

import { createApiClient } from './client';

export const api = createApiClient({
  baseUrl: () => {
    const host = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '') ?? '';
    return host ? `${host.replace(/\/api\/v1$/, '')}/api/v1` : '';
  },
  createKey: randomUUID,
});
export { ApiError, errorMessage } from './errors';
export type * from './types';
