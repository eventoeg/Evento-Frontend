import apiClient from '@/lib/api-client';
import { ApiResponse, PaginatedResponse, BrandingSpeaker, CreateBrandingSpeakerDto, UpdateBrandingSpeakerDto } from '@/types';

export const brandingSpeakersService = {
  /**
   * Create a branding speaker
   */
  async create(data: CreateBrandingSpeakerDto): Promise<ApiResponse<BrandingSpeaker>> {
    const response = await apiClient.post<ApiResponse<BrandingSpeaker>>('/branding-speakers', data);
    return response.data;
  },

  /**
   * Get all branding speakers with pagination
   */
  async findAll(page: number = 1, limit: number = 20, eventId?: string, companyId?: string): Promise<ApiResponse<PaginatedResponse<BrandingSpeaker>>> {
    const params: any = { page, limit };
    if (eventId) params.eventId = eventId;
    if (companyId) params.companyId = companyId;
    
    const response = await apiClient.get<ApiResponse<PaginatedResponse<BrandingSpeaker>>>('/branding-speakers', { params });
    return response.data;
  },

  /**
   * Get a branding speaker by ID
   */
  async findById(id: string): Promise<ApiResponse<BrandingSpeaker>> {
    const response = await apiClient.get<ApiResponse<BrandingSpeaker>>(`/branding-speakers/${id}`);
    return response.data;
  },

  /**
   * Update a branding speaker
   */
  async update(id: string, data: UpdateBrandingSpeakerDto): Promise<ApiResponse<BrandingSpeaker>> {
    const response = await apiClient.patch<ApiResponse<BrandingSpeaker>>(`/branding-speakers/${id}`, data);
    return response.data;
  },

  /**
   * Delete a branding speaker
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/branding-speakers/${id}`);
    return response.data;
  },
};
