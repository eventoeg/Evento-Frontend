import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '@/shared/lib/env';
import type { ApiResponse } from '@/shared/types/api';

let currentAccessToken: string | null = null;

export function setAccessToken(token: string | null) {
  currentAccessToken = token;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// --- Refresh-token queue -------------------------------------------------
// A single in-flight refresh promise; concurrent 401s queue behind it.
let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const refreshToken =
    typeof window !== 'undefined' ? sessionStorage.getItem('refresh_token') : null;
  if (!refreshToken) return null;

  try {
    const res = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string; user: unknown }>>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
    );
    if (res.data?.success && res.data.data) {
      const { accessToken, refreshToken: newRefreshToken } = res.data.data as {
        accessToken: string;
        refreshToken: string;
      };
      sessionStorage.setItem('refresh_token', newRefreshToken);
      setAccessToken(accessToken);
      // Broadcast new token to other tabs
      try {
        const bc = new BroadcastChannel('auth');
        bc.postMessage({ type: 'token_refreshed', accessToken });
        bc.close();
      } catch {}
      return accessToken;
    }
  } catch {}
  return null;
}

function scheduleRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = doRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}
// -------------------------------------------------------------------------

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = currentAccessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retried?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retried) {
      originalRequest._retried = true;

      const newToken = await scheduleRefresh();

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }

      // Refresh failed — log out
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('refresh_token');
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }

    if (error.response?.status === 403) {
      console.warn('Access forbidden:', error.response.data?.message);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
