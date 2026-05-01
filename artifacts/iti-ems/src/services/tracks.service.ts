import apiClient from '@/lib/api-client';
import { ApiResponse, PaginatedResponse, Track, CreateTrackDto, UpdateTrackDto, Student } from '@/types';

export const tracksService = {
  /**
   * Create a new track
   */
  async create(data: CreateTrackDto): Promise<ApiResponse<Track>> {
    const response = await apiClient.post<ApiResponse<Track>>('/tracks', data);
    return response.data;
  },

  /**
   * Get all tracks with pagination
   */
  async findAll(page: number = 1, limit: number = 20, search?: string): Promise<ApiResponse<PaginatedResponse<Track>>> {
    const params: Record<string, unknown> = { page, limit };
    if (search) params.search = search;
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Track>>>('/tracks', { params });
    return response.data;
  },

  /**
   * Get a track by ID
   */
  async findById(id: string): Promise<ApiResponse<Track>> {
    const response = await apiClient.get<ApiResponse<Track>>(`/tracks/${id}`);
    return response.data;
  },

  /**
   * Get all students in a track
   */
  async getStudents(id: string): Promise<ApiResponse<PaginatedResponse<Student>>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Student>>>(`/tracks/${id}/students`);
    return response.data;
  },

  /**
   * Update a track
   */
  async update(id: string, data: UpdateTrackDto): Promise<ApiResponse<Track>> {
    const response = await apiClient.patch<ApiResponse<Track>>(`/tracks/${id}`, data);
    return response.data;
  },

  /**
   * Delete a track
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/tracks/${id}`);
    return response.data;
  },
};
