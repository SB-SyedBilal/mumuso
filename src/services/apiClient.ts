import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ApiResponse } from '../types';

// For physical devices: use `adb reverse tcp:3000 tcp:3000` so localhost works
// For Android emulator: 10.0.2.2 maps to host — but localhost also works with adb reverse
// For iOS simulator: localhost works directly
const BASE_URL = Platform.OS === 'android'
  ? 'http://localhost:3000/api/v1'
  : 'http://localhost:3000/api/v1';

// Timeout for all API requests (prevents infinite spinner)
const REQUEST_TIMEOUT_MS = 15000;

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
};

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export async function storeTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
    AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
    AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
  ]);
}

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return null;

      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const json = await response.json();
      if (json.success && json.data?.access_token) {
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, json.data.access_token);
        return json.data.access_token as string;
      }
      // Refresh failed — clear tokens
      await clearTokens();
      return null;
    } catch {
      await clearTokens();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, unknown>;
  query?: Record<string, string | undefined>;
  auth?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, query, auth = true } = options;

  // Build URL with query params
  let url = `${BASE_URL}${endpoint}`;
  if (query) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.append(key, value);
    });
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = await getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      let response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      // If 401, try refresh once
      if (response.status === 401 && auth) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
          });
        } else {
          // Token refresh failed — return the 401 error
          const errorJson = await response.json().catch(() => ({}));
          return {
            success: false,
            error: errorJson.error || { code: 'TOKEN_EXPIRED', message: 'Session expired. Please login again.' },
          };
        }
      }

      const json = await response.json();
      return json as ApiResponse<T>;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error: unknown) {
    // Timeout — AbortController fired
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: {
          code: 'TIMEOUT',
          message: 'Request timed out. Please check that the server is running.',
        },
      };
    }
    // Network error — server unreachable
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to server. Please check your internet connection.',
      },
    };
  }
}

// ─── Convenience methods ────────────────────────────────────────────────────

export const api = {
  get: <T>(endpoint: string, query?: Record<string, string | undefined>, auth = true) =>
    apiRequest<T>(endpoint, { method: 'GET', query, auth }),

  post: <T>(endpoint: string, body?: Record<string, unknown>, auth = true) =>
    apiRequest<T>(endpoint, { method: 'POST', body, auth }),

  put: <T>(endpoint: string, body?: Record<string, unknown>, auth = true) =>
    apiRequest<T>(endpoint, { method: 'PUT', body, auth }),

  delete: <T>(endpoint: string, body?: Record<string, unknown>, auth = true) =>
    apiRequest<T>(endpoint, { method: 'DELETE', body, auth }),
};
