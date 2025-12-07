export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export const successResponse = <T>(data: T, meta?: any): ApiResponse<T> => ({
  success: true,
  data,
  ...(meta && { meta }),
});

export const errorResponse = (
  message: string,
  code: string,
  details?: any
): ApiResponse => ({
  success: false,
  error: {
    code,
    message,
    ...(details && { details }),
  },
});
