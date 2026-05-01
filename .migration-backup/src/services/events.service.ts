import apiClient from '@/lib/api-client';
import { ApiResponse, PaginatedResponse, Event, CreateEventDto, UpdateEventDto } from '@/types';

export const eventsService = {
  /**
   * Create an event
   */
  async create(data: CreateEventDto): Promise<ApiResponse<Event>> {
    const response = await apiClient.post<ApiResponse<Event>>('/events', data);
    return response.data;
  },

  /**
   * Get all events with pagination
   */
  async findAll(page: number = 1, limit: number = 20, search?: string): Promise<ApiResponse<PaginatedResponse<Event>>> {
    const params: any = { page, limit };
    if (search && search.trim()) params.search = search.trim();
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Event>>>('/events', { params });
    return response.data;
  },

  /**
   * Get an event by ID
   */
  async findById(id: string): Promise<ApiResponse<Event>> {
    const response = await apiClient.get<ApiResponse<Event>>(`/events/${id}`);
    return response.data;
  },

  /**
   * Update an event
   */
  async update(id: string, data: UpdateEventDto): Promise<ApiResponse<Event>> {
    const response = await apiClient.patch<ApiResponse<Event>>(`/events/${id}`, data);
    return response.data;
  },

  /**
   * Delete an event (soft delete)
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/events/${id}`);
    return response.data;
  },

  /**
   * Restore a deleted event
   */
  async restore(id: string): Promise<ApiResponse<Event>> {
    const response = await apiClient.patch<ApiResponse<Event>>(`/events/${id}/restore`);
    return response.data;
  },
};
