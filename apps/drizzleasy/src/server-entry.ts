/**
 * Drizzleasy Server Entrypoint
 * 
 * Server-side exports including database operations, configuration,
 * and utilities that require Node.js runtime features.
 */

// Main CRUD interface
export { crud, batch, execute, executeWithRetry } from './core'
export type { TBatchResult, TBatchOptions, TExecuteOptions } from './core'

// Database initialization and configuration
export { initializeConnection } from './database'
export { configure } from './config'

// Factory functions (deprecated but included for compatibility)

// Types
export type * from './types'

// All utilities including server-side ones
export * from './utils'

// Config loader with fs/path/glob dependencies
export { loadSchemaFromConfig, findDrizzleConfig } from './database/config-loader'
