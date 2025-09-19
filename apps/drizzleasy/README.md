# drizzleasy

<small><i>Because who doesn't love abstractions on top of abstractions?</small>

Drizzleasy is a library to make CRUD operations and database management ridiculously easy. 100%
typesafe with full LSP support in your editor due to the chainable syntax.

Just see how easy creating, and rendering your data becomes

```ts
type Signup = { id: string; email: string; newsletter: 'yes' | 'no' }

async function createSignup(formData: FormData) {
  'use server' // mutations must be a server action
  await createFn<Signup>()('signups')({ //type with your expected data
    email: formData.get('email'),
    newsletter: formData.get('newsletter')
  })
  revalidatePath('/') // auto shows the posted result if queried
}

export default async function SignupApp() {
  const read = readFn<Signup>() // call the fnc defined with the object you expect
  const { data: premiumUsers } = await read('signups').where({ newsletter: 'newsletter' }) //await readFn, in the table
  return (
    <>
      <form action={createSignup}>
        <input name="email" placeholder="Email..." />
        <select name="newsletter">
          <option value="basic">Yes, sen me marketing mails</option>
          <option value="premium">No, do not mail me</option>
        </select>
        <button>Sign Up</button>
      </form>
      {premiumUsers?.map(user => <div key={user.id}>{user.email}</div>)}
    </>
  )
}
```

```ts
type TProps = { message: string }

async function createMsg(formData: FormData) {
  'use server' // must be server action
  await createFn<TProps>()('messages')({ // await create function and as string argument pass your drizzle schema
    message: formData.get('message'),
  })
  revalidatePath('/') // instantly show rendered results w/o refresh
}

export default async function MessageForm() {
  const { data: messages } = await readFn<TProps>()('messages')()
// await readFn function and assign your object which the data resembles and as  argument pass the schema name
  return (
    <>
      <form action={createMsg}>
        <textarea name="message" />
        <button>Send</button>
      </form>

  {messages?.map((msg, i) => (
        <div key={i}>{msg.message}</div>
      ))}
    </>
  )
}
```

[![npm version](https://badge.fury.io/js/drizzleasy.svg)](https://badge.fury.io/js/drizzleasy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **One-liner setup** - `initializeConnection(url)` replaces complex Drizzle setup
- **Auto-detection** - Reads your drizzle.config.ts automatically
- **Multi-database** - PostgreSQL (Neon, Vercel, Docker), SQLite, Turso
- **Simple syntax** - Natural operators like `age: '>18'` and `name: '*john*'`
- **100% type-safe** - Full TypeScript support with IntelliSense
- **Optimistic updates** - Built-in React hooks for smooth UX
- **Environment switching** - Development/production database configs
- **Connection caching** - Automatic connection reuse for performance
- **Dual module support** - Works with both ESM and CommonJS
- **Zero dependencies** - Only peer dependencies for database drivers

## Installation

```bash
npm install @remcostoeten/drizzleasy
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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Remco Stoeten](https://github.com/remcostoeten)
