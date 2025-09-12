import type { TResult } from '../types'

export function safeExecute<T>(operation: () => Promise<T>): Promise<TResult<T>> {
  return (async () => {
    try {
      const data = await operation()
      return { data }
    } catch (error) {
      return { error: error as Error }
    }
  })()
}