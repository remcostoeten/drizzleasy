# Enhanced Error Handling

See usage examples: [usage-examples.md](./usage-examples.md)

Status: Updated for drizzleasy 0.12.0 — internal error classes exist; this prompt elevates them to a documented, typed contract (enhanced result shape, categorized errors) and client-friendly mapping.

## Priority: 🟡 MEDIUM

## Problem Description

The current error handling in drizzleasy is basic and provides limited insight into failure causes. The current `TResult<T>` type only includes:

```typescript
type TResult<T> = {
  data?: T;
  error?: Error;
};
```

### Current Limitations

1. **Generic Error Information**: Only basic `Error` object without context
2. **No Error Categorization**: Cannot distinguish between validation, permission, database, or network errors
3. **Limited Debugging Information**: No query information, affected rows, or performance metrics
4. **Poor User Experience**: Developers can't provide specific error messages to users
5. **No Retry Guidance**: No indication of whether operations are retryable

### Real-World Error Scenarios

```typescript
// Current - All errors look the same
const { data, error } = await create('users')({
  email: 'invalid-email',
  name: 'John'
});

if (error) {
  console.error(error.message); // "Validation failed" - not helpful
  // No way to know if it's email format, duplicate key, or database connection
}

// User sees: "Something went wrong" - poor UX
```

## High-Level Solution

Zero-Generics Type Inference:
- Result types remain fully typed without generics at call sites; consumers pass the table and the library infers input/output types from it.
- Enhanced error payloads integrate with the same inferred operation types.

Implement a comprehensive error system that:

1. **Categorizes Errors**: Clear error types for different failure reasons
2. **Provides Context**: Detailed information about what went wrong and where
3. **Includes Metadata**: Query information, performance metrics, retry guidance
4. **Maintains Backward Compatibility**: Existing error handling continues to work
5. **Enables Better UX**: Developers can show meaningful messages to users

## Why This Solution Over Alternatives

### Alternative A: Throw Errors Instead of Returning Them
```typescript
// Instead of { data, error }, just throw
try {
  const result = await create('users')(userData);
} catch (error) {
  // Handle error
}
```
**Rejected because:**
- Breaking change to established API pattern
- Less functional programming style
- Harder to handle multiple operations gracefully
- Inconsistent with current design philosophy

### Alternative B: Add Error Code Property Only
```typescript
type TResult<T> = {
  data?: T;
  error?: Error & { code: string };
};
```
**Rejected because:**
- Too minimal, doesn't solve categorization problem
- No structured information for debugging
- Still requires string parsing for error handling
- Doesn't provide retry guidance

### Alternative C: Separate Error Classes per Operation
```typescript
class CreateError extends Error { }
class UpdateError extends Error { }
class DeleteError extends Error { }
```
**Rejected because:**
- Overly complex for consumers
- Inconsistent error handling patterns
- Hard to share common error types across operations
- Requires instanceof checks instead of simple properties

## Proposed Implementation

### 1. Enhanced Error Type System

```typescript
export type TEnhancedError = {
  /** Error category for programmatic handling */
  type: 'VALIDATION' | 'PERMISSION' | 'NOT_FOUND' | 'DUPLICATE' | 'DATABASE' | 'NETWORK' | 'TIMEOUT' | 'UNKNOWN';
  /** Human-readable error message */
  message: string;
  /** Machine-readable error code */
  code: string;
  /** Additional error details */
  details?: {
    /** Field-specific validation errors */
    fields?: Record<string, string[]>;
    /** Query that failed */
    query?: string;
    /** Table involved in the operation */
    table?: string;
    /** Original database error */
    originalError?: Error;
    /** Suggested user-facing message */
    userMessage?: string;
  };
  /** Whether this operation can be retried */
  retryable: boolean;
  /** When this error occurred */
  timestamp: Date;
};

export type TEnhancedResult<T> = {
  /** Data returned on successful operation */
  data?: T;
  /** Enhanced error information */
  error?: TEnhancedError;
  /** Operation metadata */
  meta?: {
    /** Time taken for the operation */
    duration: number;
    /** Number of rows affected */
    affected?: number;
    /** Whether result was cached */
    cached?: boolean;
  };
};
```

### 2. Error Factory Functions

```typescript
export class DrizzleasyError {
  static validation(message: string, fields?: Record<string, string[]>): TEnhancedError {
    return {
      type: 'VALIDATION',
      message,
      code: 'VALIDATION_ERROR',
      details: {
        fields,
        userMessage: 'Please check the provided information and try again.'
      },
      retryable: true,
      timestamp: new Date()
    };
  }

  static notFound(table: string, id?: string): TEnhancedError {
    return {
      type: 'NOT_FOUND',
      message: `Record not found in ${table}${id ? ` with id: ${id}` : ''}`,
      code: 'RECORD_NOT_FOUND',
      details: {
        table,
        userMessage: 'The requested item could not be found.'
      },
      retryable: false,
      timestamp: new Date()
    };
  }

  static permission(operation: string, table: string): TEnhancedError {
    return {
      type: 'PERMISSION',
      message: `Insufficient permissions for ${operation} on ${table}`,
      code: 'ACCESS_DENIED',
      details: {
        table,
        userMessage: 'You do not have permission to perform this action.'
      },
      retryable: false,
      timestamp: new Date()
    };
  }

  static duplicate(table: string, field: string, value: string): TEnhancedError {
    return {
      type: 'DUPLICATE',
      message: `Duplicate value for ${field}: ${value}`,
      code: 'DUPLICATE_ENTRY',
      details: {
        table,
        fields: { [field]: [`Value '${value}' already exists`] },
        userMessage: `This ${field} is already taken. Please choose a different one.`
      },
      retryable: true,
      timestamp: new Date()
    };
  }

  static database(originalError: Error, query?: string): TEnhancedError {
    return {
      type: 'DATABASE',
      message: 'Database operation failed',
      code: 'DATABASE_ERROR',
      details: {
        originalError,
        query,
        userMessage: 'A technical error occurred. Please try again later.'
      },
      retryable: true,
      timestamp: new Date()
    };
  }
}
```

### 3. Error Detection and Mapping

```typescript
function mapDatabaseError(error: any, context: TOperationContext): TEnhancedError {
  // SQLite errors
  if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return DrizzleasyError.duplicate(
      context.table,
      extractFieldFromError(error.message),
      extractValueFromError(error.message)
    );
  }

  // PostgreSQL errors
  if (error.code === '23505') { // unique_violation
    return DrizzleasyError.duplicate(
      context.table,
      error.detail?.match(/Key \(([^)]+)\)/)?.[1] || 'unknown',
      error.detail?.match(/=\(([^)]+)\)/)?.[1] || 'unknown'
    );
  }

  // MySQL errors
  if (error.code === 'ER_DUP_ENTRY') {
    return DrizzleasyError.duplicate(
      context.table,
      error.message.match(/for key '([^']+)'/)?.[1] || 'unknown',
      'unknown'
    );
  }

  // Connection errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return {
      type: 'NETWORK',
      message: 'Database connection failed',
      code: 'CONNECTION_ERROR',
      details: {
        originalError: error,
        userMessage: 'Unable to connect to the database. Please try again.'
      },
      retryable: true,
      timestamp: new Date()
    };
  }

  // Default to database error
  return DrizzleasyError.database(error, context.query);
}
```

### 4. Context-Aware Operations

```typescript
type TOperationContext = {
  operation: 'create' | 'read' | 'update' | 'delete';
  table: string;
  query?: string;
  userId?: string;
  startTime: number;
};

async function executeWithErrorHandling<T>(
  operation: () => Promise<T>,
  context: TOperationContext
): Promise<TEnhancedResult<T>> {
  try {
    const result = await operation();
    const duration = Date.now() - context.startTime;
    
    return {
      data: result,
      meta: {
        duration,
        affected: Array.isArray(result) ? result.length : 1
      }
    };
  } catch (error) {
    const enhancedError = mapDatabaseError(error, context);
    
    return {
      error: enhancedError,
      meta: {
        duration: Date.now() - context.startTime
      }
    };
  }
}
```

### 5. Validation Integration

```typescript
function validateCreateInput<T extends TEntity>(
  data: TCreateInput<T>,
  tableName: string
): TEnhancedError | null {
  const errors: Record<string, string[]> = {};

  // Example validations
  if ('email' in data && data.email) {
    const email = data.email as string;
    if (!email.includes('@')) {
      errors.email = ['Please enter a valid email address'];
    }
  }

  if ('name' in data && (!data.name || (data.name as string).length < 2)) {
    errors.name = ['Name must be at least 2 characters long'];
  }

  if (Object.keys(errors).length > 0) {
    return DrizzleasyError.validation(
      'Validation failed',
      errors
    );
  }

  return null;
}
```

## Implementation in Factory Functions

### Updated Create Function

```typescript
export function createFn<T extends TEntity = TEntity>(): 
  (tableName: string) => 
  (data: TCreateInput<T>) => 
  Promise<TEnhancedResult<T[]>> 
{
  return (tableName: string) => {
    return async (data: TCreateInput<T>) => {
      const context: TOperationContext = {
        operation: 'create',
        table: tableName,
        startTime: Date.now()
      };

      // Pre-operation validation
      const validationError = validateCreateInput(data, tableName);
      if (validationError) {
        return { 
          error: validationError,
          meta: { duration: Date.now() - context.startTime }
        };
      }

      return executeWithErrorHandling(async () => {
        const table = getTable(tableName);
        const result = await dbInstance.insert(table).values(data).returning();
        return result as T[];
      }, context);
    };
  };
}
```

### Permission Checking Integration

```typescript
async function checkPermissions(
  operation: string,
  tableName: string,
  userId?: string
): Promise<TEnhancedError | null> {
  // Example permission checking logic
  if (!userId) {
    return DrizzleasyError.permission(operation, tableName);
  }

  // Check if user has access to this table
  const hasAccess = await checkUserTableAccess(userId, tableName, operation);
  if (!hasAccess) {
    return DrizzleasyError.permission(operation, tableName);
  }

  return null;
}

// Updated read function with permission checking
export function readFn<T extends TEntity = TEntity>(options?: { checkPermissions?: boolean }): 
  (tableName: string) => 
  (() => Promise<TEnhancedResult<T[]>>) & {
    where(condition: TWhereClause<T>): () => Promise<TEnhancedResult<T[]>>;
    byId(id: string | number): Promise<TEnhancedResult<T | null>>;
  }
{
  return (tableName: string) => {
    const baseQuery = () => async (): Promise<TEnhancedResult<T[]>> => {
      const context: TOperationContext = {
        operation: 'read',
        table: tableName,
        startTime: Date.now()
      };

      // Permission check if enabled
      if (options?.checkPermissions) {
        const permissionError = await checkPermissions('read', tableName);
        if (permissionError) {
          return { error: permissionError };
        }
      }

      return executeWithErrorHandling(async () => {
        const table = getTable(tableName);
        const result = await dbInstance.select().from(table);
        return result as T[];
      }, context);
    };

    return Object.assign(baseQuery(), {
      where: (condition: TWhereClause<T>) => baseQuery(),
      byId: async (id: string | number): Promise<TEnhancedResult<T | null>> => {
        const context: TOperationContext = {
          operation: 'read',
          table: tableName,
          startTime: Date.now()
        };

        return executeWithErrorHandling(async () => {
          const table = getTable(tableName);
          const result = await dbInstance.select().from(table).where(eq(table.id, id)).limit(1);
          return result[0] as T || null;
        }, context);
      }
    });
  };
}
```

## Usage Examples

### 1. Comprehensive Error Handling

```typescript
const create = createFn<TUser>();
const { data, error, meta } = await create('users')({
  email: 'invalid-email',
  name: 'Jo' // Too short
});

if (error) {
  switch (error.type) {
    case 'VALIDATION':
      // Show field-specific errors
      if (error.details?.fields) {
        Object.entries(error.details.fields).forEach(([field, messages]) => {
          console.error(`${field}: ${messages.join(', ')}`);
        });
      }
      break;
      
    case 'DUPLICATE':
      console.error('User already exists:', error.details?.userMessage);
      break;
      
    case 'PERMISSION':
      console.error('Access denied:', error.details?.userMessage);
      break;
      
    case 'DATABASE':
      console.error('Technical error:', error.details?.userMessage);
      if (error.retryable) {
        // Implement retry logic
        setTimeout(() => retryOperation(), 1000);
      }
      break;
  }
} else {
  console.log(`Created user in ${meta?.duration}ms`);
}
```

### 2. React Error Handling Hook

```typescript
function useErrorHandler() {
  const [error, setError] = useState<TEnhancedError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback((error: TEnhancedError) => {
    setError(error);
    
    // Auto-retry for retryable errors
    if (error.retryable && !isRetrying) {
      setIsRetrying(true);
      setTimeout(() => {
        setError(null);
        setIsRetrying(false);
        // Trigger retry
      }, 2000);
    }
  }, [isRetrying]);

  const getErrorMessage = useCallback((error: TEnhancedError) => {
    return error.details?.userMessage || error.message;
  }, []);

  const getFieldErrors = useCallback((error: TEnhancedError) => {
    return error.details?.fields || {};
  }, []);

  return {
    error,
    isRetrying,
    handleError,
    getErrorMessage,
    getFieldErrors,
    clearError: () => setError(null)
  };
}
```

## Backwards Compatibility

### Gradual Migration Support

```typescript
// Support both old and new result types
export type TLegacyResult<T> = {
  data?: T;
  error?: Error;
};

export type TCompatibleResult<T> = TLegacyResult<T> & {
  // New enhanced properties are optional
  enhancedError?: TEnhancedError;
  meta?: {
    duration: number;
    affected?: number;
  };
};

// Provide legacy error extraction
function toLegacyError(enhancedError: TEnhancedError): Error {
  const error = new Error(enhancedError.message);
  // Add custom properties for backwards compatibility
  (error as any).code = enhancedError.code;
  (error as any).type = enhancedError.type;
  return error;
}
```

## Testing Strategy

### 1. Error Type Testing

```typescript
describe('Enhanced Error Handling', () => {
  test('should return validation error for invalid data', async () => {
    const create = createFn<TUser>();
    const { error } = await create('users')({
      email: 'invalid',
      name: 'X' // Too short
    });

    expect(error?.type).toBe('VALIDATION');
    expect(error?.details?.fields?.email).toContain('Please enter a valid email address');
    expect(error?.details?.fields?.name).toContain('Name must be at least 2 characters long');
    expect(error?.retryable).toBe(true);
  });

  test('should return duplicate error for unique constraint violation', async () => {
    // Create user first
    await create('users')({ email: 'test@example.com', name: 'John' });
    
    // Try to create duplicate
    const { error } = await create('users')({ email: 'test@example.com', name: 'Jane' });

    expect(error?.type).toBe('DUPLICATE');
    expect(error?.code).toBe('DUPLICATE_ENTRY');
    expect(error?.details?.userMessage).toContain('already taken');
  });

  test('should return not found error for missing records', async () => {
    const read = readFn<TUser>();
    const { error } = await read('users').byId('nonexistent-id');

    expect(error?.type).toBe('NOT_FOUND');
    expect(error?.retryable).toBe(false);
  });
});
```

### 2. Performance Impact Testing

```typescript
describe('Error Handling Performance', () => {
  test('should not significantly impact successful operations', async () => {
    const create = createFn<TUser>();
    
    const start = Date.now();
    await create('users')({ email: 'test@example.com', name: 'John' });
    const withErrorHandling = Date.now() - start;

    // Should add minimal overhead
    expect(withErrorHandling).toBeLessThan(100); // 100ms threshold
  });
});
```

## Success Metrics

1. **Error Clarity**: 90% reduction in "unknown error" reports
2. **Developer Productivity**: Faster debugging and error resolution
3. **User Experience**: Meaningful error messages instead of technical ones
4. **Retry Success**: Automatic retry for appropriate error types
5. **Performance**: <10ms overhead for error handling infrastructure

## Future Enhancements

1. **Error Reporting Integration**: Built-in Sentry/Bugsnag integration
2. **Custom Validation Rules**: User-defined validation with custom error messages
3. **Internationalization**: Multi-language error messages
4. **Error Analytics**: Aggregated error reporting and insights
5. **Circuit Breaker**: Automatic fallback for repeatedly failing operations