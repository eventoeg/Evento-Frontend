import apiClient from '@/lib/api-client';
import { ApiResponse, PaginatedResponse, User, UpdateUserDto, CreateUserDto, UserRole } from '@/types';

export const usersService = {
  /**
   * Create a new user
   */
  async create(data: CreateUserDto): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>('/users', data);
    return response.data;
  },

  /**
   * Get all users with pagination
   */
  async findAll(page: number = 1, limit: number = 20, role?: UserRole, search?: string): Promise<ApiResponse<PaginatedResponse<User>>> {
    const params = { page, limit };
    const queryParams: any = { ...params };
    if (role) queryParams.role = role;
    if (search && search.trim()) queryParams.search = search.trim();

    const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>('/users', { params: queryParams });
    return response.data;
  },

  /**
   * Get all users by paging through backend-safe limits.
   */
  async findAllBatched(limit: number = 100, role?: UserRole, search?: string): Promise<User[]> {
    const safeLimit = Math.min(100, Math.max(1, limit));
    let page = 1;
    let hasNextPage = true;
    const collected: User[] = [];

    while (hasNextPage) {
      const res = await this.findAll(page, safeLimit, role, search);
      if (!res.success || !res.data) {
        break;
      }

      collected.push(...res.data.items);
      hasNextPage = !!res.data.pagination?.hasNextPage;
      page += 1;

      // Prevent accidental infinite loops if pagination metadata is corrupted.
      if (page > 1000) {
        break;
      }
    }

    return collected;
  },

  /**
   * Get a user by ID
   */
  async findById(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  /**
   * Get a user by email
   */
  async findByEmail(email: string): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/email/${email}`);
    return response.data;
  },

  /**
   * Update a user
   */
  async update(id: string, data: UpdateUserDto): Promise<ApiResponse<User>> {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Delete a user (soft delete)
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/users/${id}`);
    return response.data;
  },

  /**
   * Restore a deleted user
   */
  async restore(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}/restore`);
    return response.data;
  },
};
