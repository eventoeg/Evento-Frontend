import apiClient from '@/lib/api-client';
import { ApiResponse, PaginatedResponse, Attendance } from '@/types';

export const attendanceService = {
  /**
   * Check-in a student to an event
   */
  async checkIn(eventId: string, studentId: string): Promise<ApiResponse<Attendance>> {
    const response = await apiClient.post<ApiResponse<Attendance>>('/attendance/check-in', {
      eventId,
      studentId,
    });
    return response.data;
  },

  /**
   * Get all attendance records with pagination
   */
  async findAll(page: number = 1, limit: number = 20, eventId?: string, studentId?: string): Promise<ApiResponse<PaginatedResponse<Attendance>>> {
    const params: any = { page, limit };
    if (eventId) params.eventId = eventId;
    if (studentId) params.studentId = studentId;
    
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Attendance>>>('/attendance', { params });
    return response.data;
  },

  /**
   * Get an attendance record by ID
   */
  async findById(id: string): Promise<ApiResponse<Attendance>> {
    const response = await apiClient.get<ApiResponse<Attendance>>(`/attendance/${id}`);
    return response.data;
  },

  /**
   * Delete an attendance record
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/attendance/${id}`);
    return response.data;
  },
};
