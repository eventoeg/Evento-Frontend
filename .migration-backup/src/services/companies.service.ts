import apiClient from '@/lib/api-client';
import { ApiResponse, PaginatedResponse, Company, CreateCompanyDto, UpdateCompanyDto, CompanyStatus } from '@/types';

export const companiesService = {
  /**
   * Create a new company
   */
  async create(data: CreateCompanyDto): Promise<ApiResponse<Company>> {
    const response = await apiClient.post<ApiResponse<Company>>('/companies', data);
    return response.data;
  },

  /**
   * Get all companies with pagination
   */
  async findAll(page: number = 1, limit: number = 20, status?: CompanyStatus, search?: string): Promise<ApiResponse<PaginatedResponse<Company>>> {
    const params: any = { page, limit };
    if (status) params.status = status;
    if (search && search.trim()) params.search = search.trim();
    
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Company>>>('/companies', { params });
    return response.data;
  },

  /**
   * Get a company by ID
   */
  async findById(id: string): Promise<ApiResponse<Company>> {
    const response = await apiClient.get<ApiResponse<Company>>(`/companies/${id}`);
    return response.data;
  },

  /**
   * Update a company
   */
  async update(id: string, data: UpdateCompanyDto): Promise<ApiResponse<Company>> {
    const response = await apiClient.patch<ApiResponse<Company>>(`/companies/${id}`, data);
    return response.data;
  },

  /**
   * Approve a company
   */
  async approve(id: string): Promise<ApiResponse<Company>> {
    const response = await apiClient.patch<ApiResponse<Company>>(`/companies/${id}/approve`);
    return response.data;
  },

  /**
   * Reject a company
   */
  async reject(id: string): Promise<ApiResponse<Company>> {
    const response = await apiClient.patch<ApiResponse<Company>>(`/companies/${id}/reject`);
    return response.data;
  },

  /**
   * Delete a company (soft delete)
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/companies/${id}`);
    return response.data;
  },

  /**
   * Restore a deleted company
   */
  async restore(id: string): Promise<ApiResponse<Company>> {
    const response = await apiClient.patch<ApiResponse<Company>>(`/companies/${id}/restore`);
    return response.data;
  },
};
