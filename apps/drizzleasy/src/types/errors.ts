/**
 * Error categories for programmatic handling
 */
export type TErrorType = 
    | 'VALIDATION'
    | 'PERMISSION'
    | 'NOT_FOUND'
    | 'DUPLICATE'
    | 'DATABASE'
    | 'NETWORK'
    | 'TIMEOUT'
    | 'UNKNOWN'

/**
 * Enhanced error with categorization and metadata
 */
export type TEnhancedError = {
    /** Error category for programmatic handling */
    type: TErrorType
    /** Human-readable error message */
    message: string
    /** Machine-readable error code */
    code: string
    /** Additional error details */
    details?: {
        /** Field-specific validation errors */
        fields?: Record<string, string[]>
        /** Query that failed */
        query?: string
        /** Table involved in the operation */
        table?: string
        /** Original database error */
        originalError?: Error
        /** Suggested user-facing message */
        userMessage?: string
        /** Stack trace for debugging */
        stack?: string
    }
    /** Whether this operation can be retried */
    retryable: boolean
    /** When this error occurred */
    timestamp: Date
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