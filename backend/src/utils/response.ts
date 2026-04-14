/**
 * Response Formatting Utility
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  timestamp: string;
  path?: string;
}

export const successResponse = <T>(data: T, _message?: string): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
});

export const errorResponse = (
  message: string,
  code: string = 'INTERNAL_ERROR',
  details?: any
): ApiResponse<null> => ({
  success: false,
  error: {
    message,
    code,
    details,
  },
  timestamp: new Date().toISOString(),
});

export const paginatedResponse = <T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
) => ({
  success: true,
  data: {
    items,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  },
  timestamp: new Date().toISOString(),
});
