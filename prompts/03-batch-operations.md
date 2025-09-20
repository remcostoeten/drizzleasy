# Batch Operations Support

See usage examples: [usage-examples.md](./usage-examples.md)

Status: Updated for drizzleasy 0.12.0 — aligns with unified create and table-first API. No changes in scope; batch APIs should inherit idStrategy and table-first typing.

## Priority: 🟡 MEDIUM

## Problem Description

Currently, drizzleasy requires individual operations for creating, updating, or deleting multiple records. This leads to:

1. **Performance Issues**: Multiple database round trips instead of single batch operation
2. **Transaction Complexity**: Users must manually handle transactions for consistency
3. **Verbose Code**: Repetitive loops and error handling for bulk operations
4. **Memory Inefficiency**: Loading and processing records one at a time

### Current Inefficient Pattern
```typescript
// Creating multiple categories - requires N database calls
const categories = ['Work', 'Personal', 'Finance'];
const createCategory = createFn<TCategory>();

for (const name of categories) {
  const { error } = await createCategory('categories')({
    id: nanoid(),
    name,
    color: '#6366f1',
    userId: 'user123'
  });
  
  if (error) {
    // Handle individual errors - complex rollback logic needed
    console.error(`Failed to create ${name}:`, error);
  }
}
```

### Database Performance Impact
- **N+1 Query Problem**: Each operation creates a separate database connection
- **Network Overhead**: Multiple round trips to database
- **Transaction Isolation**: Difficult to ensure atomicity across multiple operations
- **Resource Waste**: Connection pooling not utilized effectively

## High-Level Solution

Zero-Generics Type Inference (batch):
- Batch operations accept the table object so input arrays are typed as `typeof table.$inferInsert[]` (createMany) or appropriate update shapes (updateMany).
- No `<T>` at call sites — types flow from the table.

Implement comprehensive batch operation factory functions that:

1. **Batch Create**: Insert multiple records in single database call
2. **Batch Update**: Update multiple records with different data
3. **Batch Delete**: Delete multiple records by IDs or conditions
4. **Transaction Support**: Automatic transaction wrapping for consistency
5. **Partial Success Handling**: Continue processing on individual failures

## Why This Solution Over Alternatives

### Alternative A: User-Level Transaction Wrapper
```typescript
await db.transaction(async (tx) => {
  for (const item of items) {
    await tx.insert(table).values(item);
  }
});
```
**Rejected because:**
- Users need to understand transaction APIs
- Verbose and error-prone
- No type safety for batch operations
- Doesn't leverage batch insert optimizations

### Alternative B: Array Parameter in Existing Functions
```typescript
const create = createFn<T>();
await create('table')([item1, item2, item3]); // Overload existing function
```
**Rejected because:**
- Breaking change to existing API
- Inconsistent with single-item semantics
- Type inference becomes complex
- Harder to distinguish batch vs single operations

### Alternative C: Separate Batch Namespace
```typescript
import { batch } from '@remcostoeten/drizzleasy';
await batch.create('table')(items);
```
**Rejected because:**
- Inconsistent with factory function pattern
- Separate import path reduces discoverability
- Doesn't follow established API conventions

## Proposed Implementation

### 1. Batch Create Operations

```typescript
export function batchCreateFn<T extends TEntity = TEntity>(): 
  (tableName: string) => 
  (data: TCreateInput<T>[]) => 
  Promise<TBatchResult<T[]>>

// Usage
const batchCreate = batchCreateFn<TCategory>();
const { data, errors, partialSuccess } = await batchCreate('categories')([
  { name: 'Work', color: '#ff0000', userId: 'user123' },
  { name: 'Personal', color: '#00ff00', userId: 'user123' },
  { name: 'Finance', color: '#0000ff', userId: 'user123' }
]);

if (partialSuccess) {
  console.log(`Created ${data.length} of ${data.length + errors.length} records`);
  errors.forEach(({ index, error }) => {
    console.error(`Failed to create item ${index}:`, error.message);
  });
}
```

### 2. Batch Update Operations

```typescript
export function batchUpdateFn<T extends TEntity = TEntity>(): 
  (tableName: string) => 
  (updates: Array<{ id: string | number; data: TUpdateInput<T> }>) => 
  Promise<TBatchResult<T[]>>

// Usage
const batchUpdate = batchUpdateFn<TCategory>();
const { data, errors } = await batchUpdate('categories')([
  { id: 'cat1', data: { name: 'Updated Work' } },
  { id: 'cat2', data: { color: '#ff00ff' } },
  { id: 'cat3', data: { name: 'Updated Finance', color: '#ffff00' } }
]);
```

### 3. Batch Delete Operations

```typescript
export function batchDeleteFn<T extends TEntity = TEntity>(): 
  (tableName: string) => 
  (ids: Array<string | number>) => 
  Promise<TBatchResult<T[]>>

// Usage
const batchDelete = batchDeleteFn<TCategory>();
const { data, errors } = await batchDelete('categories')([
  'cat1', 'cat2', 'cat3'
]);
```

### 4. Enhanced Result Type

```typescript
export type TBatchResult<T> = {
  /** Successfully processed records */
  data: T;
  /** Errors that occurred during batch operation */
  errors: Array<{
    /** Index in original array where error occurred */
    index: number;
    /** The error that occurred */
    error: Error;
    /** The data that failed to process */
    failedData?: any;
  }>;
  /** True if some operations succeeded and some failed */
  partialSuccess: boolean;
  /** Metadata about the batch operation */
  meta: {
    /** Total number of items processed */
    total: number;
    /** Number of successful operations */
    successful: number;
    /** Number of failed operations */
    failed: number;
    /** Time taken for the batch operation */
    duration: number;
  };
};
```

## Advanced Features

### 1. Transaction Control

```typescript
export function batchCreateFn<T extends TEntity = TEntity>(options?: TBatchOptions): 
  (tableName: string) => 
  (data: TCreateInput<T>[]) => 
  Promise<TBatchResult<T[]>>

type TBatchOptions = {
  /** Whether to wrap in transaction (default: true) */
  transaction?: boolean;
  /** How to handle individual failures */
  failureMode?: 'abort' | 'continue' | 'rollback';
  /** Batch size for large datasets */
  batchSize?: number;
  /** Whether to return created records */
  returning?: boolean;
};

// Usage with options
const batchCreate = batchCreateFn<TCategory>({
  transaction: true,      // Wrap in transaction
  failureMode: 'continue', // Continue on individual failures
  batchSize: 1000,        // Process 1000 at a time
  returning: true         // Return created records
});
```

### 2. Conditional Batch Operations

```typescript
export function batchUpsertFn<T extends TEntity = TEntity>(): 
  (tableName: string) => 
  (data: Array<TCreateInput<T> & { id?: string }>) => 
  Promise<TBatchResult<T[]>>

// Inserts new records, updates existing ones
const batchUpsert = batchUpsertFn<TCategory>();
const { data } = await batchUpsert('categories')([
  { id: 'existing-1', name: 'Updated Work' },      // Updates existing
  { name: 'New Category', color: '#ff0000' },      // Creates new
  { id: 'existing-2', color: '#00ff00' }           // Updates existing
]);
```

### 3. Batch Operations with Relations

```typescript
export function batchCreateWithRelationsFn<T extends TEntity = TEntity>(): 
  (tableName: string) => 
  (data: Array<TCreateInput<T> & { relations?: Record<string, any[]> }>) => 
  Promise<TBatchResult<T[]>>

// Create categories with related passwords
const batchCreateWithRelations = batchCreateWithRelationsFn<TCategory>();
const { data } = await batchCreateWithRelations('categories')([
  {
    name: 'Work',
    relations: {
      passwords: [
        { title: 'Work Email', encryptedPassword: 'xxx' },
        { title: 'Work VPN', encryptedPassword: 'yyy' }
      ]
    }
  }
]);
```

## Implementation Details

### 1. Database Driver Integration

```typescript
// Leverage Drizzle's batch operations
async function executeBatchCreate<T>(
  tableName: string, 
  data: TCreateInput<T>[], 
  options: TBatchOptions
): Promise<T[]> {
  const table = getTable(tableName);
  
  if (options.transaction) {
    return await dbInstance.transaction(async (tx) => {
      if (options.batchSize && data.length > options.batchSize) {
        // Process in chunks
        const results: T[] = [];
        for (let i = 0; i < data.length; i += options.batchSize) {
          const chunk = data.slice(i, i + options.batchSize);
          const chunkResults = await tx.insert(table).values(chunk).returning();
          results.push(...chunkResults as T[]);
        }
        return results;
      } else {
        // Single batch operation
        return await tx.insert(table).values(data).returning() as T[];
      }
    });
  } else {
    // No transaction
    return await dbInstance.insert(table).values(data).returning() as T[];
  }
}
```

### 2. Error Handling Strategy

```typescript
async function safeBatchOperation<T>(
  operation: () => Promise<T[]>,
  data: any[],
  options: TBatchOptions
): Promise<TBatchResult<T[]>> {
  const startTime = Date.now();
  const errors: Array<{ index: number; error: Error; failedData?: any }> = [];
  let results: T[] = [];

  try {
    if (options.failureMode === 'continue') {
      // Process individually to isolate failures
      for (let i = 0; i < data.length; i++) {
        try {
          const result = await processSingle(data[i]);
          results.push(result);
        } catch (error) {
          errors.push({
            index: i,
            error: error as Error,
            failedData: data[i]
          });
        }
      }
    } else {
      // Process as batch, fail fast
      results = await operation();
    }
  } catch (error) {
    if (options.failureMode === 'rollback') {
      // Transaction will auto-rollback
      throw error;
    } else {
      // Convert to batch error format
      errors.push({
        index: 0,
        error: error as Error,
        failedData: data
      });
    }
  }

  const duration = Date.now() - startTime;
  
  return {
    data: results,
    errors,
    partialSuccess: results.length > 0 && errors.length > 0,
    meta: {
      total: data.length,
      successful: results.length,
      failed: errors.length,
      duration
    }
  };
}
```

### 3. Type Safety Enhancements

```typescript
// Ensure batch operations maintain full type safety
type TBatchCreateInput<T extends TEntity> = Array<TCreateInput<T>>;
type TBatchUpdateInput<T extends TEntity> = Array<{
  id: T['id'];
  data: TUpdateInput<T>;
}>;

// Generic batch processor with proper typing
function createBatchProcessor<
  T extends TEntity,
  TInput,
  TOutput = T[]
>(
  processor: (tableName: string, data: TInput) => Promise<TOutput>
): (tableName: string) => (data: TInput) => Promise<TBatchResult<TOutput>> {
  return (tableName: string) => {
    return async (data: TInput) => {
      return await safeBatchOperation(
        () => processor(tableName, data),
        Array.isArray(data) ? data : [data],
        defaultBatchOptions
      );
    };
  };
}
```

## Testing Strategy

### 1. Performance Testing

```typescript
describe('Batch Operations Performance', () => {
  test('should outperform individual operations', async () => {
    const data = Array.from({ length: 100 }, (_, i) => ({
      name: `Category ${i}`,
      userId: 'test-user'
    }));

    // Measure individual operations
    const individualStart = Date.now();
    const create = createFn<TCategory>();
    for (const item of data) {
      await create('categories')(item);
    }
    const individualTime = Date.now() - individualStart;

    // Measure batch operation
    const batchStart = Date.now();
    const batchCreate = batchCreateFn<TCategory>();
    await batchCreate('categories')(data);
    const batchTime = Date.now() - batchStart;

    // Batch should be significantly faster
    expect(batchTime).toBeLessThan(individualTime * 0.5);
  });
});
```

### 2. Error Handling Testing

```typescript
describe('Batch Error Handling', () => {
  test('should handle partial failures correctly', async () => {
    const batchCreate = batchCreateFn<TCategory>({
      failureMode: 'continue'
    });

    const data = [
      { name: 'Valid 1', userId: 'user123' },
      { name: 'Valid 2', userId: 'user123' },
      { /* invalid data */ },
      { name: 'Valid 3', userId: 'user123' }
    ];

    const result = await batchCreate('categories')(data);

    expect(result.data).toHaveLength(3); // 3 successful
    expect(result.errors).toHaveLength(1); // 1 failed
    expect(result.partialSuccess).toBe(true);
    expect(result.errors[0].index).toBe(2);
  });
});
```

### 3. Transaction Testing

```typescript
describe('Batch Transactions', () => {
  test('should rollback all changes on failure', async () => {
    const batchCreate = batchCreateFn<TCategory>({
      transaction: true,
      failureMode: 'rollback'
    });

    const countBefore = await countCategories();
    
    try {
      await batchCreate('categories')([
        { name: 'Valid', userId: 'user123' },
        { /* invalid data that will cause failure */ }
      ]);
    } catch (error) {
      // Expected to fail
    }

    const countAfter = await countCategories();
    expect(countAfter).toBe(countBefore); // No changes persisted
  });
});
```

## Migration Guide

### From Individual Operations
```typescript
// Before - Individual operations
const create = createFn<TCategory>();
const results = [];
for (const item of items) {
  const { data, error } = await create('categories')(item);
  if (error) {
    console.error('Failed:', error);
  } else {
    results.push(data[0]);
  }
}

// After - Batch operations
const batchCreate = batchCreateFn<TCategory>({
  failureMode: 'continue'
});
const { data, errors } = await batchCreate('categories')(items);
errors.forEach(({ index, error }) => {
  console.error(`Failed item ${index}:`, error);
});
```

## Success Metrics

1. **Performance**: 5-10x faster than individual operations for batches > 10 items
2. **Memory Usage**: Constant memory usage regardless of batch size
3. **Error Handling**: Comprehensive error reporting with partial success support
4. **Developer Experience**: Intuitive API following established patterns
5. **Type Safety**: Full TypeScript support with proper inference

## Future Enhancements

1. **Stream Processing**: Support for processing large datasets from streams
2. **Progress Callbacks**: Real-time progress reporting for long operations  
3. **Retry Logic**: Automatic retry for failed individual operations
4. **Bulk Validation**: Pre-operation validation for entire batches
5. **Custom Batch Sizes**: Dynamic batch sizing based on data complexity

## Implementation Priority

1. **Phase 1**: Basic batch create, update, delete functions
2. **Phase 2**: Advanced options (transaction control, failure modes)
3. **Phase 3**: Batch upsert and conditional operations
4. **Phase 4**: Relations support and streaming capabilities