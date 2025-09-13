# @remcostoeten/crud

Ultra-simple, type-safe CRUD operations for Next.js with Drizzle ORM.

## Features

- **One-liner setup** - `initializeConnection(url)` replaces complex Drizzle setup
- **Simple syntax** - Natural operators like `age: '>18'` and `name: '*john*'`
- **100% type-safe** - Full TypeScript support with IntelliSense
- **Auto-detection** - Reads your drizzle.config.ts automatically
- **Multi-database** - PostgreSQL, SQLite, Turso support
- **Optimistic updates** - Built-in React hooks for smooth UX

## Installation

```bash
npm install @remcostoeten/crud drizzle-orm
```

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
import { initializeConnection } from '@remcostoeten/crud'
export const db = initializeConnection(process.env.DATABASE_URL!)
```

### Simple CRUD Operations

```typescript
import { crud } from '@remcostoeten/crud'

type User = {
  id: string
  name: string
  email: string
  age: number
  status: 'active' | 'inactive'
}

// Read with natural WHERE syntax
const { data: activeUsers } = await crud.read<User>('users')
  .where({ status: 'active' })
  .where({ age: '>18' })
  .where({ name: '*john*' })
  .execute()

// Create
await crud.create<User>('users')({
  name: 'John',
  email: 'john@example.com',
  age: 25,
  status: 'active'
})
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
{ age: '>18' }           // Greater than
{ price: '<=100' }       // Less than or equal
{ status: '!inactive' }  // Not equal

// String patterns
{ name: '*john*' }       // Contains
{ name: 'john*' }        // Starts with
{ email: '*@gmail.com' } // Ends with

// Arrays (IN)
{ role: ['admin', 'user'] }

// Direct equality
{ status: 'active' }
```

## Documentation

Visit [our documentation](https://crud-builder-docs.vercel.app) for complete guides and examples.

## License

MIT