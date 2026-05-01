import apiClient from '@/lib/api-client';
import { ApiResponse, PaginatedResponse, StudentCv } from '@/types';

export const studentCvsService = {
  /**
   * Upload a student CV
   */
  async upload(file: File, title?: string): Promise<ApiResponse<StudentCv>> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) {
      formData.append('title', title);
    }

    const response = await apiClient.post<ApiResponse<StudentCv>>('/student-cvs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * List student CVs with pagination
   */
  async findAll(page: number = 1, limit: number = 20, studentId?: string): Promise<ApiResponse<PaginatedResponse<StudentCv>>> {
    const params = { page, limit, studentId };
    const response = await apiClient.get<ApiResponse<PaginatedResponse<StudentCv>>>('/student-cvs', { params });
    return response.data;
  },

  /**
   * Get a student CV by ID
   */
  async findById(id: string): Promise<ApiResponse<StudentCv>> {
    const response = await apiClient.get<ApiResponse<StudentCv>>(`/student-cvs/${id}`);
    return response.data;
  },

  /**
   * Update a student CV
   */
  async update(id: string, data: { title?: string; isPrimary?: boolean }): Promise<ApiResponse<StudentCv>> {
    const response = await apiClient.patch<ApiResponse<StudentCv>>(`/student-cvs/${id}`, data);
    return response.data;
  },

  /**
   * Delete a student CV
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/student-cvs/${id}`);
    return response.data;
  },
};
