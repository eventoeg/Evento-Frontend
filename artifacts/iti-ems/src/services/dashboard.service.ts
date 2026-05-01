import apiClient from '@/lib/api-client';
import { ApiResponse, PaginatedResponse, User, Company, Event, InterviewQueue, Interview } from '@/types';

export const dashboardApi = {
  // Get all users (no role filter - backend doesn't support it)
  getUsers: (page = 1, limit = 20) => 
    apiClient.get<ApiResponse<PaginatedResponse<User>>>('/users', { 
      params: { page, limit } 
    }),
  
  // Get all companies (no status filter - backend doesn't support it)
  getCompanies: (page = 1, limit = 20) => 
    apiClient.get<ApiResponse<PaginatedResponse<Company>>>('/companies', { 
      params: { page, limit } 
    }),
  
  // Get all events
  getEvents: (page = 1, limit = 20) => 
    apiClient.get<ApiResponse<PaginatedResponse<Event>>>('/events', { 
      params: { page, limit } 
    }),
  
  // Get all interviews
  getInterviews: (page = 1, limit = 20) => 
    apiClient.get<ApiResponse<PaginatedResponse<Interview>>>('/interviews', { 
      params: { page, limit } 
    }),

  // Get single company by ID
  getCompanyById: (id: string) => 
    apiClient.get<ApiResponse<Company>>(`/companies/${id}`),

  // Company actions
  approveCompany: (id: string) => 
    apiClient.patch<ApiResponse<Company>>(`/companies/${id}/approve`),

  rejectCompany: (id: string) => 
    apiClient.patch<ApiResponse<Company>>(`/companies/${id}/reject`),
};
