# Pagination Support

See usage examples: [usage-examples.md](./usage-examples.md)

Status: Updated for drizzleasy 0.12.0 — introduce orderBy/limit/offset on the read builder as groundwork; table-first API unchanged.

## Priority: 🟡 MEDIUM

## Problem Description

Currently, drizzleasy provides no built-in pagination support, requiring users to manually implement limit/offset logic and metadata calculation. This leads to:

1. **Performance Issues**: Loading entire datasets instead of pages
2. **Memory Problems**: Large datasets can exhaust memory
3. **Inconsistent Implementation**: Each developer implements pagination differently
4. **Missing Metadata**: No information about total records, pages, or navigation
5. **Poor User Experience**: No standardized pagination patterns

### Current Manual Implementation

```typescript
// Users must manually implement pagination
const read = readFn<TUser>();

// Get page 2 with 20 items per page
const offset = (2 - 1) * 20;
const { data: users } = await read('users')
  .limit(20)
  .offset(offset)(); // These methods don't exist yet

// No metadata about total count, pages, etc.
// Need separate query to get total count
const { data: totalUsers } = await read('users')();
const totalCount = totalUsers?.length || 0;
const totalPages = Math.ceil(totalCount / 20);

// Manual pagination metadata calculation
const paginationInfo = {
  currentPage: 2,
  totalPages,
  totalCount,
  hasNextPage: 2 < totalPages,
  hasPrevPage: 2 > 1
};
```

### Database Performance Impact

- **Full Table Scans**: Without proper limit/offset, entire tables are loaded
- **Memory Usage**: Large datasets consume excessive memory
- **Network Transfer**: Unnecessary data transfer for unused records
- **Query Inefficiency**: Multiple queries needed for count + data

## High-Level Solution

Zero-Generics Type Inference (read builder):
- The read builder is table-first, so the data and field keys (for future orderBy) are inferred from `table.$inferSelect`.
- Method chaining preserves the inferred types through the builder.

Implement comprehensive pagination support that provides:

1. **Built-in Pagination Methods**: `paginate()`, `page()`, `limit()`, `offset()`
2. **Metadata Generation**: Automatic calculation of pagination information
3. **Cursor-based Pagination**: For better performance on large datasets
4. **Flexible Configuration**: Different pagination strategies per use case
5. **Type Safety**: Full TypeScript support with proper inference

## Why This Solution Over Alternatives

### Alternative A: Separate Pagination Hook/Utility
```typescript
const { data, pagination } = usePagination(
  () => read('users')(),
  { pageSize: 20 }
);
```
**Rejected because:**
- Creates separate API surface to learn
- Doesn't integrate with existing query building
- Requires framework-specific implementations
- Duplicates query logic

### Alternative B: External Pagination Wrapper
```typescript
const paginatedRead = withPagination(read);
const result = await paginatedRead('users').paginate(1, 20);
```
**Rejected because:**
- Breaks the factory function pattern
- Requires wrapping every operation
- Inconsistent with core API design
- Additional complexity for users

### Alternative C: Query Builder Extension Only
```typescript
// Add only limit/offset without metadata
const { data } = await read('users').limit(20).offset(40)();
```
**Rejected because:**
- Doesn't solve metadata calculation problem
- Users still need to implement pagination logic
- No standardized pagination response format
- Misses cursor-based pagination benefits

## Proposed Implementation

### 1. Core Pagination Types

```typescript
export type TPaginationOptions = {
  /** Current page number (1-based) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Maximum allowed page size (prevents abuse) */
  maxPageSize?: number;
  /** Whether to include total count (can be expensive) */
  includeTotalCount?: boolean;
};

export type TCursorOptions = {
  /** Number of items to fetch */
  limit: number;
  /** Cursor for pagination (typically ID or timestamp) */
  cursor?: string | number;
  /** Field to use for cursor-based pagination */
  cursorField?: string;
  /** Direction for cursor pagination */
  direction?: 'forward' | 'backward';
};

export type TPaginationMeta = {
  /** Current page number */
  currentPage: number;
  /** Items per page */
  pageSize: number;
  /** Total number of items (if includeTotalCount: true) */
  totalCount?: number;
  /** Total number of pages (if totalCount available) */
  totalPages?: number;
  /** Whether there are more items after this page */
  hasNextPage: boolean;
  /** Whether there are items before this page */
  hasPreviousPage: boolean;
  /** First item index on current page (1-based) */
  firstItemIndex: number;
  /** Last item index on current page (1-based) */
  lastItemIndex: number;
};

export type TCursorMeta = {
  /** Cursor for next page */
  nextCursor?: string | number;
  /** Cursor for previous page */
  previousCursor?: string | number;
  /** Whether there are more items after this cursor */
  hasNext: boolean;
  /** Whether there are items before this cursor */
  hasPrevious: boolean;
  /** Number of items returned */
  count: number;
};

export type TPaginatedResult<T> = {
  /** Paginated data */
  data: T[];
  /** Pagination metadata */
  pagination: TPaginationMeta;
};

export type TCursorResult<T> = {
  /** Paginated data */
  data: T[];
  /** Cursor pagination metadata */
  cursor: TCursorMeta;
};
```

### 2. Enhanced Query Builder

```typescript
// Extend existing read function with pagination methods
export function readFn<T extends TEntity = TEntity>(): 
  (tableName: string) => 
  TQueryBuilder<T>

type TQueryBuilder<T> = (() => Promise<TResult<T[]>>) & {
  where(condition: TWhereClause<T>): TQueryBuilder<T>;
  orderBy(field: keyof T, direction?: 'asc' | 'desc'): TQueryBuilder<T>;
  limit(count: number): TQueryBuilder<T>;
  offset(count: number): TQueryBuilder<T>;
  
  // New pagination methods
  paginate(options: TPaginationOptions): Promise<TPaginatedResult<T>>;
  paginate(page: number, pageSize: number): Promise<TPaginatedResult<T>>;
  
  cursorPaginate(options: TCursorOptions): Promise<TCursorResult<T>>;
  
  byId(id: string | number): Promise<TResult<T | null>>;
};
```

### 3. Pagination Implementation

```typescript
// Offset-based pagination implementation
async function executePagination<T extends TEntity>(
  queryBuilder: any,
  tableName: string,
  options: TPaginationOptions,
  whereConditions: any[] = []
): Promise<TPaginatedResult<T>> {
  const { page, pageSize, maxPageSize = 1000, includeTotalCount = true } = options;
  
  // Validate and sanitize inputs
  const sanitizedPageSize = Math.min(pageSize, maxPageSize);
  const sanitizedPage = Math.max(1, page);
  const offset = (sanitizedPage - 1) * sanitizedPageSize;

  // Build base query
  const table = getTable(tableName);
  let query = dbInstance.select().from(table);
  
  // Apply where conditions
  whereConditions.forEach(condition => {
    query = query.where(condition);
  });

  // Get total count if requested
  let totalCount: number | undefined;
  if (includeTotalCount) {
    let countQuery = dbInstance.select({ count: count() }).from(table);
    whereConditions.forEach(condition => {
      countQuery = countQuery.where(condition);
    });
    const [{ count: total }] = await countQuery;
    totalCount = total;
  }

  // Execute paginated query
  const data = await query
    .limit(sanitizedPageSize + 1) // Get one extra to check for next page
    .offset(offset);

  // Check for next page
  const hasNextPage = data.length > sanitizedPageSize;
  if (hasNextPage) {
    data.pop(); // Remove the extra item
  }

  // Calculate pagination metadata
  const totalPages = totalCount ? Math.ceil(totalCount / sanitizedPageSize) : undefined;
  const firstItemIndex = data.length > 0 ? offset + 1 : 0;
  const lastItemIndex = firstItemIndex + data.length - 1;

  return {
    data: data as T[],
    pagination: {
      currentPage: sanitizedPage,
      pageSize: sanitizedPageSize,
      totalCount,
      totalPages,
      hasNextPage,
      hasPreviousPage: sanitizedPage > 1,
      firstItemIndex,
      lastItemIndex
    }
  };
}
```

### 4. Cursor-based Pagination Implementation

```typescript
// Cursor-based pagination for better performance
async function executeCursorPagination<T extends TEntity>(
  queryBuilder: any,
  tableName: string,
  options: TCursorOptions,
  whereConditions: any[] = []
): Promise<TCursorResult<T>> {
  const { limit, cursor, cursorField = 'id', direction = 'forward' } = options;
  
  const table = getTable(tableName);
  let query = dbInstance.select().from(table);
  
  // Apply where conditions
  whereConditions.forEach(condition => {
    query = query.where(condition);
  });

  // Apply cursor condition
  if (cursor) {
    const operator = direction === 'forward' ? gt : lt;
    query = query.where(operator(table[cursorField], cursor));
  }

  // Order by cursor field
  const orderDirection = direction === 'forward' ? 'asc' : 'desc';
  query = query.orderBy(table[cursorField], orderDirection);

  // Get one extra item to check for next page
  const data = await query.limit(limit + 1);

  // Check for next page and extract cursors
  const hasNext = data.length > limit;
  if (hasNext) {
    data.pop(); // Remove extra item
  }

  const nextCursor = hasNext && data.length > 0 
    ? data[data.length - 1][cursorField] 
    : undefined;
    
  const previousCursor = data.length > 0 && cursor 
    ? data[0][cursorField] 
    : undefined;

  return {
    data: data as T[],
    cursor: {
      nextCursor,
      previousCursor,
      hasNext,
      hasPrevious: !!cursor,
      count: data.length
    }
  };
}
```

### 5. Enhanced Query Builder Implementation

```typescript
export function readFn<T extends TEntity = TEntity>(): 
  (tableName: string) => TQueryBuilder<T> 
{
  return (tableName: string) => {
    let whereConditions: any[] = [];
    let orderByField: keyof T | undefined;
    let orderByDirection: 'asc' | 'desc' = 'asc';
    let limitCount: number | undefined;
    let offsetCount: number | undefined;

    const buildQuery = async (): Promise<TResult<T[]>> => {
      try {
        const table = getTable(tableName);
        let query = dbInstance.select().from(table);
        
        // Apply conditions
        whereConditions.forEach(condition => {
          query = query.where(condition);
        });
        
        if (orderByField) {
          query = query.orderBy(table[orderByField], orderByDirection);
        }
        
        if (limitCount !== undefined) {
          query = query.limit(limitCount);
        }
        
        if (offsetCount !== undefined) {
          query = query.offset(offsetCount);
        }

        const result = await query;
        return { data: result as T[] };
      } catch (error) {
        return { error: error as Error };
      }
    };

    const queryBuilder: TQueryBuilder<T> = Object.assign(buildQuery, {
      where: (condition: TWhereClause<T>) => {
        // Convert condition to Drizzle where clause
        const drizzleCondition = buildWhereCondition(condition);
        whereConditions.push(drizzleCondition);
        return queryBuilder;
      },

      orderBy: (field: keyof T, direction: 'asc' | 'desc' = 'asc') => {
        orderByField = field;
        orderByDirection = direction;
        return queryBuilder;
      },

      limit: (count: number) => {
        limitCount = count;
        return queryBuilder;
      },

      offset: (count: number) => {
        offsetCount = count;
        return queryBuilder;
      },

      // Pagination methods
      paginate: async (
        optionsOrPage: TPaginationOptions | number, 
        pageSize?: number
      ): Promise<TPaginatedResult<T>> => {
        const options: TPaginationOptions = typeof optionsOrPage === 'number' 
          ? { page: optionsOrPage, pageSize: pageSize! }
          : optionsOrPage;
          
        return await executePagination(queryBuilder, tableName, options, whereConditions);
      },

      cursorPaginate: async (options: TCursorOptions): Promise<TCursorResult<T>> => {
        return await executeCursorPagination(queryBuilder, tableName, options, whereConditions);
      },

      byId: async (id: string | number): Promise<TResult<T | null>> => {
        try {
          const table = getTable(tableName);
          const result = await dbInstance.select().from(table).where(eq(table.id, id)).limit(1);
          return { data: result[0] as T || null };
        } catch (error) {
          return { error: error as Error };
        }
      }
    });

    return queryBuilder;
  };
}
```

## Usage Examples

### 1. Basic Offset Pagination

```typescript
const read = readFn<TUser>();

// Simple pagination
const { data: users, pagination } = await read('users')
  .where({ active: true })
  .orderBy('createdAt', 'desc')
  .paginate(2, 20); // Page 2, 20 items per page

console.log(`Page ${pagination.currentPage} of ${pagination.totalPages}`);
console.log(`Showing ${pagination.firstItemIndex}-${pagination.lastItemIndex} of ${pagination.totalCount} users`);

if (pagination.hasNextPage) {
  const nextPage = await read('users').paginate(pagination.currentPage + 1, 20);
}
```

### 2. Advanced Pagination with Options

```typescript
const { data: posts, pagination } = await read('posts')
  .where({ published: true })
  .orderBy('publishedAt', 'desc')
  .paginate({
    page: 1,
    pageSize: 10,
    maxPageSize: 100,
    includeTotalCount: true
  });

// Use pagination metadata for UI
const paginationComponent = {
  currentPage: pagination.currentPage,
  totalPages: pagination.totalPages!,
  hasNext: pagination.hasNextPage,
  hasPrevious: pagination.hasPreviousPage,
  itemsShown: `${pagination.firstItemIndex}-${pagination.lastItemIndex}`,
  totalItems: pagination.totalCount!
};
```

### 3. Cursor-based Pagination

```typescript
// First page
const firstPage = await read('messages')
  .where({ channelId: 'channel-123' })
  .cursorPaginate({
    limit: 20,
    cursorField: 'createdAt',
    direction: 'forward'
  });

// Next page using cursor
if (firstPage.cursor.hasNext) {
  const nextPage = await read('messages')
    .where({ channelId: 'channel-123' })
    .cursorPaginate({
      limit: 20,
      cursor: firstPage.cursor.nextCursor,
      cursorField: 'createdAt',
      direction: 'forward'
    });
}
```

### 4. React Hook Integration

```typescript
function usePaginatedData<T extends TEntity>(
  queryFn: () => TQueryBuilder<T>,
  initialPage: number = 1,
  pageSize: number = 20
) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<TPaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadPage = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await queryFn().paginate(page, pageSize);
      setData(result.data);
      setPagination(result.pagination);
      setCurrentPage(page);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [queryFn, pageSize]);

  const nextPage = useCallback(() => {
    if (pagination?.hasNextPage) {
      loadPage(currentPage + 1);
    }
  }, [pagination, currentPage, loadPage]);

  const previousPage = useCallback(() => {
    if (pagination?.hasPreviousPage) {
      loadPage(currentPage - 1);
    }
  }, [pagination, currentPage, loadPage]);

  const goToPage = useCallback((page: number) => {
    loadPage(page);
  }, [loadPage]);

  useEffect(() => {
    loadPage(initialPage);
  }, [loadPage, initialPage]);

  return {
    data,
    pagination,
    loading,
    error,
    currentPage,
    nextPage,
    previousPage,
    goToPage,
    refresh: () => loadPage(currentPage)
  };
}

// Usage in component
function UserList() {
  const read = readFn<TUser>();
  const {
    data: users,
    pagination,
    loading,
    nextPage,
    previousPage,
    goToPage
  } = usePaginatedData(() => read('users').where({ active: true }));

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {users.map(user => <UserCard key={user.id} user={user} />)}
      
      <PaginationControls
        pagination={pagination!}
        onNext={nextPage}
        onPrevious={previousPage}
        onGoToPage={goToPage}
      />
    </div>
  );
}
```

## Performance Optimizations

### 1. Count Query Optimization

```typescript
// Option to skip expensive count queries
const { data, pagination } = await read('users')
  .paginate({
    page: 1,
    pageSize: 20,
    includeTotalCount: false // Skip count for better performance
  });

// Pagination without total count still provides hasNextPage
if (pagination.hasNextPage) {
  // Load next page
}
```

### 2. Cursor Pagination for Large Datasets

```typescript
// Better performance for large datasets
const messages = await read('messages')
  .where({ channelId: 'busy-channel' })
  .cursorPaginate({
    limit: 50,
    cursorField: 'timestamp', // Use indexed timestamp field
    direction: 'forward'
  });

// No need for count queries or offset calculations
```

### 3. Smart Caching

```typescript
// Add caching support for pagination results
const { data, pagination } = await read('posts')
  .where({ category: 'tech' })
  .paginate(1, 20, { 
    cache: true, 
    cacheTTL: 300 // 5 minutes
  });
```

## Testing Strategy

### 1. Pagination Logic Testing

```typescript
describe('Pagination', () => {
  test('should paginate results correctly', async () => {
    // Create test data
    const testUsers = Array.from({ length: 25 }, (_, i) => ({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`
    }));
    
    const batchCreate = batchCreateFn<TUser>();
    await batchCreate('users')(testUsers);

    // Test first page
    const read = readFn<TUser>();
    const page1 = await read('users').paginate(1, 10);
    
    expect(page1.data).toHaveLength(10);
    expect(page1.pagination.currentPage).toBe(1);
    expect(page1.pagination.hasNextPage).toBe(true);
    expect(page1.pagination.hasPreviousPage).toBe(false);
    expect(page1.pagination.totalCount).toBe(25);
    expect(page1.pagination.totalPages).toBe(3);

    // Test middle page
    const page2 = await read('users').paginate(2, 10);
    expect(page2.data).toHaveLength(10);
    expect(page2.pagination.hasNextPage).toBe(true);
    expect(page2.pagination.hasPreviousPage).toBe(true);

    // Test last page
    const page3 = await read('users').paginate(3, 10);
    expect(page3.data).toHaveLength(5);
    expect(page3.pagination.hasNextPage).toBe(false);
    expect(page3.pagination.hasPreviousPage).toBe(true);
  });
});
```

### 2. Performance Testing

```typescript
describe('Pagination Performance', () => {
  test('should perform better than loading all records', async () => {
    // Create large dataset
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      name: `User ${i}`,
      data: 'x'.repeat(100) // Some data to make records substantial
    }));
    
    await batchCreate('users')(largeDataset);

    // Measure full load time
    const fullLoadStart = Date.now();
    const { data: allUsers } = await read('users')();
    const fullLoadTime = Date.now() - fullLoadStart;

    // Measure paginated load time
    const paginatedStart = Date.now();
    const { data: pageUsers } = await read('users').paginate(1, 100);
    const paginatedTime = Date.now() - paginatedStart;

    // Pagination should be significantly faster
    expect(paginatedTime).toBeLessThan(fullLoadTime / 10);
    expect(pageUsers).toHaveLength(100);
  });
});
```

## Success Metrics

1. **Performance**: 80% reduction in query time for large datasets
2. **Memory Usage**: Constant memory usage regardless of total record count
3. **Developer Experience**: One-line pagination implementation
4. **Consistency**: Standardized pagination across all applications
5. **Flexibility**: Support for both offset and cursor-based pagination

## Backwards Compatibility

- ✅ Existing query methods continue working unchanged
- ✅ New pagination methods are additive only
- ✅ No breaking changes to current API
- ✅ Optional adoption - developers can use when needed

## Future Enhancements

1. **Infinite Scroll Support**: Built-in infinite scroll pagination
2. **Virtual Scrolling**: Integration with virtual scrolling libraries
3. **Smart Prefetching**: Automatic prefetching of next pages
4. **Search Integration**: Pagination with full-text search
5. **Real-time Updates**: Live pagination with WebSocket updates