import type { TEnhancedError, TErrorType } from '../types/errors'

/**
 * Factory for creating typed, categorized errors
 */
export class DrizzleasyError {
    /**
     * Create a validation error
     */
    static validation(
        message: string,
        fields?: Record<string, string[]>,
        table?: string
    ): TEnhancedError {
        return {
            type: 'VALIDATION',
            message,
            code: 'VALIDATION_ERROR',
            details: {
                fields,
                table,
                userMessage: 'Please check the provided information and try again.'
            },
            retryable: true,
            timestamp: new Date()
        }
    }

    /**
     * Create a not found error
     */
    static notFound(
        table: string,
        id?: string | number,
        field: string = 'id'
    ): TEnhancedError {
        return {
            type: 'NOT_FOUND',
            message: `Record not found in ${table}${id ? ` with ${field}: ${id}` : ''}`,
            code: 'RECORD_NOT_FOUND',
            details: {
                table,
                userMessage: 'The requested item could not be found.'
            },
            retryable: false,
            timestamp: new Date()
        }
    }

    /**
     * Create a permission error
     */
    static permission(
        operation: string,
        table: string,
        reason?: string
    ): TEnhancedError {
        return {
            type: 'PERMISSION',
            message: `Insufficient permissions for ${operation} on ${table}${reason ? `: ${reason}` : ''}`,
            code: 'ACCESS_DENIED',
            details: {
                table,
                userMessage: 'You do not have permission to perform this action.'
            },
            retryable: false,
            timestamp: new Date()
        }
    }

    /**
     * Create a duplicate entry error
     */
    static duplicate(
        table: string,
        field: string,
        value: any
    ): TEnhancedError {
        return {
            type: 'DUPLICATE',
            message: `Duplicate value for ${field}: ${value}`,
            code: 'DUPLICATE_ENTRY',
            details: {
                table,
                fields: { [field]: [`Value '${value}' already exists`] },
                userMessage: `This ${field} is already in use. Please choose a different one.`
            },
            retryable: false,
            timestamp: new Date()
        }
    }

    /**
     * Create a database error
     */
    static database(
        message: string,
        originalError?: Error,
        table?: string
    ): TEnhancedError {
        return {
            type: 'DATABASE',
            message,
            code: 'DATABASE_ERROR',
            details: {
                table,
                originalError,
                stack: originalError?.stack,
                userMessage: 'A database error occurred. Please try again later.'
            },
            retryable: true,
            timestamp: new Date()
        }
    }

    /**
     * Create a network error
     */
    static network(
        message: string,
        originalError?: Error
    ): TEnhancedError {
        return {
            type: 'NETWORK',
            message,
            code: 'NETWORK_ERROR',
            details: {
                originalError,
                stack: originalError?.stack,
                userMessage: 'A network error occurred. Please check your connection.'
            },
            retryable: true,
            timestamp: new Date()
        }
    }

    /**
     * Create a timeout error
     */
    static timeout(
        operation: string,
        duration: number
    ): TEnhancedError {
        return {
            type: 'TIMEOUT',
            message: `Operation '${operation}' timed out after ${duration}ms`,
            code: 'OPERATION_TIMEOUT',
            details: {
                userMessage: 'The operation took too long. Please try again.'
            },
            retryable: true,
            timestamp: new Date()
        }
    }

    /**
     * Create an unknown error
     */
    static unknown(
        message: string,
        originalError?: Error
    ): TEnhancedError {
        return {
            type: 'UNKNOWN',
            message,
            code: 'UNKNOWN_ERROR',
            details: {
                originalError,
                stack: originalError?.stack,
                userMessage: 'An unexpected error occurred. Please try again.'
            },
            retryable: false,
            timestamp: new Date()
        }
    }

    /**
     * Parse a database error and convert to enhanced error
     */
    static fromDatabaseError(
        error: any,
        table?: string,
        operation?: string
    ): TEnhancedError {
        const errorMessage = error?.message || String(error)
        const errorCode = error?.code || error?.errno
        
        // Check for common database error patterns
        if (errorMessage.includes('duplicate') || errorCode === '23505' || errorCode === 'SQLITE_CONSTRAINT') {
            // Extract field name from error message if possible
            const fieldMatch = errorMessage.match(/duplicate key.*?(\w+)/i)
            const field = fieldMatch?.[1] || 'unknown'
            return DrizzleasyError.duplicate(table || 'unknown', field, 'unknown')
        }
        
        if (errorMessage.includes('foreign key') || errorCode === '23503') {
            return DrizzleasyError.validation(
                'Foreign key constraint violation',
                undefined,
                table
            )
        }
        
        if (errorMessage.includes('not found') || errorCode === '42P01') {
            return DrizzleasyError.notFound(table || 'unknown')
        }
        
        if (errorMessage.includes('permission') || errorMessage.includes('denied') || errorCode === '42501') {
            return DrizzleasyError.permission(operation || 'operation', table || 'unknown')
        }
        
        if (errorMessage.includes('timeout') || errorCode === '57014') {
            return DrizzleasyError.timeout(operation || 'operation', 30000)
        }
        
        if (errorMessage.includes('connection') || errorMessage.includes('network')) {
            return DrizzleasyError.network(errorMessage, error)
        }
        
        // Default to database error
        return DrizzleasyError.database(errorMessage, error, table)
    }

    /**
     * Check if an error is retryable
     */
    static isRetryable(error: TEnhancedError): boolean {
        return error.retryable
    }

    /**
     * Get user-friendly message from error
     */
    static getUserMessage(error: TEnhancedError): string {
        return error.details?.userMessage || error.message
    }
}