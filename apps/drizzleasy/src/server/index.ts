/**
 * Server-only exports for Drizzleasy
 * 
 * This entry point contains only server-side functionality
 * and should not be imported in client components.
 */

/**
 * Main CRUD interface for performing basic create, read, update, and delete operations.
 */
export { crud } from '../core'

/**
 * Initializes a database connection.
 */
export { initializeConnection } from '../database'

/**
 * Configure global Drizzleasy settings.
 */
export { configure } from '../config'

/**
 * Factory functions to create type-safe CRUD operations for entities.
 */
export { createFn, readFn, updateFn, destroyFn } from '../factory'

/**
 * Types used across Drizzleasy for entities, responses, and configuration.
 */
export type * from '../types'

/**
 * Production utilities for error handling, performance monitoring, and environment validation.
 */
export * from '../utils'

/**
 * CLI interface for programmatic CRUD or setup operations.
 */
export { run as runCli } from '../cli'