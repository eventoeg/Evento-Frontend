import apiClient from '@/lib/api-client';
import { ApiResponse, PaginatedResponse, Feedback, CreateFeedbackDto, UpdateFeedbackDto } from '@/types';

export const feedbackService = {
  /**
   * Create feedback
   */
  async create(data: CreateFeedbackDto): Promise<ApiResponse<Feedback>> {
    const response = await apiClient.post<ApiResponse<Feedback>>('/feedback', data);
    return response.data;
  },

  /**
   * Get all feedback entries with pagination
   */
  async findAll(page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedResponse<Feedback>>> {
    const params = { page, limit };
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Feedback>>>('/feedback', { params });
    return response.data;
  },

  /**
   * Get a feedback entry by ID
   */
  async findById(id: string): Promise<ApiResponse<Feedback>> {
    const response = await apiClient.get<ApiResponse<Feedback>>(`/feedback/${id}`);
    return response.data;
  },

  /**
   * Update feedback
   */
  async update(id: string, data: UpdateFeedbackDto): Promise<ApiResponse<Feedback>> {
    const response = await apiClient.patch<ApiResponse<Feedback>>(`/feedback/${id}`, data);
    return response.data;
  },

  /**
   * Delete feedback
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/feedback/${id}`);
    return response.data;
  },
};
