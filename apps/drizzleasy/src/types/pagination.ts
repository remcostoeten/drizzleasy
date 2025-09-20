/**
 * Options for offset-based pagination
 */
export type TPaginationOptions = {
    /** Current page number (1-based) */
    page: number
    /** Number of items per page */
    pageSize: number
    /** Maximum allowed page size (prevents abuse) */
    maxPageSize?: number
    /** Whether to include total count (can be expensive) */
    includeTotalCount?: boolean
}

/**
 * Options for cursor-based pagination
 */
export type TCursorOptions = {
    /** Number of items to fetch */
    limit: number
    /** Cursor for pagination (typically ID or timestamp) */
    cursor?: string | number
    /** Field to use for cursor-based pagination */
    cursorField?: string
    /** Direction for cursor pagination */
    direction?: 'forward' | 'backward'
}

/**
 * Metadata for offset-based pagination
 */
export type TPaginationMeta = {
    /** Current page number */
    currentPage: number
    /** Items per page */
    pageSize: number
    /** Total number of items (if includeTotalCount: true) */
    totalCount?: number
    /** Total number of pages (if totalCount available) */
    totalPages?: number
    /** Whether there are more items after this page */
    hasNextPage: boolean
    /** Whether there are items before this page */
    hasPreviousPage: boolean
    /** First item index on current page (1-based) */
    firstItemIndex: number
    /** Last item index on current page (1-based) */
    lastItemIndex: number
}

/**
 * Metadata for cursor-based pagination
 */
export type TCursorMeta = {
    /** Cursor for next page */
    nextCursor?: string | number
    /** Cursor for previous page */
    previousCursor?: string | number
    /** Whether there are more items after this cursor */
    hasNext: boolean
    /** Whether there are items before this cursor */
    hasPrevious: boolean
    /** Number of items returned */
    count: number
}

/**
 * Result with offset-based pagination
 */
export type TPaginatedResult<T> = {
    /** Paginated data */
    data: T[]
    /** Pagination metadata */
    pagination: TPaginationMeta
}

/**
 * Result with cursor-based pagination
 */
export type TCursorResult<T> = {
    /** Paginated data */
    data: T[]
    /** Cursor pagination metadata */
    cursor: TCursorMeta
}