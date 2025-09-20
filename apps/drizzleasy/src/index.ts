/**
 * Drizzleasy - Ultra-simple, type-safe CRUD operations for Next.js with Drizzle ORM
 *
 * Provides table-first CRUD operations with zero-generics type inference,
 * database connection management, and client-side optimistic updates.
 *
 * @module drizzleasy
 */

/**
 * Main CRUD interface with table-first API and full type safety.
 * @see ./core
 */
export { crud } from './core'

/**
 * Initializes a database connection.
 * @param {string} connectionString - The database URL/connection string.
 * @returns {Promise<DatabaseConnection>} A promise that resolves to a connected database instance.
 * @see ./database
 */
export { initializeConnection } from './database'

/**
 * Configure global Drizzleasy settings.
 * @param {DrizzleasyConfig} config - Configuration object for Drizzleasy.
 * @see ./config
 */
export { configure } from './config'

/**
 * Hook to perform optimistic CRUD operations on the client side.
 * @returns {object} Methods and state for client-side CRUD with optimistic updates.
 * @see ./client
 */
export { useOptimisticCrud, withTransition } from './client'

/**
 * Types used across Drizzleasy for entities, responses, and configuration.
 * @see ./types
 */
export type * from './types'

/**
 * Production utilities for error handling, performance monitoring, and environment validation.
 * @see ./utils
 */
export * from './utils'

/**
 * CLI interface for programmatic CRUD or setup operations.
 * @example
 * ```bash
 * npx drizzleasy run
 * ```
 * @see ./cli
 */
export { run as runCli } from './cli'
