import { describe, test, expect, vi } from 'vitest'
import { execute } from '../core/execute'

describe('Execute', () => {
    test('wraps successful operations in enhanced result format', async () => {
        const result = await execute(async () => {
            return 'success'
        })

        expect(result).toEqual({
            data: 'success',
            meta: expect.objectContaining({
                duration: expect.any(Number),
                cached: false,
                operation: undefined,
                affected: undefined
            })
        })
    })

    test('wraps thrown errors in enhanced result format', async () => {
        const result = await execute(async () => {
            throw new Error('Something went wrong')
        })

        expect(result).toEqual({
            error: expect.objectContaining({
                message: 'Something went wrong',
                category: expect.any(String),
                severity: expect.any(String),
                code: expect.any(String),
                userMessage: expect.any(String),
                developerMessage: expect.any(String),
                actionable: expect.any(Boolean),
                retryable: expect.any(Boolean),
                timestamp: expect.any(Date)
            }),
            meta: expect.objectContaining({
                duration: expect.any(Number),
                cached: false,
                operation: undefined
            })
        })
    })

    test('handles non-Error thrown values', async () => {
        const result = await execute(async () => {
            throw 'String error'
        })

        expect(result).toEqual({
            error: expect.objectContaining({
                message: 'String error',
                category: expect.any(String),
                severity: expect.any(String),
                code: expect.any(String),
                userMessage: expect.any(String),
                developerMessage: expect.any(String),
                actionable: expect.any(Boolean),
                retryable: expect.any(Boolean),
                timestamp: expect.any(Date),
                details: expect.objectContaining({
                    originalError: 'String error'
                })
            }),
            meta: expect.objectContaining({
                duration: expect.any(Number),
                cached: false,
                operation: undefined
            })
        })
    })
})
