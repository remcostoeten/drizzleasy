# Aggregation Functions Support

See usage examples: [usage-examples.md](./usage-examples.md)

Status: Updated for drizzleasy 0.12.0 — keep scope; ensure aggregations compose with the existing where DSL and future orderBy/limit/offset.

## Priority: 🟢 LOW

## Problem Description

Currently, drizzleasy provides no built-in support for database aggregation functions, forcing users to either:

1. **Load All Data**: Fetch entire datasets and calculate aggregations in JavaScript (inefficient)
2. **Write Raw Queries**: Drop down to raw Drizzle ORM for simple aggregations (verbose)
3. **Multiple Round Trips**: Make separate queries for each aggregation needed

### Current Inefficient Patterns

```typescript
// ❌ Inefficient - Load all data to count
const { data: users } = await read('users').where({ active: true })();
const activeUserCount = users?.length || 0;

// ❌ Inefficient - Multiple queries for dashboard stats
const { data: totalUsers } = await read('users')();
const { data: activeUsers } = await read('users').where({ active: true })();
const { data: premiumUsers } = await read('users').where({ plan: 'premium' })();

const stats = {
  total: totalUsers?.length || 0,
  active: activeUsers?.length || 0,
  premium: premiumUsers?.length || 0,
  averageAge: totalUsers?.reduce((sum, u) => sum + u.age, 0) / totalUsers.length
};

// ❌ Complex aggregations require raw Drizzle
import { count, sum, avg } from 'drizzle-orm';
const result = await db
  .select({
    totalRevenue: sum(orders.amount),
    averageOrderValue: avg(orders.amount),
    orderCount: count(orders.id)
  })
  .from(orders)
  .where(eq(orders.status, 'completed'));
```

### Performance Impact

- **Memory Exhaustion**: Loading large datasets for simple counts
- **Network Overhead**: Transferring unnecessary data for aggregations
- **CPU Waste**: Client-side calculations that should be done in database
- **Multiple Queries**: Dashboard widgets making dozens of separate requests

## High-Level Solution

Zero-Generics Type Inference (aggregations):
- Field parameters are inferred from the passed table’s keys; results are typed from the aggregation function and table field types.
- No `<T>` at call sites — the table object is the source of truth.

Implement comprehensive aggregation function support that provides:

1. **Common Aggregations**: `count()`, `sum()`, `avg()`, `min()`, `max()`
2. **Grouped Aggregations**: Group by fields with multiple aggregations
3. **Conditional Aggregations**: Count/sum with conditions
4. **Multiple Aggregations**: Single query with multiple aggregate functions
5. **Type Safety**: Full TypeScript support with proper return types

## Why This Solution Over Alternatives

### Alternative A: Expose Raw Drizzle Aggregation API
```typescript
// Direct exposure of Drizzle functions
import { count, sum } from '@remcostoeten/drizzleasy/drizzle';
const result = await db.select({ count: count() }).from(users);
```
**Rejected because:**
- Requires users to learn Drizzle ORM syntax
- Breaks the abstraction layer drizzleasy provides
- No type safety for table fields
- Inconsistent with existing API patterns

### Alternative B: Separate Aggregation Namespace
```typescript
import { aggregations } from '@remcostoeten/drizzleasy';
const count = await aggregations.count('users', { active: true });
```
**Rejected because:**
- Creates separate API surface to learn
- Doesn't integrate with existing query building
- Cannot combine with where clauses easily
- Inconsistent with factory function pattern

### Alternative C: Post-Query Processing Only
```typescript
const { data, aggregations } = await read('users')();
// aggregations.count, aggregations.sum, etc. calculated from data
```
**Rejected because:**
- Still requires loading all data (performance issue)
- Doesn't leverage database aggregation performance
- Memory usage scales with dataset size
- No benefit over manual JavaScript calculations

## Proposed Implementation

### 1. Aggregation Types

```typescript
export type TAggregationFunctions = {
  /** Count records matching conditions */
  count: () => Promise<number>;
  /** Count distinct values in a field */
  countDistinct: (field: keyof T) => Promise<number>;
  /** Sum values in a numeric field */
  sum: (field: keyof T) => Promise<number>;
  /** Average values in a numeric field */
  avg: (field: keyof T) => Promise<number>;
  /** Minimum value in a field */
  min: (field: keyof T) => Promise<T[keyof T]>;
  /** Maximum value in a field */
  max: (field: keyof T) => Promise<T[keyof T]>;
};

export type TMultipleAggregations<T extends TEntity> = {
  [K: string]: {
    function: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'countDistinct';
    field?: keyof T;
  };
};

export type TAggregationResult<T extends TMultipleAggregations<any>> = {
  [K in keyof T]: number | string | Date;
};

export type TGroupedAggregation<T extends TEntity> = {
  groupBy: keyof T | Array<keyof T>;
  aggregations: TMultipleAggregations<T>;
};

export type TGroupedResult<T extends TEntity, A extends TMultipleAggregations<T>> = Array<{
  [K in keyof TGroupedAggregation<T>['groupBy']]: T[K];
} & TAggregationResult<A>>;
```

### 2. Enhanced Query Builder with Aggregations

```typescript
// Extend existing read function with aggregation methods
type TQueryBuilderWithAggregations<T> = TQueryBuilder<T> & {
  // Single aggregation functions
  count(): Promise<number>;
  countDistinct(field: keyof T): Promise<number>;
  sum(field: keyof T): Promise<number>;
  avg(field: keyof T): Promise<number>;
  min(field: keyof T): Promise<T[keyof T]>;
  max(field: keyof T): Promise<T[keyof T]>;
  
  // Multiple aggregations in single query
  aggregate<A extends TMultipleAggregations<T>>(
    aggregations: A
  ): Promise<TAggregationResult<A>>;
  
  // Grouped aggregations
  groupBy<A extends TMultipleAggregations<T>>(
    fields: keyof T | Array<keyof T>,
    aggregations: A
  ): Promise<TGroupedResult<T, A>>;
};
```

### 3. Aggregation Function Implementations

```typescript
// Single aggregation implementations
async function executeCount<T extends TEntity>(
  tableName: string,
  whereConditions: any[] = []
): Promise<number> {
  const table = getTable(tableName);
  let query = dbInstance.select({ count: count() }).from(table);
  
  whereConditions.forEach(condition => {
    query = query.where(condition);
  });
  
  const [{ count: result }] = await query;
  return result;
}

async function executeSum<T extends TEntity>(
  tableName: string,
  field: keyof T,
  whereConditions: any[] = []
): Promise<number> {
  const table = getTable(tableName);
  let query = dbInstance.select({ sum: sum(table[field as string]) }).from(table);
  
  whereConditions.forEach(condition => {
    query = query.where(condition);
  });
  
  const [{ sum: result }] = await query;
  return result || 0;
}

async function executeAverage<T extends TEntity>(
  tableName: string,
  field: keyof T,
  whereConditions: any[] = []
): Promise<number> {
  const table = getTable(tableName);
  let query = dbInstance.select({ avg: avg(table[field as string]) }).from(table);
  
  whereConditions.forEach(condition => {
    query = query.where(condition);
  });
  
  const [{ avg: result }] = await query;
  return result || 0;
}
```

### 4. Multiple Aggregations Implementation

```typescript
async function executeMultipleAggregations<T extends TEntity, A extends TMultipleAggregations<T>>(
  tableName: string,
  aggregations: A,
  whereConditions: any[] = []
): Promise<TAggregationResult<A>> {
  const table = getTable(tableName);
  const selectObject: Record<string, any> = {};
  
  // Build select object with multiple aggregations
  Object.entries(aggregations).forEach(([key, config]) => {
    switch (config.function) {
      case 'count':
        selectObject[key] = count();
        break;
      case 'countDistinct':
        selectObject[key] = countDistinct(table[config.field as string]);
        break;
      case 'sum':
        selectObject[key] = sum(table[config.field as string]);
        break;
      case 'avg':
        selectObject[key] = avg(table[config.field as string]);
        break;
      case 'min':
        selectObject[key] = min(table[config.field as string]);
        break;
      case 'max':
        selectObject[key] = max(table[config.field as string]);
        break;
    }
  });
  
  let query = dbInstance.select(selectObject).from(table);
  
  whereConditions.forEach(condition => {
    query = query.where(condition);
  });
  
  const [result] = await query;
  return result as TAggregationResult<A>;
}
```

### 5. Grouped Aggregations Implementation

```typescript
async function executeGroupedAggregations<T extends TEntity, A extends TMultipleAggregations<T>>(
  tableName: string,
  groupByFields: keyof T | Array<keyof T>,
  aggregations: A,
  whereConditions: any[] = []
): Promise<TGroupedResult<T, A>> {
  const table = getTable(tableName);
  const selectObject: Record<string, any> = {};
  
  // Add group by fields to select
  const groupFields = Array.isArray(groupByFields) ? groupByFields : [groupByFields];
  groupFields.forEach(field => {
    selectObject[field as string] = table[field as string];
  });
  
  // Add aggregation functions to select
  Object.entries(aggregations).forEach(([key, config]) => {
    switch (config.function) {
      case 'count':
        selectObject[key] = count();
        break;
      case 'sum':
        selectObject[key] = sum(table[config.field as string]);
        break;
      case 'avg':
        selectObject[key] = avg(table[config.field as string]);
        break;
      // ... other aggregation functions
    }
  });
  
  let query = dbInstance.select(selectObject).from(table);
  
  whereConditions.forEach(condition => {
    query = query.where(condition);
  });
  
  // Add GROUP BY clause
  groupFields.forEach(field => {
    query = query.groupBy(table[field as string]);
  });
  
  const results = await query;
  return results as TGroupedResult<T, A>;
}
```

### 6. Enhanced Query Builder Implementation

```typescript
export function readFn<T extends TEntity = TEntity>(): 
  (tableName: string) => TQueryBuilderWithAggregations<T> 
{
  return (tableName: string) => {
    let whereConditions: any[] = [];
    
    // ... existing query builder implementation ...
    
    const queryBuilder = Object.assign(baseQueryBuilder, {
      // ... existing methods ...
      
      // Single aggregation methods
      count: async (): Promise<number> => {
        return await executeCount<T>(tableName, whereConditions);
      },
      
      countDistinct: async (field: keyof T): Promise<number> => {
        return await executeCountDistinct<T>(tableName, field, whereConditions);
      },
      
      sum: async (field: keyof T): Promise<number> => {
        return await executeSum<T>(tableName, field, whereConditions);
      },
      
      avg: async (field: keyof T): Promise<number> => {
        return await executeAverage<T>(tableName, field, whereConditions);
      },
      
      min: async (field: keyof T): Promise<T[keyof T]> => {
        return await executeMin<T>(tableName, field, whereConditions);
      },
      
      max: async (field: keyof T): Promise<T[keyof T]> => {
        return await executeMax<T>(tableName, field, whereConditions);
      },
      
      // Multiple aggregations
      aggregate: async <A extends TMultipleAggregations<T>>(
        aggregations: A
      ): Promise<TAggregationResult<A>> => {
        return await executeMultipleAggregations<T, A>(tableName, aggregations, whereConditions);
      },
      
      // Grouped aggregations
      groupBy: async <A extends TMultipleAggregations<T>>(
        fields: keyof T | Array<keyof T>,
        aggregations: A
      ): Promise<TGroupedResult<T, A>> => {
        return await executeGroupedAggregations<T, A>(tableName, fields, aggregations, whereConditions);
      }
    });
    
    return queryBuilder;
  };
}
```

## Usage Examples

### 1. Simple Aggregations

```typescript
const read = readFn<TUser>();

// Count active users
const activeUserCount = await read('users')
  .where({ active: true })
  .count();

// Sum of all order amounts
const totalRevenue = await read('orders')
  .where({ status: 'completed' })
  .sum('amount');

// Average user age
const averageAge = await read('users')
  .where({ active: true })
  .avg('age');

// Most recent signup date
const latestSignup = await read('users').max('createdAt');
```

### 2. Multiple Aggregations in Single Query

```typescript
// Dashboard statistics in one query
const stats = await read('orders')
  .where({ status: 'completed' })
  .aggregate({
    totalRevenue: { function: 'sum', field: 'amount' },
    averageOrderValue: { function: 'avg', field: 'amount' },
    orderCount: { function: 'count' },
    largestOrder: { function: 'max', field: 'amount' },
    smallestOrder: { function: 'min', field: 'amount' }
  });

console.log(`
  Total Revenue: $${stats.totalRevenue}
  Average Order: $${stats.averageOrderValue}
  Order Count: ${stats.orderCount}
  Largest Order: $${stats.largestOrder}
`);
```

### 3. Grouped Aggregations

```typescript
// Sales by category
const categoryStats = await read('orders')
  .where({ status: 'completed' })
  .groupBy('category', {
    totalSales: { function: 'sum', field: 'amount' },
    orderCount: { function: 'count' },
    avgOrderValue: { function: 'avg', field: 'amount' }
  });

categoryStats.forEach(category => {
  console.log(`
    Category: ${category.category}
    Total Sales: $${category.totalSales}
    Orders: ${category.orderCount}
    Average: $${category.avgOrderValue}
  `);
});

// User signups by month and year
const signupTrends = await read('users')
  .groupBy(['year', 'month'], {
    signups: { function: 'count' },
    uniqueEmails: { function: 'countDistinct', field: 'email' }
  });
```

### 4. Dashboard Widget Helper

```typescript
// Helper function for dashboard widgets
async function getDashboardStats(userId: string) {
  const read = readFn<TPassword>();
  
  const passwordStats = await read('passwords')
    .where({ userId })
    .aggregate({
      total: { function: 'count' },
      favorites: { function: 'count' }, // Would need conditional aggregation
      avgAge: { function: 'avg', field: 'createdAt' }
    });
  
  const categoryBreakdown = await read('passwords')
    .where({ userId })
    .groupBy('categoryId', {
      count: { function: 'count' }
    });
    
  return {
    overview: passwordStats,
    byCategory: categoryBreakdown
  };
}
```

### 5. React Dashboard Hook

```typescript
function useDashboardStats<T extends TEntity>(
  queryFn: () => TQueryBuilderWithAggregations<T>,
  aggregations: TMultipleAggregations<T>
) {
  const [stats, setStats] = useState<TAggregationResult<typeof aggregations> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await queryFn().aggregate(aggregations);
      setStats(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [queryFn, aggregations]);
  
  useEffect(() => {
    loadStats();
  }, [loadStats]);
  
  return { stats, loading, error, refresh: loadStats };
}

// Usage in component
function DashboardWidget() {
  const read = readFn<TOrder>();
  const { stats, loading } = useDashboardStats(
    () => read('orders').where({ status: 'completed' }),
    {
      totalRevenue: { function: 'sum', field: 'amount' },
      orderCount: { function: 'count' },
      avgOrderValue: { function: 'avg', field: 'amount' }
    }
  );
  
  if (loading) return <div>Loading stats...</div>;
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard title="Total Revenue" value={`$${stats?.totalRevenue}`} />
      <StatCard title="Orders" value={stats?.orderCount} />
      <StatCard title="Average Order" value={`$${stats?.avgOrderValue}`} />
    </div>
  );
}
```

## Advanced Features

### 1. Conditional Aggregations

```typescript
// Count with conditions using CASE WHEN
const userStats = await read('users').aggregate({
  totalUsers: { function: 'count' },
  activeUsers: { 
    function: 'count', 
    condition: { active: true } // Conditional count
  },
  premiumUsers: { 
    function: 'count', 
    condition: { plan: 'premium' }
  },
  totalRevenue: { 
    function: 'sum', 
    field: 'subscriptionAmount',
    condition: { plan: ['premium', 'pro'] }
  }
});
```

### 2. Date-based Grouping

```typescript
// Built-in date grouping helpers
const monthlySignups = await read('users')
  .groupByDate('createdAt', 'month', {
    signups: { function: 'count' },
    avgAge: { function: 'avg', field: 'age' }
  });

const dailyRevenue = await read('orders')
  .where({ status: 'completed' })
  .groupByDate('createdAt', 'day', {
    revenue: { function: 'sum', field: 'amount' },
    orders: { function: 'count' }
  });
```

### 3. Percentile and Advanced Statistics

```typescript
// Advanced statistical functions
const orderAnalysis = await read('orders')
  .advancedAggregate({
    median: { function: 'percentile', field: 'amount', percentile: 50 },
    p95: { function: 'percentile', field: 'amount', percentile: 95 },
    standardDev: { function: 'stddev', field: 'amount' },
    variance: { function: 'variance', field: 'amount' }
  });
```

## Performance Considerations

### 1. Index Optimization

```typescript
// Suggest indexes for common aggregation patterns
const indexSuggestions = await analyzeAggregationQuery(
  'orders',
  ['status'],
  { revenue: { function: 'sum', field: 'amount' } }
);

// Suggests: CREATE INDEX idx_orders_status_amount ON orders(status, amount);
```

### 2. Caching Aggregations

```typescript
// Cache expensive aggregations
const cachedStats = await read('orders')
  .where({ createdAt: '>2023-01-01' })
  .aggregate({
    totalRevenue: { function: 'sum', field: 'amount' }
  }, {
    cache: true,
    cacheKey: 'orders_2023_revenue',
    cacheTTL: 3600 // 1 hour
  });
```

## Testing Strategy

### 1. Aggregation Accuracy Testing

```typescript
describe('Aggregation Functions', () => {
  test('should calculate count correctly', async () => {
    // Create test data
    const testOrders = [
      { amount: 100, status: 'completed' },
      { amount: 200, status: 'completed' },
      { amount: 150, status: 'pending' }
    ];
    
    await batchCreate('orders')(testOrders);
    
    const totalCount = await read('orders').count();
    const completedCount = await read('orders')
      .where({ status: 'completed' })
      .count();
    
    expect(totalCount).toBe(3);
    expect(completedCount).toBe(2);
  });
  
  test('should calculate sum and average correctly', async () => {
    const totalAmount = await read('orders')
      .where({ status: 'completed' })
      .sum('amount');
    const avgAmount = await read('orders')
      .where({ status: 'completed' })
      .avg('amount');
    
    expect(totalAmount).toBe(300);
    expect(avgAmount).toBe(150);
  });
});
```

### 2. Performance Testing

```typescript
describe('Aggregation Performance', () => {
  test('should outperform client-side calculations', async () => {
    // Create large dataset
    const largeOrderSet = Array.from({ length: 10000 }, (_, i) => ({
      amount: Math.random() * 1000,
      status: i % 2 === 0 ? 'completed' : 'pending'
    }));
    
    await batchCreate('orders')(largeOrderSet);
    
    // Measure server-side aggregation
    const serverStart = Date.now();
    const serverSum = await read('orders')
      .where({ status: 'completed' })
      .sum('amount');
    const serverTime = Date.now() - serverStart;
    
    // Measure client-side calculation
    const clientStart = Date.now();
    const { data: allOrders } = await read('orders')
      .where({ status: 'completed' })();
    const clientSum = allOrders?.reduce((sum, order) => sum + order.amount, 0) || 0;
    const clientTime = Date.now() - clientStart;
    
    expect(serverSum).toBeCloseTo(clientSum, 2);
    expect(serverTime).toBeLessThan(clientTime / 5); // At least 5x faster
  });
});
```

## Success Metrics

1. **Performance**: 90% reduction in data transfer for dashboard widgets
2. **Query Efficiency**: Single query for multiple aggregations vs multiple queries
3. **Developer Experience**: One-line aggregations vs complex manual calculations
4. **Type Safety**: Full TypeScript inference for aggregation results
5. **Memory Usage**: Constant memory usage regardless of dataset size

## Backwards Compatibility

- ✅ All existing query methods continue working unchanged
- ✅ Aggregation methods are additive to query builder
- ✅ No breaking changes to current API
- ✅ Optional adoption - use only when needed

## Future Enhancements

1. **Window Functions**: Support for ROW_NUMBER, RANK, LAG/LEAD
2. **Custom Aggregations**: User-defined aggregation functions
3. **Real-time Aggregations**: Live-updating dashboard stats
4. **Aggregation Pipelines**: MongoDB-style aggregation pipeline support
5. **Cross-table Aggregations**: Aggregations across joined tables