# Database Drivers Guide

Drizzleasy supports multiple databases. Install only the driver you need for your specific database.

## Quick Reference

| Database | Driver Package | Install Command | Connection String Format |
|----------|----------------|-----------------|-------------------------|
| Neon PostgreSQL | `@neondatabase/serverless` | `bun add @neondatabase/serverless` | `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname` |
| Vercel Postgres | `@vercel/postgres` | `bun add @vercel/postgres` | `postgresql://user:pass@xxx.postgres.vercel-storage.com/dbname` |
| Supabase | `postgres` | `bun add postgres` | `postgresql://user:pass@db.xxx.supabase.co:5432/postgres` |
| Local PostgreSQL | `pg` | `bun add pg` | `postgresql://user:pass@localhost:5432/dbname` |
| Turso (libSQL) | `@libsql/client` | `bun add @libsql/client` | `libsql://your-database.turso.io` |
| SQLite (local) | `better-sqlite3` | `bun add better-sqlite3` | `file:./dev.db` |

## Detailed Setup

### Neon PostgreSQL

Neon is a serverless PostgreSQL database perfect for Next.js applications.

#### Installation

```bash
# Install dependencies
bun add @remcostoeten/drizzleasy
bun add drizzle-orm
bun add @neondatabase/serverless

# Install Drizzle Kit for migrations
bun add -d drizzle-kit
```

#### Environment Setup

Create a `.env` file:

```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb
```

#### Connection Example

```typescript path=src/db/index.ts start=1
import { initializeConnection } from '@remcostoeten/drizzleasy/server'

export const db = await initializeConnection(process.env.DATABASE_URL!)
```

#### Complete Working Example

```typescript path=src/app/actions.ts start=1
'use server'

import { createFn, readFn } from '@remcostoeten/drizzleasy/server'

type TUser = {
    id: number
    name: string
    email: string
}

const create = createFn<TUser>()
const read = readFn<TUser>()

export async function createUser(name: string, email: string) {
    const { data, error } = await create('users')({ name, email })
    
    if (error) {
        return { error: error.message }
    }
    
    return { user: data[0] }
}

export async function getUsers() {
    const { data, error } = await read('users')()
    return { users: data, error }
}
```

---

### Turso (libSQL)

Turso is an edge-hosted database built on libSQL (SQLite fork).

#### Installation

```bash
# Install dependencies
bun add @remcostoeten/drizzleasy
bun add drizzle-orm
bun add @libsql/client

# Install Drizzle Kit
bun add -d drizzle-kit
```

#### Environment Setup

Create a `.env` file:

```env
DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your_auth_token_here
```

#### Connection Example

```typescript path=src/db/index.ts start=1
import { initializeConnection } from '@remcostoeten/drizzleasy/server'

export const db = await initializeConnection(
    process.env.DATABASE_URL!,
    { authToken: process.env.TURSO_AUTH_TOKEN }
)
```

#### Turso CLI Setup

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create database
turso db create my-database

# Get connection URL
turso db show my-database --url

# Create auth token
turso db tokens create my-database
```

---

### SQLite (Local Development)

Perfect for local development and testing.

#### Installation

```bash
# Install dependencies
bun add @remcostoeten/drizzleasy
bun add drizzle-orm
bun add better-sqlite3

# Install Drizzle Kit
bun add -d drizzle-kit
```

#### Environment Setup

Create a `.env` file:

```env
DATABASE_URL=file:./dev.db
```

#### Connection Example

```typescript path=src/db/index.ts start=1
import { initializeConnection } from '@remcostoeten/drizzleasy/server'

export const db = await initializeConnection('file:./dev.db')
```

#### File Location

The database file will be created in your project root as `dev.db`. You can specify a different path:

```typescript path=null start=null
// Store in a specific directory
const db = await initializeConnection('file:./data/app.db')

// Use relative path
const db = await initializeConnection('file:../shared/db.sqlite')
```

---

### Local PostgreSQL (Docker)

For local development with PostgreSQL.

#### Installation

```bash
# Install dependencies
bun add @remcostoeten/drizzleasy
bun add drizzle-orm
bun add pg

# Install Drizzle Kit
bun add -d drizzle-kit
```

#### Docker Setup

```bash
# Run PostgreSQL in Docker
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=mydb \
  -p 5432:5432 \
  -d postgres:16-alpine
```

#### Environment Setup

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mydb
```

#### Connection Example

```typescript path=src/db/index.ts start=1
import { initializeConnection } from '@remcostoeten/drizzleasy/server'

export const db = await initializeConnection(process.env.DATABASE_URL!)
```

---

## Environment Switching

Switch between different databases for development and production:

```typescript path=src/db/index.ts start=1
import { initializeConnection } from '@remcostoeten/drizzleasy/server'

export const db = await initializeConnection({
    development: 'file:./dev.db',
    production: process.env.DATABASE_URL!,
    test: 'file:./test.db'
})
```

## Manual Schema Override

For complex setups or Next.js bundling issues, use manual schema override:

```typescript path=src/db/index.ts start=1
import { initializeConnection } from '@remcostoeten/drizzleasy/server'
import * as schema from './schema'

export const db = await initializeConnection(
    process.env.DATABASE_URL!,
    { schema }
)
```

This bypasses auto-loading and can solve Turbopack/Next.js 15 module resolution issues.

---

## Common Errors

### "Cannot find module '@neondatabase/serverless'"

**Cause:** Using Neon PostgreSQL but driver not installed.

**Solution:**
```bash
bun add @neondatabase/serverless
```

---

### "Cannot find module '@libsql/client'"

**Cause:** Using Turso but driver not installed.

**Solution:**
```bash
bun add @libsql/client
```

---

### "Module not found: Can't resolve 'better-sqlite3'"

**Cause:** Using SQLite but driver not installed.

**Solution:**
```bash
bun add better-sqlite3
```

---

### "Cannot find module 'pg'"

**Cause:** Using local PostgreSQL but driver not installed.

**Solution:**
```bash
bun add pg
```

---

### "Turso requires authToken option"

**Cause:** Connecting to Turso without providing authentication token.

**Solution:**
```typescript path=null start=null
const db = await initializeConnection(
    process.env.DATABASE_URL!,
    { authToken: process.env.TURSO_AUTH_TOKEN }
)
```

---

### "drizzle-orm version mismatch"

**Cause:** Installed `drizzle-orm` version is incompatible.

**Solution:**
```bash
# Update to latest version
bun add drizzle-orm@latest
```

Required version: `^0.44.0`

---

## Next Steps

- [Quick Start Guide](./QUICK-START.md) - Complete setup walkthrough
- [Troubleshooting](./TROUBLESHOOTING.md) - Solve common issues
- [Main README](./README.md) - Package overview