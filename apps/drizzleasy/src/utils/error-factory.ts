import type { TEnhancedError, TErrorCategory } from '../types/errors'
import { EnhancedErrorHandler } from './enhanced-error-handler'

/**
 * Factory for creating typed, categorized errors
 */
export class DrizzleasyError {
    private static errorHandler = new EnhancedErrorHandler(
        process.env.NODE_ENV === 'production' ? 'production' : 'development'
    )

    /**
     * Create a validation error
     */
    static validation(
        message: string,
        fields?: Record<string, string[]>,
        table?: string
    ): TEnhancedError {
        const error = new Error(message)
        return this.errorHandler.createEnhancedError(error, {
            table,
            fields,
            operation: 'validation'
        })
    }

    /**
     * Create a not found error
     */
    static notFound(
        table: string,
        id?: string | number,
        field: string = 'id'
    ): TEnhancedError {
        const message = `Record not found in ${table}${id ? ` with ${field}: ${id}` : ''}`
        const error = new Error(message)
        return this.errorHandler.createEnhancedError(error, {
            table,
            operation: 'read'
        })
    }

    /**
     * Create a permission error
     */
    static permission(
        operation: string,
        table: string,
        reason?: string
    ): TEnhancedError {
        const message = `Insufficient permissions for ${operation} on ${table}${reason ? `: ${reason}` : ''}`
        const error = new Error(message)
        return this.errorHandler.createEnhancedError(error, {
            table,
            operation
        })
    }

    /**
     * Create a duplicate entry error
     */
    static duplicate(
        table: string,
        field: string,
        value: any
    ): TEnhancedError {
        const message = `Duplicate value for ${field}: ${value}`
        const error = new Error(message)
        return this.errorHandler.createEnhancedError(error, {
            table,
            fields: { [field]: [`Value '${value}' already exists`] },
            operation: 'create'
        })
    }

    /**
     * Create a database error
     */
    static database(
        message: string,
        originalError?: Error,
        table?: string
    ): TEnhancedError {
        const error = originalError || new Error(message)
        return this.errorHandler.createEnhancedError(error, {
            table,
            operation: 'database'
        })
    }

    /**
     * Create a network error
     */
    static network(
        message: string,
        originalError?: Error
    ): TEnhancedError {
        const error = originalError || new Error(message)
        return this.errorHandler.createEnhancedError(error, {
            operation: 'network'
        })
    }

    /**
     * Create a timeout error
     */
    static timeout(
        operation: string,
        duration: number
    ): TEnhancedError {
        const message = `Operation '${operation}' timed out after ${duration}ms`
        const error = new Error(message)
        return this.errorHandler.createEnhancedError(error, {
            operation
        })
    }

    /**
     * Create an unknown error
     */
    static unknown(
        message: string,
        originalError?: Error
    ): TEnhancedError {
        const error = originalError || new Error(message)
        return this.errorHandler.createEnhancedError(error, {
            operation: 'unknown'
        })
    }

    /**
     * Parse a database error and convert to enhanced error
     */
    static fromDatabaseError(
        error: any,
        table?: string,
        operation?: string
    ): TEnhancedError {
        return this.errorHandler.createEnhancedError(error, {
            table,
            operation
        })
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
        return this.errorHandler.createUserFriendlyMessage(error)
    }

    /**
     * Sanitize error for production environment
     */
    static sanitizeError(error: TEnhancedError): TEnhancedError {
        return this.errorHandler.sanitizeError(error)
    }

    /**
     * Categorize any error
     */
    static categorizeError(error: unknown): TErrorCategory {
        return this.errorHandler.categorizeError(error)
    }
}