# Drizzleasy

[![npm downloads](https://img.shields.io/npm/dm/@remcostoeten/drizzleasy.svg)](https://www.npmjs.com/package/@remcostoeten/drizzleasy)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@remcostoeten/drizzleasy)](https://bundlephobia.com/package/@remcostoeten/drizzleasy)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<small><i>Because who doesn't love abstractions on top of abstractions</i></small>.<br/>
As the name implies, makes CRUD ridiculously easy 100% type-safe, with an easy-to-understand chainable syntax and full LSP support.

### Quick Example

```ts
type TUser = { id: string; email: string; isPremium: boolean }
const read = readFn<TUser>()
const create = createFn<TUser>()

// Create new user
const { data: newUser } = await create('users')({
    email: formData.get('email'),
    isPremium: formData.get('premium') === 'true'
})

// Query premium users
const { data: premiumUsers } = await read('users').where({ isPremium: true })()

return { newUser, premiumUsers }
```
<hr/>

- **[Full Documentation](https://drizzleasy.vercel.app)** - Complete guides and API reference
- **[Quickstart](https://drizzleasy.vercel.app/docs/03-quickstart)** - Get started in 5 minutes
- **[API Reference](https://drizzleasy.vercel.app/docs/20-api/01-core)** - Common questions and answers
- **[FAQ](https://drizzleasy.vercel.app/docs/60-faq)** - Detailed function documentation

![LSP Demo](premium-vscode-demo.gif)

## Installation

```bash
bun add @remcostoeten/drizzleasy drizzle-orm

# Add database driver (choose one)
bun add @neondatabase/serverless  # Neon PostgreSQL
bun add @libsql/client            # Turso
bun add better-sqlite3            # SQLite
bun add pg                         # Local PostgreSQL
```

**Not sure which driver?** See the [installation guide]([https://drizzleasy.vercel.app/docs/installation](https://drizzleasy.vercel.app/docs/02-installation))

## Quick Start

### Replace 7 lines with 1 line

**Before:**

```typescript
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema, logger: true })
```

**After:**

```typescript
import { initializeConnection } from '@remcostoeten/drizzleasy'
export const db = await initializeConnection(process.env.DATABASE_URL!)
```

### Database Support

```typescript
// PostgreSQL (Neon, Vercel, Supabase)
const db = await initializeConnection('postgresql://neon.tech/db')

// Local PostgreSQL (Docker)
const db = await initializeConnection('postgresql://localhost:5432/mydb')

// SQLite (Local file)
const db = await initializeConnection('file:./dev.db')

// Turso (with auth token)
const db = await initializeConnection('libsql://my-db.turso.io', {
    authToken: process.env.TURSO_AUTH_TOKEN
})

// Environment switching
const db = await initializeConnection({
    development: 'file:./dev.db',
    production: process.env.DATABASE_URL!
})

// Multiple databases
const dbs = await initializeConnection({
    main: process.env.DATABASE_URL!,
    analytics: process.env.ANALYTICS_URL!,
    cache: 'file:./cache.db'
})
```

### CRUD Operations

```typescript
import { readFn, createFn, updateFn, destroyFn } from '@remcostoeten/drizzleasy'

type User = {
    id: string
    name: string
    email: string
    age: number
    status: 'active' | 'inactive'
}

// Create factory functions
const read = readFn<User>()
const create = createFn<User>()
const update = updateFn<User>()
const destroy = destroyFn<User>()

// Read all records
const { data: users } = await read('users')()

// Read with natural WHERE syntax
const { data: activeUsers } = await read('users')
    .where({ status: 'active' })
    .where({ age: '>18' })
    .where({ name: '*john*' })()

// Create
const { data, error } = await create('users')({
    name: 'John',
    email: 'john@example.com',
    age: 25,
    status: 'active'
})

// Update
await update('users')('user-123', { status: 'inactive' })

// Delete
await destroy('users')('user-123')
```

## Database Connection

### Auto-Detection

```typescript
// PostgreSQL (Neon, Vercel, Docker)
const db = initializeConnection('postgresql://...')

// SQLite (Local file)
const db = initializeConnection('file:./dev.db')

// Turso (with auth token)
const db = initializeConnection('libsql://...', {
    authToken: process.env.TURSO_AUTH_TOKEN
})
```

### Environment Switching

```typescript
// Automatic environment detection
const db = initializeConnection({
    development: 'file:./dev.db',
    production: process.env.DATABASE_URL!
})

// Multiple databases
const dbs = initializeConnection({
    main: process.env.DATABASE_URL!,
    analytics: process.env.ANALYTICS_URL!,
    cache: 'file:./cache.db'
})
```

## WHERE Syntax

```typescript
// Comparison
{
    age: '>18'
} // Greater than
{
    price: '<=100'
} // Less than or equal
{
    status: '!inactive'
} // Not equal

// String patterns
{
    name: '*john*'
} // Contains
{
    name: 'john*'
} // Starts with
{
    email: '*@gmail.com'
} // Ends with

// Arrays (IN)
{
    role: ['admin', 'user']
}

// Direct equality
{
    status: 'active'
}
```

## Module Support

Works with both ESM and CommonJS:

```typescript
// ESM (recommended)
import {
    readFn,
    createFn,
    updateFn,
    destroyFn,
    initializeConnection
} from '@remcostoeten/drizzleasy'

// CommonJS
const {
    readFn,
    createFn,
    updateFn,
    destroyFn,
    initializeConnection
} = require('@remcostoeten/drizzleasy')
```

## Error Handling

All operations return a consistent result format:

```typescript
const create = createFn<User>()
const { data, error } = await create('users')({ name: 'John' })

if (error) {
    console.error('Operation failed:', error.message)
    return
}

console.log('Success:', data)
```

MIT ©

xxx
[Remco Stoeten](https://github.com/remcostoeten)

