// Main CRUD interface - Primary API
export { crud } from './crud'

// Configuration
export { configure } from './config'

// Factory functions - Typed CRUD operations
export { createFn, readFn, updateFn, destroyFn } from './factory'

// Client-side utilities
export { useOptimisticCrud, withTransition } from './client'

// Types
export type * from './types'
