import apiClient from '@/lib/api-client';
import { ApiResponse, PaginatedResponse, User, Company, Event, InterviewQueue, Interview, Track, Student } from '@/types';

export const dashboardApi = {
  // Stats endpoints
  getStudentsCount: () => 
    apiClient.get<ApiResponse<PaginatedResponse<User>>>('/users', { 
      params: { role: 'student', page: 1, limit: 1 } 
    }),
  
  getPendingCompanies: () => 
    apiClient.get<ApiResponse<PaginatedResponse<Company>>>('/companies', { 
      params: { status: 'pending', page: 1, limit: 100 } 
    }),
  
  getPublishedEvents: () => 
    apiClient.get<ApiResponse<PaginatedResponse<Event>>>('/events', { 
      params: { page: 1, limit: 100 } 
    }),
  
  getInterviews: (params?: { page?: number; limit?: number }) => 
    apiClient.get<ApiResponse<PaginatedResponse<Interview>>>('/interviews', { 
      params: { page: 1, limit: 100, ...params } 
    }),

  // Role-specific endpoints
  getMyJobProfiles: (companyId: string) => 
    apiClient.get<ApiResponse<PaginatedResponse<any>>>('/job-profiles', { 
      params: { companyId, page: 1, limit: 100 } 
    }),

  getMyQueues: (studentId: string) => 
    apiClient.get<ApiResponse<PaginatedResponse<InterviewQueue>>>('/queues', { 
      params: { studentId, page: 1, limit: 100 } 
    }),

  getTracks: () => 
    apiClient.get<ApiResponse<PaginatedResponse<Track>>>('/tracks', { 
      params: { page: 1, limit: 100 } 
    }),

  getStudents: (trackId?: string) => 
    apiClient.get<ApiResponse<PaginatedResponse<User>>>('/users', { 
      params: { role: 'student', page: 1, limit: 100, trackId } 
    }),
};
