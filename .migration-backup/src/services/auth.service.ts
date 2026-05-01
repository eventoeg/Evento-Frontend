import apiClient from '@/lib/api-client';
import { ApiResponse, AuthResponse, LoginDto, RegisterDto, RefreshDto, User, UpdateUserDto } from '@/types';

export const authService = {
  /**
   * Login with email and password
   */
  async login(data: LoginDto): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  },

  /**
   * Register a new user account
   */
  async register(data: RegisterDto): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  async refresh(data: RefreshDto): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', data);
    return response.data;
  },

  /**
   * Get current authenticated user profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateUserDto): Promise<ApiResponse<User>> {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${userId}`, data);
    return response.data;
  },

  /**
   * Logout - clear tokens (client-side only, no backend endpoint needed)
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('refresh_token');
    }
  },
};
