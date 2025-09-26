/**
 * Drizzleasy - Ultra-simple, type-safe CRUD operations for Next.js with Drizzle ORM
 *
 * Provides a set of utilities and factory functions to quickly perform
 * typed CRUD operations, manage database connections, and handle
 * client-side optimistic updates.
 *
 * @module drizzleasy
 */

/**
 * Types used across Drizzleasy for entities, responses, and configuration.
 * @see ./types
 */
export type * from './types'

/**
 * Hook to perform optimistic CRUD operations on the client side.
 * @returns {object} Methods and state for client-side CRUD with optimistic updates.
 * @see ./client
 */
export { useOptimisticCrud, withTransition } from './client'
