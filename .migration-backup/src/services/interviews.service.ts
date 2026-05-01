import apiClient from '@/lib/api-client';
import { ApiResponse, PaginatedResponse, Interview, CreateInterviewDto, UpdateInterviewDto } from '@/types';

export const interviewsService = {
  /**
   * Create an interview
   */
  async create(data: CreateInterviewDto): Promise<ApiResponse<Interview>> {
    const response = await apiClient.post<ApiResponse<Interview>>('/interviews', data);
    return response.data;
  },

  /**
   * Get all interviews with pagination
   */
  async findAll(page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedResponse<Interview>>> {
    const params = { page, limit };
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Interview>>>('/interviews', { params });
    return response.data;
  },

  /**
   * Get an interview by ID
   */
  async findById(id: string): Promise<ApiResponse<Interview>> {
    const response = await apiClient.get<ApiResponse<Interview>>(`/interviews/${id}`);
    return response.data;
  },

  /**
   * Update an interview
   */
  async update(id: string, data: UpdateInterviewDto): Promise<ApiResponse<Interview>> {
    const response = await apiClient.patch<ApiResponse<Interview>>(`/interviews/${id}`, data);
    return response.data;
  },
};
