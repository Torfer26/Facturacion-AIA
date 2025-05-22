import { z } from 'zod';

// Define error types
export enum ErrorType {
  VALIDATION = 'validation_error',
  AUTHENTICATION = 'authentication_error',
  AUTHORIZATION = 'authorization_error',
  NOT_FOUND = 'not_found',
  SERVER = 'server_error',
  NETWORK = 'network_error',
  DATA = 'data_error',
  UNKNOWN = 'unknown_error'
}

// Error response structure
export interface ErrorResponse {
  success: false;
  error: string;
  errorType: ErrorType;
  details?: unknown;
  status: number;
}

// Custom application error class
export class AppError extends Error {
  errorType: ErrorType;
  status: number;
  details?: unknown;

  constructor(message: string, errorType: ErrorType = ErrorType.UNKNOWN, status: number = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.errorType = errorType;
    this.status = status;
    this.details = details;
  }

  toResponse(): ErrorResponse {
    return {
      success: false,
      error: this.message,
      errorType: this.errorType,
      details: this.details,
      status: this.status
    };
  }
}

// Create specific error classes
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorType.VALIDATION, 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, ErrorType.AUTHENTICATION, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized to perform this action') {
    super(message, ErrorType.AUTHORIZATION, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, ErrorType.NOT_FOUND, 404);
    this.name = 'NotFoundError';
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, ErrorType.SERVER, 500);
    this.name = 'ServerError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error') {
    super(message, ErrorType.NETWORK, 500);
    this.name = 'NetworkError';
  }
}

export class DataError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, ErrorType.DATA, 422, details);
    this.name = 'DataError';
  }
}

// Helper to convert Zod validation errors to our ValidationError
export function handleZodError(error: z.ZodError): ValidationError {
  return new ValidationError('Validation error', error.flatten());
}

// Helper to handle errors in API routes
export function handleApiError(error: unknown): ErrorResponse {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return error.toResponse();
  }

  if (error instanceof z.ZodError) {
    return handleZodError(error).toResponse();
  }

  if (error instanceof Error) {
    return new AppError(error.message).toResponse();
  }

  return new AppError('An unknown error occurred').toResponse();
}

// Helper for client-side error handling
export function handleClientError(error: unknown, toast?: any): Error {
  console.error('Client error:', error);

  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof z.ZodError) {
    appError = handleZodError(error);
  } else if (error instanceof Error) {
    appError = new AppError(error.message);
  } else {
    appError = new AppError('An unknown error occurred');
  }

  // If toast is provided, show the error message
  if (toast) {
    toast({
      title: getErrorTitle(appError.errorType),
      description: appError.message,
      variant: 'destructive',
    });
  }

  return appError;
}

// Helper to get user-friendly error titles
function getErrorTitle(errorType: ErrorType): string {
  switch (errorType) {
    case ErrorType.VALIDATION:
      return 'Error de validación';
    case ErrorType.AUTHENTICATION:
      return 'Error de autenticación';
    case ErrorType.AUTHORIZATION:
      return 'Error de autorización';
    case ErrorType.NOT_FOUND:
      return 'No encontrado';
    case ErrorType.SERVER:
      return 'Error del servidor';
    case ErrorType.NETWORK:
      return 'Error de red';
    case ErrorType.DATA:
      return 'Error de datos';
    default:
      return 'Error';
  }
} 