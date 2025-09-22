import { describe, it, expect, beforeEach } from 'vitest'
import { EnhancedErrorHandler } from '../utils/enhanced-error-handler'
import { DrizzleasyError } from '../utils/error-factory'

describe('EnhancedErrorHandler', () => {
    let handler: EnhancedErrorHandler

    beforeEach(() => {
        handler = new EnhancedErrorHandler('development')
    })

    it('should categorize connection errors correctly', () => {
        const connectionError = new Error('connection refused')
        const category = handler.categorizeError(connectionError)
        expect(category).toBe('CONNECTION')
    })

    it('should categorize validation errors correctly', () => {
        const validationError = new Error('validation failed: required field missing')
        const category = handler.categorizeError(validationError)
        expect(category).toBe('VALIDATION')
    })

    it('should create enhanced error with proper structure', () => {
        const originalError = new Error('Test error')
        const enhanced = handler.createEnhancedError(originalError, {
            table: 'users',
            operation: 'create'
        })

        expect(enhanced).toHaveProperty('category')
        expect(enhanced).toHaveProperty('severity')
        expect(enhanced).toHaveProperty('userMessage')
        expect(enhanced).toHaveProperty('developerMessage')
        expect(enhanced).toHaveProperty('actionable')
        expect(enhanced).toHaveProperty('retryable')
        expect(enhanced).toHaveProperty('timestamp')
        expect(enhanced.details?.table).toBe('users')
    })

    it('should sanitize errors in production mode', () => {
        const productionHandler = new EnhancedErrorHandler('production')
        const error = new Error('Database error with password=secret123')
        
        const enhanced = productionHandler.createEnhancedError(error)
        
        expect(enhanced.developerMessage).toContain('password=***')
        expect(enhanced.details?.stack).toBeUndefined()
    })

    it('should provide actionable resolution steps', () => {
        const connectionError = new Error('ECONNREFUSED')
        const enhanced = handler.createEnhancedError(connectionError)
        
        expect(enhanced.actionable).toBe(true)
        expect(enhanced.details?.resolutionSteps).toBeDefined()
        expect(enhanced.details?.resolutionSteps?.length).toBeGreaterThan(0)
    })
})

describe('DrizzleasyError Factory', () => {
    it('should create validation error with enhanced structure', () => {
        const error = DrizzleasyError.validation('Invalid data', { name: ['Required'] }, 'users')
        
        expect(error.category).toBe('VALIDATION')
        expect(error.userMessage).toBeDefined()
        expect(error.developerMessage).toBeDefined()
        expect(error.details?.fields).toEqual({ name: ['Required'] })
        expect(error.details?.table).toBe('users')
    })

    it('should handle database errors with categorization', () => {
        const dbError = new Error('duplicate key value violates unique constraint')
        const error = DrizzleasyError.fromDatabaseError(dbError, 'users', 'create')
        
        expect(error.category).toBe('CONSTRAINT')
        expect(error.details?.table).toBe('users')
        expect(error.retryable).toBe(false)
    })
})