import { describe, test, expect, vi } from 'vitest'
import { safeExecute } from '../core/execute'

describe('Safe Execute', () => {
    test('wraps successful operations in result format', async () => {
        const result = await safeExecute(async () => {
            return 'success'
        })

        expect(result).toEqual({
            data: 'success',
            error: undefined
        })
    })

    test('wraps thrown errors in result format', async () => {
        const result = await safeExecute(async () => {
            throw new Error('Something went wrong')
        })

        expect(result).toEqual({
            data: undefined,
            error: expect.objectContaining({
                message: 'Something went wrong'
            })
        })
    })

    test('handles non-Error thrown values', async () => {
        const result = await safeExecute(async () => {
            throw 'String error'
        })

        expect(result).toEqual({
            data: undefined,
            error: 'String error'
        })
    })
})
