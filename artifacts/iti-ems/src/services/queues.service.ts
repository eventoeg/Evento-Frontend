import apiClient from '@/lib/api-client';
import { ApiResponse, PaginatedResponse, InterviewQueue, CreateQueueEntryDto, UpdateQueueStatusDto } from '@/types';

export const queuesService = {
  /**
   * Add a student to a job-profile queue
   */
  async create(data: CreateQueueEntryDto): Promise<ApiResponse<InterviewQueue>> {
    const response = await apiClient.post<ApiResponse<InterviewQueue>>('/queues', data);
    return response.data;
  },

  /**
   * Get all queue entries with pagination
   */
  async findAll(page: number = 1, limit: number = 20, jobProfileId?: string, studentId?: string): Promise<ApiResponse<PaginatedResponse<InterviewQueue>>> {
    const params: any = { page, limit };
    if (jobProfileId) params.jobProfileId = jobProfileId;
    if (studentId) params.studentId = studentId;
    
    const response = await apiClient.get<ApiResponse<PaginatedResponse<InterviewQueue>>>('/queues', { params });
    return response.data;
  },

  /**
   * Get the next waiting student for a job profile
   */
  async getNextForJobProfile(jobProfileId: string): Promise<ApiResponse<InterviewQueue>> {
    const response = await apiClient.get<ApiResponse<InterviewQueue>>(`/queues/job-profile/${jobProfileId}/next`);
    return response.data;
  },

  /**
   * Get a queue entry by ID
   */
  async findById(id: string): Promise<ApiResponse<InterviewQueue>> {
    const response = await apiClient.get<ApiResponse<InterviewQueue>>(`/queues/${id}`);
    return response.data;
  },

  /**
   * Update queue status
   */
  async updateStatus(id: string, data: UpdateQueueStatusDto): Promise<ApiResponse<InterviewQueue>> {
    const response = await apiClient.patch<ApiResponse<InterviewQueue>>(`/queues/${id}/status`, data);
    return response.data;
  },

  /**
   * Skip a queue entry
   */
  async skip(id: string): Promise<ApiResponse<InterviewQueue>> {
    const response = await apiClient.patch<ApiResponse<InterviewQueue>>(`/queues/${id}/skip`);
    return response.data;
  },

  /**
   * Halt a queue entry
   */
  async halt(id: string): Promise<ApiResponse<InterviewQueue>> {
    const response = await apiClient.patch<ApiResponse<InterviewQueue>>(`/queues/${id}/halt`);
    return response.data;
  },

  /**
   * Resume a queue entry
   */
  async resume(id: string): Promise<ApiResponse<InterviewQueue>> {
    const response = await apiClient.patch<ApiResponse<InterviewQueue>>(`/queues/${id}/resume`);
    return response.data;
  },

  /**
   * Delete a queue entry
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/queues/${id}`);
    return response.data;
  },
};
