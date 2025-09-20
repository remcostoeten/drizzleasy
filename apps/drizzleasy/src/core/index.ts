// Legacy string-based CRUD (deprecated)
export { crud as legacyCrud } from './crud'

// New table-first CRUD (recommended)
export { tableCrud as crud } from './table-crud'

// Batch operations
export { batch } from './batch'
export type { TBatchResult, TBatchOptions } from './batch'
