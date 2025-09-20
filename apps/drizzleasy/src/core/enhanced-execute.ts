import { DrizzleasyError } from '../utils/error-factory'
import type { TEnhancedResult, TEnhancedError } from '../types/errors'

/**
 * Configuration for enhanced execute
 */
export type TExecuteOptions = {
    /** Operation type for metadata */
    operation?: 'create' | 'read' | 'update' | 'delete' | 'batch'
    /** Table name for error context */
    table?: string
    /** Timeout in milliseconds */
    timeout?: number
    /** Whether to enable result caching */
    cache?: boolean
}

/**
 * Execute a database operation with enhanced error handling
 * 
 * @param fn - The async function to execute
 * @param options - Configuration options
 * @returns Enhanced result with typed errors and metadata
 */
export async function enhancedExecute<T>(
    fn: () => Promise<T>,
    options: TExecuteOptions = {}
): Promise<TEnhancedResult<T>> {
    const startTime = Date.now()
    const { operation, table, timeout = 30000, cache = false } = options
    
    try {
        // Create timeout promise if specified
        let timeoutId: NodeJS.Timeout | undefined
        const timeoutPromise = new Promise<never>((_, reject) => {
            if (timeout > 0) {
                timeoutId = setTimeout(() => {
                    reject(DrizzleasyError.timeout(operation || 'operation', timeout))
                }, timeout)
            }
        })
        
        // Execute with timeout
        const result = await Promise.race([
            fn(),
            timeoutPromise
        ])
        
        // Clear timeout if successful
        if (timeoutId) {
            clearTimeout(timeoutId)
        }
        
        // Calculate metadata
        const duration = Date.now() - startTime
        
        return {
            data: result,
            meta: {
                duration,
                cached: cache,
                operation,
                // Try to extract affected rows from result
                affected: Array.isArray(result) ? result.length : undefined
            }
        }
    } catch (error) {
        const duration = Date.now() - startTime
        
        // Convert to enhanced error
        let enhancedError
        if (error && typeof error === 'object' && 'type' in error && 'message' in error && 'code' in error) {
            // Already an enhanced error
            enhancedError = error as TEnhancedError
        } else {
            // Convert database/other errors
            enhancedError = DrizzleasyError.fromDatabaseError(error, table, operation)
        }
        
        return {
            error: enhancedError,
            meta: {
                duration,
                cached: false,
                operation
            }
        }
    }
}

/**
 * Execute with automatic retry for retryable errors
 */
export async function executeWithRetry<T>(
    fn: () => Promise<T>,
    options: TExecuteOptions & {
        maxRetries?: number
        retryDelay?: number
        backoff?: boolean
    } = {}
): Promise<TEnhancedResult<T>> {
    const { maxRetries = 3, retryDelay = 1000, backoff = true, ...executeOptions } = options
    
    let lastError
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const result = await enhancedExecute(fn, executeOptions)
        
        if (!result.error) {
            return result
        }
        
        lastError = result.error
        
        // Check if error is retryable
        if (!DrizzleasyError.isRetryable(result.error)) {
            return result
        }
        
        // Don't retry on last attempt
        if (attempt < maxRetries - 1) {
            const delay = backoff ? retryDelay * Math.pow(2, attempt) : retryDelay
            await new Promise(resolve => setTimeout(resolve, delay))
        }
    }
    
    // All retries failed
    return {
        error: lastError,
        meta: {
            duration: 0,
            cached: false,
            operation: options.operation
        }
    }
}