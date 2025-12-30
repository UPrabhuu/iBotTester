// Response helper utilities

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message,
});

export const errorResponse = (error: string): ApiResponse => ({
  success: false,
  error,
});

export const createdResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message: message || 'Resource created successfully',
});

export const updatedResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message: message || 'Resource updated successfully',
});

export const deletedResponse = (message?: string): ApiResponse => ({
  success: true,
  message: message || 'Resource deleted successfully',
});
