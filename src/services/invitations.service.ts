import apiClient from '@/lib/api-client';
import { ApiResponse, PaginatedResponse, CompanyInvitation, CreateCompanyInvitationDto, UpdateCompanyInvitationDto } from '@/types';

export const invitationsService = {
  /**
   * Create a company invitation
   */
  async create(data: CreateCompanyInvitationDto): Promise<ApiResponse<CompanyInvitation>> {
    const response = await apiClient.post<ApiResponse<CompanyInvitation>>('/invitations', data);
    return response.data;
  },

  /**
   * Get all invitations with pagination
   */
  async findAll(page: number = 1, limit: number = 20, eventId?: string): Promise<ApiResponse<PaginatedResponse<CompanyInvitation>>> {
    const params: any = { page, limit };
    if (eventId) params.eventId = eventId;
    
    const response = await apiClient.get<ApiResponse<PaginatedResponse<CompanyInvitation>>>('/invitations', { params });
    return response.data;
  },

  /**
   * Get an invitation by ID
   */
  async findById(id: string): Promise<ApiResponse<CompanyInvitation>> {
    const response = await apiClient.get<ApiResponse<CompanyInvitation>>(`/invitations/${id}`);
    return response.data;
  },

  /**
   * Get an invitation by token
   */
  async findByToken(token: string): Promise<ApiResponse<CompanyInvitation>> {
    const response = await apiClient.get<ApiResponse<CompanyInvitation>>(`/invitations/token/${token}`);
    return response.data;
  },

  /**
   * Update an invitation
   */
  async update(id: string, data: UpdateCompanyInvitationDto): Promise<ApiResponse<CompanyInvitation>> {
    const response = await apiClient.patch<ApiResponse<CompanyInvitation>>(`/invitations/${id}`, data);
    return response.data;
  },

  /**
   * Accept an invitation
   */
  async accept(token: string): Promise<ApiResponse<CompanyInvitation>> {
    const response = await apiClient.post<ApiResponse<CompanyInvitation>>(`/invitations/accept/${token}`);
    return response.data;
  },

  /**
   * Reject an invitation
   */
  async reject(token: string): Promise<ApiResponse<CompanyInvitation>> {
    const response = await apiClient.post<ApiResponse<CompanyInvitation>>(`/invitations/reject/${token}`);
    return response.data;
  },

  /**
   * Delete an invitation
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/invitations/${id}`);
    return response.data;
  },
};
