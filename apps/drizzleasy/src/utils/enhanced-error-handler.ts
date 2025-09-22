import type { 
    TEnhancedError, 
    TErrorCategory, 
    TErrorSeverity, 
    TEnvironmentMode 
} from '../types/errors'

/**
 * Enhanced error handler with categorization and sanitization
 */
export class EnhancedErrorHandler {
    private mode: TEnvironmentMode

    constructor(mode: TEnvironmentMode = 'production') {
        this.mode = mode
    }

    /**
     * Categorize an error based on its characteristics
     */
    categorizeError(error: unknown): TErrorCategory {
        if (!error) return 'UNKNOWN'

        const errorMessage = this.extractErrorMessage(error)
        const errorCode = this.extractErrorCode(error)

        // Connection-related errors
        if (this.isConnectionError(errorMessage, errorCode)) {
            return 'CONNECTION'
        }

        // Validation errors
        if (this.isValidationError(errorMessage, errorCode)) {
            return 'VALIDATION'
        }

        // Permission errors
        if (this.isPermissionError(errorMessage, errorCode)) {
            return 'PERMISSION'
        }

        // Constraint violations
        if (this.isConstraintError(errorMessage, errorCode)) {
            return 'CONSTRAINT'
        }

        // Timeout errors
        if (this.isTimeoutError(errorMessage, errorCode)) {
            return 'TIMEOUT'
        }

        return 'UNKNOWN'
    }

    /**
     * Determine error severity based on category and context
     */
    determineSeverity(category: TErrorCategory, context?: { retryable?: boolean }): TErrorSeverity {
        switch (category) {
            case 'CONNECTION':
                return context?.retryable ? 'HIGH' : 'CRITICAL'
            case 'VALIDATION':
                return 'MEDIUM'
            case 'PERMISSION':
                return 'HIGH'
            case 'CONSTRAINT':
                return 'MEDIUM'
            case 'TIMEOUT':
                return 'HIGH'
            case 'UNKNOWN':
            default:
                return 'MEDIUM'
        }
    }

    /**
     * Sanitize error for production environment
     */
    sanitizeError(error: TEnhancedError): TEnhancedError {
        if (this.mode === 'development') {
            return error
        }

        // Create sanitized version for production
        const sanitized: TEnhancedError = {
            ...error,
            developerMessage: this.sanitizeMessage(error.developerMessage),
            details: error.details ? {
                ...error.details,
                originalError: error.details.originalError ? 
                    this.sanitizeOriginalError(error.details.originalError) : undefined,
                stack: undefined, // Remove stack traces in production
                query: error.details.query ? 
                    this.sanitizeQuery(error.details.query) : undefined
            } : undefined
        }

        return sanitized
    }

    /**
     * Create user-friendly error message
     */
    createUserFriendlyMessage(error: TEnhancedError): string {
        const baseMessage = error.userMessage

        if (error.actionable && error.details?.resolutionSteps?.length) {
            const steps = error.details.resolutionSteps
                .map((step, index) => `${index + 1}. ${step}`)
                .join('\n')
            return `${baseMessage}\n\nTo resolve this issue:\n${steps}`
        }

        return baseMessage
    }

    /**
     * Create enhanced error from raw error
     */
    createEnhancedError(
        error: unknown,
        context?: {
            table?: string
            operation?: string
            fields?: Record<string, string[]>
        }
    ): TEnhancedError {
        const category = this.categorizeError(error)
        const severity = this.determineSeverity(category, { retryable: this.isRetryable(category) })
        const errorMessage = this.extractErrorMessage(error)
        
        const enhancedError: TEnhancedError = {
            category,
            severity,
            message: errorMessage,
            code: this.generateErrorCode(category),
            userMessage: this.generateUserMessage(category, context),
            developerMessage: this.generateDeveloperMessage(error, context),
            actionable: this.isActionable(category),
            retryable: this.isRetryable(category),
            timestamp: new Date(),
            details: {
                table: context?.table,
                fields: context?.fields,
                originalError: error instanceof Error ? error : String(error),
                stack: this.mode === 'development' && error instanceof Error ? error.stack : undefined,
                resolutionSteps: this.generateResolutionSteps(category, context)
            }
        }

        return this.sanitizeError(enhancedError)
    }

    private extractErrorMessage(error: unknown): string {
        if (error instanceof Error) return error.message
        if (typeof error === 'string') return error
        if (error && typeof error === 'object' && 'message' in error) {
            return String((error as any).message)
        }
        return 'Unknown error occurred'
    }

    private extractErrorCode(error: unknown): string | undefined {
        if (error && typeof error === 'object') {
            const errorObj = error as any
            return errorObj.code || errorObj.errno || errorObj.sqlState
        }
        return undefined
    }

    private isConnectionError(message: string, code?: string): boolean {
        const connectionKeywords = ['connection', 'connect', 'network', 'unreachable', 'refused']
        const connectionCodes = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', '08001', '08006']
        
        return connectionKeywords.some(keyword => message.toLowerCase().includes(keyword)) ||
               (code && connectionCodes.includes(code))
    }

    private isValidationError(message: string, code?: string): boolean {
        const validationKeywords = ['validation', 'invalid', 'required', 'missing', 'format']
        const validationCodes = ['23502', '22001', '22003']
        
        return validationKeywords.some(keyword => message.toLowerCase().includes(keyword)) ||
               (code && validationCodes.includes(code))
    }

    private isPermissionError(message: string, code?: string): boolean {
        const permissionKeywords = ['permission', 'denied', 'access', 'unauthorized', 'forbidden']
        const permissionCodes = ['42501', '28000']
        
        return permissionKeywords.some(keyword => message.toLowerCase().includes(keyword)) ||
               (code && permissionCodes.includes(code))
    }

    private isConstraintError(message: string, code?: string): boolean {
        const constraintKeywords = ['constraint', 'duplicate', 'unique', 'foreign key', 'check']
        const constraintCodes = ['23505', '23503', '23514', 'SQLITE_CONSTRAINT']
        
        return constraintKeywords.some(keyword => message.toLowerCase().includes(keyword)) ||
               (code && constraintCodes.includes(code))
    }

    private isTimeoutError(message: string, code?: string): boolean {
        const timeoutKeywords = ['timeout', 'timed out', 'deadline']
        const timeoutCodes = ['57014', 'ETIMEDOUT']
        
        return timeoutKeywords.some(keyword => message.toLowerCase().includes(keyword)) ||
               (code && timeoutCodes.includes(code))
    }

    private isRetryable(category: TErrorCategory): boolean {
        return ['CONNECTION', 'TIMEOUT'].includes(category)
    }

    private isActionable(category: TErrorCategory): boolean {
        return ['VALIDATION', 'PERMISSION', 'CONNECTION'].includes(category)
    }

    private generateErrorCode(category: TErrorCategory): string {
        const prefix = 'DRIZZLEASY'
        const codes = {
            CONNECTION: `${prefix}_CONNECTION_ERROR`,
            VALIDATION: `${prefix}_VALIDATION_ERROR`,
            PERMISSION: `${prefix}_PERMISSION_ERROR`,
            CONSTRAINT: `${prefix}_CONSTRAINT_ERROR`,
            TIMEOUT: `${prefix}_TIMEOUT_ERROR`,
            UNKNOWN: `${prefix}_UNKNOWN_ERROR`
        }
        return codes[category]
    }

    private generateUserMessage(category: TErrorCategory, context?: any): string {
        const messages = {
            CONNECTION: 'Unable to connect to the database. Please check your connection settings.',
            VALIDATION: 'The provided data is invalid. Please check your input and try again.',
            PERMISSION: 'You do not have permission to perform this operation.',
            CONSTRAINT: 'The operation violates a database constraint. Please check your data.',
            TIMEOUT: 'The operation took too long to complete. Please try again.',
            UNKNOWN: 'An unexpected error occurred. Please try again later.'
        }
        return messages[category]
    }

    private generateDeveloperMessage(error: unknown, context?: any): string {
        const baseMessage = this.extractErrorMessage(error)
        const contextInfo = context ? ` (Table: ${context.table}, Operation: ${context.operation})` : ''
        return `${baseMessage}${contextInfo}`
    }

    private generateResolutionSteps(category: TErrorCategory, context?: any): string[] {
        const steps: Record<TErrorCategory, string[]> = {
            CONNECTION: [
                'Verify your database connection string',
                'Check if the database server is running',
                'Ensure network connectivity to the database',
                'Verify firewall settings allow database connections'
            ],
            VALIDATION: [
                'Check that all required fields are provided',
                'Verify data types match the expected format',
                'Ensure field values meet validation constraints'
            ],
            PERMISSION: [
                'Verify your database user has the required permissions',
                'Check if the operation is allowed for your user role',
                'Contact your database administrator if needed'
            ],
            CONSTRAINT: [
                'Check for duplicate values in unique fields',
                'Verify foreign key references exist',
                'Ensure data meets constraint requirements'
            ],
            TIMEOUT: [
                'Try the operation again',
                'Check if the database is under heavy load',
                'Consider breaking large operations into smaller chunks'
            ],
            UNKNOWN: [
                'Try the operation again',
                'Check the application logs for more details',
                'Contact support if the issue persists'
            ]
        }
        return steps[category] || []
    }

    private sanitizeMessage(message: string): string {
        // Remove sensitive information like passwords, tokens, etc.
        return message
            .replace(/password[=:]\s*[^\s]+/gi, 'password=***')
            .replace(/token[=:]\s*[^\s]+/gi, 'token=***')
            .replace(/key[=:]\s*[^\s]+/gi, 'key=***')
            .replace(/secret[=:]\s*[^\s]+/gi, 'secret=***')
    }

    private sanitizeOriginalError(error: Error | string): string {
        const message = error instanceof Error ? error.message : String(error)
        return this.sanitizeMessage(message)
    }

    private sanitizeQuery(query: string): string {
        // Remove sensitive data from queries while keeping structure
        return query
            .replace(/VALUES\s*\([^)]+\)/gi, 'VALUES (**sanitized**)')
            .replace(/SET\s+[^W]+WHERE/gi, 'SET **sanitized** WHERE')
    }
}