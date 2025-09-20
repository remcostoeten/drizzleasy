# Drizzleasy v1.0 🚀

**Zero-generics, table-first CRUD for Drizzle ORM.** Pass your table, get perfect types. No `<T>` in sight.

## ✨ What's New in v1.0

### 🎯 Table-First API with Zero Generics
```typescript
// Before v1.0 - factory functions with generics
const create = createFn<TUser>()
await create('users')({ name: 'John' })

// NEW in v1.0 - table-first, no generics!
await crud.create(schema.users)({ name: 'John' })
// Types are perfectly inferred from your table ✨
```

### 🆔 Automatic ID Generation
```typescript
configure(db, schema, {
  id: {
    default: 'nanoid',     // or 'uuid', 'cuid2', 'ulid'
    tables: {
      users: 'uuid',        // per-table overrides
      posts: 'nanoid'
    }
  }
})

// ID generated automatically based on strategy
await crud.create(schema.users)({ 
  name: 'John'  // no need to pass id!
})

// Or provide your own
await crud.create(schema.users)({ 
  id: customId(),
  name: 'John'
})
```

### 🔄 Batch Operations
```typescript
// Batch create with automatic IDs
const { data, errors, meta } = await batch.create(schema.users)([
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' },
  { name: 'Bob', email: 'bob@example.com' }
])

console.log(`Created ${meta.successful} users in ${meta.duration}ms`)

// Batch update
await batch.update(schema.users)([
  { id: 'user1', data: { status: 'active' } },
  { id: 'user2', data: { status: 'inactive' } }
])

// Batch delete
await batch.destroy(schema.users)(['user1', 'user2', 'user3'])
```

### 📄 Built-in Pagination
```typescript
// Offset-based pagination
const { data, pagination } = await crud.read(schema.users)
  .where({ status: 'active' })
  .orderBy('createdAt', 'desc')
  .paginate({ 
    page: 2, 
    pageSize: 20,
    includeTotalCount: true 
  })

console.log(pagination)
// {
//   currentPage: 2,
//   pageSize: 20,
//   totalCount: 156,
//   totalPages: 8,
//   hasNextPage: true,
//   hasPreviousPage: true
// }

// Cursor-based pagination (for infinite scroll)
const { data, cursor } = await crud.read(schema.posts)
  .cursorPaginate({ 
    limit: 10,
    cursor: lastPostId 
  })

// Load more: cursor.nextCursor
```

### 🚨 Enhanced Error Handling
```typescript
import { enhancedExecute, DrizzleasyError } from '@remcostoeten/drizzleasy/server'

// Categorized errors with metadata
const { data, error, meta } = await enhancedExecute(
  async () => db.insert(schema.users).values(userData),
  { operation: 'create', table: 'users', timeout: 5000 }
)

if (error) {
  switch (error.type) {
    case 'VALIDATION':
      console.log('Invalid fields:', error.details.fields)
      break
    case 'DUPLICATE':
      console.log('Already exists:', error.details.userMessage)
      break
    case 'PERMISSION':
      console.log('Access denied')
      break
  }
  
  // Automatic retry for retryable errors
  if (DrizzleasyError.isRetryable(error)) {
    // retry logic
  }
}

// With automatic retry
const result = await executeWithRetry(
  async () => crud.create(schema.users)(data),
  { maxRetries: 3, backoff: true }
)
```

### 📦 Split Entrypoints (No More Build Warnings!)
```typescript
// Client-safe imports (no fs/path/glob)
import { useOptimisticCrud } from '@remcostoeten/drizzleasy'

// Server imports
import { crud, batch, configure } from '@remcostoeten/drizzleasy/server'

// Legacy compatibility
import { createFn, readFn } from '@remcostoeten/drizzleasy/legacy'
```

## 🚀 Quick Start

### Installation
```bash
npm install @remcostoeten/drizzleasy drizzle-orm
```

### Basic Setup
```typescript
import { configure, crud } from '@remcostoeten/drizzleasy/server'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Initialize
const db = drizzle(process.env.DATABASE_URL)
configure(db, schema, {
  id: { default: 'nanoid' }
})

// Use it!
const { data } = await crud.create(schema.users)({
  name: 'John Doe',
  email: 'john@example.com'
})
```

## 📚 Complete API Reference

### CRUD Operations
```typescript
// Create
await crud.create(table)(data)

// Read
await crud.read(table)()                    // all records
await crud.read(table).byId(id)            // single record
await crud.read(table)
  .where({ status: 'active' })             // filtering
  .where({ age: '>18' })                   // operators
  .orderBy('name', 'asc')                  // sorting
  .limit(10)                               // limiting
  .offset(20)                              // offset
  .paginate({ page: 1, pageSize: 10 })    // pagination
  ()

// Update  
await crud.update(table)(id, data)

// Delete
await crud.destroy(table)(id)
```

### Batch Operations
```typescript
// All batch operations support transactions
const options = {
  transaction: true,
  failureMode: 'continue', // or 'abort', 'rollback'
  chunkSize: 100,
  stopOnError: false
}

await batch.create(table, options)(items)
await batch.update(table, options)(updates)
await batch.destroy(table, options)(ids)
```

### WHERE Clause Operators
```typescript
// Comparison operators
{ age: '>18' }        // greater than
{ age: '>=21' }       // greater than or equal  
{ price: '<100' }     // less than
{ rating: '<=5' }     // less than or equal
{ status: '!draft' }  // not equal

// Pattern matching
{ name: '*john*' }    // contains
{ email: '*@gmail.com' }  // ends with
{ code: 'PRE*' }      // starts with

// Arrays (IN operator)
{ status: ['active', 'pending'] }

// Direct equality
{ id: 'user123' }
```

## 🔧 Configuration Options

```typescript
configure(db, schema, {
  // ID generation
  id: {
    default: 'nanoid',
    tables: {
      users: 'uuid',
      posts: 'nanoid',
      analytics: { 
        type: 'custom', 
        generate: (table) => `${table}_${Date.now()}` 
      }
    },
    detect: true  // auto-detect numeric vs text IDs
  }
})
```

## 🏗️ Migration Guide from v0.x

```typescript
// Old (v0.x) - Factory functions with generics
import { createFn, readFn } from '@remcostoeten/drizzleasy'

const create = createFn<TUser>()
await create('users')({ name: 'John' })

// New (v1.0) - Table-first, no generics
import { crud } from '@remcostoeten/drizzleasy/server'

await crud.create(schema.users)({ name: 'John' })
```

Key changes:
- No more factory functions (`createFn`, `readFn`, etc.)
- Pass table objects instead of table name strings
- Automatic type inference from tables
- ID generation built-in
- Split client/server imports

## 📦 TypeScript Support

Full TypeScript support with perfect type inference:

```typescript
// Types are inferred from your Drizzle schema
const result = await crud.create(schema.users)({ 
  name: 'John',
  email: 'john@example.com'
})

// result.data is typed as User[]
// All fields are properly typed with no generics needed!
```

## 🤝 Contributing

Contributions welcome! Please read our [contributing guide](CONTRIBUTING.md).

## 📄 License

MIT © [Remco Stoeten](https://github.com/remcostoeten)