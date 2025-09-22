/**
 * Error categories for programmatic handling
 */
export type TErrorCategory = 
    | 'CONNECTION'
    | 'VALIDATION'
    | 'PERMISSION'
    | 'CONSTRAINT'
    | 'TIMEOUT'
    | 'UNKNOWN'

/**
 * Error severity levels
 */
export type TErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

/**
 * Environment modes for error handling
 */
export type TEnvironmentMode = 'development' | 'production'

/**
 * Enhanced error with categorization and metadata
 */
export type TEnhancedError = {
    /** Error category for programmatic handling */
    category: TErrorCategory
    /** Error severity level */
    severity: TErrorSeverity
    /** Human-readable error message */
    message: string
    /** Machine-readable error code */
    code: string
    /** User-friendly message for display */
    userMessage: string
    /** Developer-focused message with technical details */
    developerMessage: string
    /** Whether this error provides actionable guidance */
    actionable: boolean
    /** Whether this operation can be retried */
    retryable: boolean
    /** When this error occurred */
    timestamp: Date
    /** Additional error details */
    details?: {
        /** Field-specific validation errors */
        fields?: Record<string, string[]>
        /** Query that failed */
        query?: string
        /** Table involved in the operation */
        table?: string
        /** Original database error (sanitized in production) */
        originalError?: Error | string
        /** Stack trace for debugging (development only) */
        stack?: string
        /** Suggested resolution steps */
        resolutionSteps?: string[]
        /** Related documentation links */
        documentationLinks?: string[]
    }
}

/**
 * Enhanced result with error information and metadata
 */
export type TEnhancedResult<T> = {
    /** Data returned on successful operation */
    data?: T
    /** Enhanced error information */
    error?: TEnhancedError
    /** Operation metadata */
    meta?: {
        /** Time taken for the operation in milliseconds */
        duration: number
        /** Number of rows affected */
        affected?: number
        /** Whether result was cached */
        cached?: boolean
        /** Operation type */
        operation?: 'create' | 'read' | 'update' | 'delete' | 'batch'
    }
}