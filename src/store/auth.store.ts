import { create } from 'zustand';
import { User, UserRole } from '@/types';
import { authService } from '@/services/auth.service';
import { setAccessToken } from '@/lib/api-client';

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean; // Track if we've checked sessionStorage
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string, role?: UserRole) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>; // Rehydrate from sessionStorage
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
  trackId?: string;
  companyId?: string;
  graduationYear?: number;
}

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  // Rehydrate from sessionStorage on mount
  initialize: async () => {
    // Don't reinitialize if already done
    if (get().isInitialized) return;

    const refreshToken = typeof window !== 'undefined' ? sessionStorage.getItem('refresh_token') : null;

    if (!refreshToken) {
      set({ isInitialized: true, user: null, accessToken: null, isAuthenticated: false });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await authService.refresh({ refreshToken });

      if (response.success && response.data) {
        const { accessToken, refreshToken: newRefreshToken, user } = response.data;
        get().setTokens(accessToken, newRefreshToken, user.role);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      } else {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('refresh_token');
        }
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('refresh_token');
      }
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    }
  },

  // Set user
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  // Set tokens in storage
  setTokens: (accessToken, refreshToken, role) => {
    // Store refresh token in sessionStorage (more secure than localStorage)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('refresh_token', refreshToken);
      document.cookie = `auth_token=${accessToken}; path=/; sameSite=Lax`;
      if (role) {
        document.cookie = `user_role=${role}; path=/; sameSite=Lax`;
      }
    }
    set({ accessToken });
    setAccessToken(accessToken);
  },

  // Login
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null, isInitialized: false });
    try {
      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;

        // Store tokens
        get().setTokens(accessToken, refreshToken, user.role);

        // Set user and mark as initialized
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      } else {
        throw new Error(Array.isArray(response.message) ? response.message.join(', ') : response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      set({
        error: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
        isLoading: false,
        isInitialized: true,
        isAuthenticated: false,
        user: null,
      });
      throw error;
    }
  },

  // Register
  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null, isInitialized: false });
    try {
      const response = await authService.register(data);

      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;

        // Store tokens
        get().setTokens(accessToken, refreshToken, user.role);

        // Set user and mark as initialized
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      } else {
        throw new Error(Array.isArray(response.message) ? response.message.join(', ') : response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      set({
        error: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
        isLoading: false,
        isInitialized: true,
        isAuthenticated: false,
        user: null,
      });
      throw error;
    }
  },

  // Logout
  logout: () => {
    authService.logout();
    if (typeof window !== 'undefined') {
      document.cookie = 'auth_token=; path=/; max-age=0; sameSite=Lax';
      document.cookie = 'user_role=; path=/; max-age=0; sameSite=Lax';
    }
    setAccessToken(null);
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: null,
    });
  },

  // Refresh session
  refreshSession: async () => {
    const refreshToken = typeof window !== 'undefined' ? sessionStorage.getItem('refresh_token') : null;

    if (!refreshToken) {
      set({ user: null, accessToken: null, isAuthenticated: false, isInitialized: true });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await authService.refresh({ refreshToken });

      if (response.success && response.data) {
        const { accessToken, refreshToken: newRefreshToken, user } = response.data;
        get().setTokens(accessToken, newRefreshToken, user.role);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      }
    } catch (error) {
      // Refresh failed - clear auth state
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('refresh_token');
        document.cookie = 'user_role=; path=/; max-age=0; sameSite=Lax';
      }
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    }
  },

  // Update profile
  updateProfile: async (data: UpdateProfileData) => {
    const { user } = get();
    if (!user) throw new Error('No user logged in');

    set({ isLoading: true, error: null });
    try {
      const response = await authService.updateProfile(user.id, data);

      if (response.success && response.data) {
        set({
          user: response.data,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(Array.isArray(response.message) ? response.message.join(', ') : response.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Profile update failed.';
      set({
        error: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

// Listen for auth:logout event (from API interceptor)
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().logout();
  });
}
