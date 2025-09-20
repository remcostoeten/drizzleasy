/**
 * Production-ready error handling utilities for Drizzleasy
 */

export type TDrizzleasyError = {
  message: string
  code: string
  details?: Record<string, unknown>
  timestamp: Date
}

export class DrizzleasyError extends Error {
  public readonly code: string
  public readonly details?: Record<string, unknown>
  public readonly timestamp: Date

  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'DrizzleasyError'
    this.code = code
    this.details = details
    this.timestamp = new Date()
  }

  toJSON(): TDrizzleasyError {
    return {
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp
    }
  }
}

export class DatabaseConnectionError extends DrizzleasyError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'DATABASE_CONNECTION_ERROR', details)
  }
}

export class ValidationError extends DrizzleasyError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details)
  }
}

export class OperationError extends DrizzleasyError {
  constructor(message: string, operation: string, details?: Record<string, unknown>) {
    super(message, 'OPERATION_ERROR', { operation, ...details })
  }
}

export function handleAsyncError<T>(
  operation: () => Promise<T>,
  errorMessage: string,
  errorCode: string = 'UNKNOWN_ERROR'
): Promise<T> {
  return operation().catch((error) => {
    if (error instanceof DrizzleasyError) {
      throw error
    }
    
    throw new DrizzleasyError(
      errorMessage,
      errorCode,
      {
        originalError: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    )
  })
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function logError(error: DrizzleasyError | Error): void {
  if (isProduction()) {
    // In production, only log essential information
    console.error('Drizzleasy Error:', {
      message: error.message,
      code: error instanceof DrizzleasyError ? error.code : 'UNKNOWN',
      timestamp: new Date().toISOString()
    })
  } else {
    // In development, log full error details
    console.error('Drizzleasy Error:', error)
  }
}