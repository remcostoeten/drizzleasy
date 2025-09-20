/**
 * Drizzleasy Client Entrypoint
 * 
 * Browser-safe exports only. No fs, path, glob, or dynamic imports.
 * For server/database operations, import from '@remcostoeten/drizzleasy/server'
 */

// Client-safe hooks and utilities
export { useOptimisticCrud, withTransition } from './client'

// Types are always safe to export
export type * from './types'

// Browser-safe utilities only
export { 
    CustomError,
    ValidationError,
    NotFoundError,
    PermissionError,
    DatabaseError,
    NetworkError,
    handleError 
} from './utils/error-handler'

// Re-export performance utilities (browser-safe)
export { measurePerformance } from './utils/performance'