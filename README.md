# @remcostoeten/crud

Ultra-simple, type-safe CRUD operations for Next.js with Drizzle ORM.

## Features

- **Simple syntax** - Natural operators like `age: '>18'` and `name: '*john*'`
- **100% type-safe** - Full TypeScript support with IntelliSense
- **Zero configuration** - Just configure once and use everywhere
- **Optimistic updates** - Built-in React hooks for smooth UX
- **Multiple databases** - PostgreSQL, MySQL, SQLite support

## Installation

```bash
npm install @remcostoeten/crud drizzle-orm
```

## Quick Start

```typescript
import { configure, crud } from '@remcostoeten/crud'
import { db } from './db'
import * as schema from './schema'

// Configure once
configure(db, schema)

type User = {
  id: string
  name: string
  email: string
  age: number
  status: 'active' | 'inactive'
}

// Simple CRUD operations
const { data: users } = await crud.read<User>('users')()
const { data: activeUsers } = await crud.read<User>('users')
  .where({ status: 'active' })
  .where({ age: '>18' })
  .execute()

await crud.create<User>('users')({
  name: 'John',
  email: 'john@example.com',
  age: 25,
  status: 'active'
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