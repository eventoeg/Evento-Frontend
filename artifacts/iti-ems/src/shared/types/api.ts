export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string | string[];
  path: string;
  data: T | null;
  pagination: PaginationMetadata | null;
  errors: string[] | null;
  timestamp: string;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMetadata;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
