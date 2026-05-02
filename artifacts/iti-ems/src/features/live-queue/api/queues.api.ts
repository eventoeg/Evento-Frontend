import apiClient from '@/shared/api/api-client';
import type { ApiResponse, PaginatedResponse } from '@/shared/types/api';
import type { QueueEntry } from '../model/queue.types';
import type { QueueStatus, InterviewResult } from '@/shared/types/enums';

export const queuesApi = {
  getByJobProfile: (jobProfileId: string, page = 1, limit = 100) =>
    apiClient.get<ApiResponse<PaginatedResponse<QueueEntry>>>('/queues', {
      params: { jobProfileId, page, limit },
    }),

  skip: (queueId: string, idempotencyKey: string) =>
    apiClient.post<ApiResponse<QueueEntry>>(
      `/queues/${queueId}/skip`,
      {},
      { headers: { 'Idempotency-Key': idempotencyKey } },
    ),

  halt: (queueId: string) =>
    apiClient.post<ApiResponse<QueueEntry>>(`/queues/${queueId}/halt`),

  resume: (queueId: string) =>
    apiClient.post<ApiResponse<QueueEntry>>(`/queues/${queueId}/resume`),

  updateStatus: (queueId: string, status: QueueStatus) =>
    apiClient.patch<ApiResponse<QueueEntry>>(`/queues/${queueId}`, { status }),

  startInterview: (queueId: string, interviewerName: string) =>
    apiClient.post<ApiResponse<QueueEntry>>('/interviews', { queueId, interviewerName }),

  endInterview: (interviewId: string, result: InterviewResult, notes?: string) =>
    apiClient.patch<ApiResponse<QueueEntry>>(`/interviews/${interviewId}`, {
      status: 'completed',
      result,
      notes,
    }),
};
