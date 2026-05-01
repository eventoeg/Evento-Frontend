import apiClient from '@/lib/api-client';
import { ApiResponse, PaginatedResponse, JobProfile, CreateJobProfileDto, UpdateJobProfileDto } from '@/types';

export const jobProfilesService = {
  /**
   * Create a job profile
   */
  async create(data: CreateJobProfileDto): Promise<ApiResponse<JobProfile>> {
    const response = await apiClient.post<ApiResponse<JobProfile>>('/job-profiles', data);
    return response.data;
  },

  /**
   * Get all job profiles with pagination
   */
  async findAll(page: number = 1, limit: number = 20, eventId?: string, companyId?: string): Promise<ApiResponse<PaginatedResponse<JobProfile>>> {
    const params: any = { page, limit };
    if (eventId) params.eventId = eventId;
    if (companyId) params.companyId = companyId;
    
    const response = await apiClient.get<ApiResponse<PaginatedResponse<JobProfile>>>('/job-profiles', { params });
    return response.data;
  },

  /**
   * Get a job profile by ID
   */
  async findById(id: string): Promise<ApiResponse<JobProfile>> {
    const response = await apiClient.get<ApiResponse<JobProfile>>(`/job-profiles/${id}`);
    return response.data;
  },

  /**
   * Update a job profile
   */
  async update(id: string, data: UpdateJobProfileDto): Promise<ApiResponse<JobProfile>> {
    const response = await apiClient.patch<ApiResponse<JobProfile>>(`/job-profiles/${id}`, data);
    return response.data;
  },

  /**
   * Approve a job profile
   */
  async approve(id: string): Promise<ApiResponse<JobProfile>> {
    const response = await apiClient.patch<ApiResponse<JobProfile>>(`/job-profiles/${id}/approve`);
    return response.data;
  },

  /**
   * Delete a job profile
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/job-profiles/${id}`);
    return response.data;
  },
};
