# Troubleshooting Guide

Common issues and solutions for drizzleasy.

## Installation Issues

### Peer Dependency Warnings

```
WARN: missing peer drizzle-orm@^0.44.0
```

**Cause:** Required peer dependency `drizzle-orm` is not installed.

**Solution:**
```bash
bun add drizzle-orm
```

---

### Version Conflicts

```
ERROR: drizzle-orm@0.29.0 doesn't satisfy ^0.44.0
```

**Cause:** Installed `drizzle-orm` version is too old.

**Solution:**
```bash
# Update to latest version
bun add drizzle-orm@latest

# Or specify version
bun add drizzle-orm@^0.44.0
```

---

### Missing Database Driver

```
Cannot find module '@neondatabase/serverless'
Cannot find module '@libsql/client'
Cannot find module 'better-sqlite3'
```

**Cause:** Database driver not installed for your database type.

**Solution:** Install the correct driver for your database:

```bash
# For Neon PostgreSQL
bun add @neondatabase/serverless

# For Turso
bun add @libsql/client

# For SQLite
bun add better-sqlite3

# For local PostgreSQL
bun add pg
```

See the [Database Drivers Guide](./DATABASES.md) for complete setup instructions.

---

## Schema Loading Issues

### "drizzle.config.ts not found in project root or parent directories"

**Error Message:**
```
drizzle.config.ts not found in project root or parent directories.

Please ensure you have a drizzle.config.ts file with a schema field:
  export default { schema: "./src/db/schema.ts" }

Searched directories:
  - /home/user/project/drizzle.config.ts
  - /home/user/drizzle.config.ts
  ...
```

**Cause:** No `drizzle.config.ts` file found in your project or parent directories.

**Solution:**

Create `drizzle.config.ts` in your project root:

```typescript path=drizzle.config.ts start=1
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!
    }
})
```

**For SQLite:**
```typescript path=drizzle.config.ts start=1
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'sqlite',
    dbCredentials: {
        url: 'file:./dev.db'
    }
})
```

---

### "No schema found in drizzle.config.ts"

**Cause:** Your `drizzle.config.ts` is missing the `schema` field.

**Solution:**

Add the `schema` field pointing to your schema file:

```typescript path=drizzle.config.ts start=1
export default defineConfig({
    schema: './src/db/schema.ts', // Add this line
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!
    }
})
```

---

### "Empty schema: No tables found in schema files"

**Error Message:**
```
Empty schema: No tables found in schema files.

Make sure your schema files export table definitions using named exports.
```

**Cause:** Your schema file doesn't export any tables, or uses default export.

**Solution:**

Use **named exports** for your tables:

```typescript path=src/db/schema.ts start=1
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

// ✅ Correct - named export
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow()
})

export const posts = pgTable('posts', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content'),
    authorId: serial('author_id').references(() => users.id)
})
```

**Incorrect examples:**

```typescript path=null start=null
// ❌ Wrong - default export
export default { users, posts }

// ❌ Wrong - not exporting
const users = pgTable('users', { ... })
```

---

### "Invalid schema: Found exports but none are Drizzle tables"

**Error Message:**
```
Invalid schema: Found exports (someFunction, someObject) but none are Drizzle tables.

Make sure you are using Drizzle ORM table definitions:
  import { pgTable, serial, text } from "drizzle-orm/pg-core"
  export const users = pgTable("users", { ... })
```

**Cause:** Schema file exports things that aren't Drizzle table definitions.

**Solution:**

Ensure you're using Drizzle's table creation functions:

```typescript path=src/db/schema.ts start=1
// ✅ Correct - using pgTable
import { pgTable, serial, text } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name')
})
```

```typescript path=null start=null
// ❌ Wrong - plain object
export const users = {
    id: 'number',
    name: 'string'
}
```

---

### "Failed to import schema file"

**Error Message:**
```
❌ Failed to import schema file: /path/to/schema.ts
   Reason: SyntaxError: Unexpected token

   Troubleshooting:
   - Check that the file exists and has no syntax errors
   - Ensure all imports in the schema file are valid
   - Try running: bun run build
```

**Cause:** Schema file has syntax errors or missing imports.

**Solution:**

1. Check for syntax errors in your schema file
2. Verify all imports are correct
3. Make sure `drizzle-orm` is installed

```bash
# Verify drizzle-orm is installed
bun add drizzle-orm

# Try building to see TypeScript errors
cd apps/drizzleasy
bun run build
```

---

## Runtime Issues

### "Table 'users' does not exist"

**Cause:** Database tables haven't been created yet.

**Solution:**

Push your schema to the database:

```bash
# Generate and push migrations
bunx drizzle-kit push

# Or generate SQL migration files
bunx drizzle-kit generate
bunx drizzle-kit migrate
```

---

### Import Path Errors in Next.js

**Error:**
```
Module not found: Can't resolve '@remcostoeten/drizzleasy' in client component
```

**Cause:** Importing server-side code in client components.

**Solution:**

Use the correct import paths:

```typescript path=app/actions.ts start=1
// ✅ Server Action - use /server
'use server'
import { crud } from '@remcostoeten/drizzleasy/server'

export async function createUser(data) {
    return crud.create('users')(data)
}
```

```typescript path=app/components/user-form.tsx start=1
// ✅ Client Component - use /client
'use client'
import { useOptimisticCrud } from '@remcostoeten/drizzleasy/client'
import { createUser } from '../actions'

export function UserForm() {
    const { data, optimisticCreate } = useOptimisticCrud([])
    
    function handleSubmit(formData) {
        optimisticCreate(
            { name: formData.get('name') },
            () => createUser(formData)
        )
    }
    
    return <form onSubmit={handleSubmit}>...</form>
}
```

---

### "Turso requires authToken option"

**Cause:** Connecting to Turso without authentication token.

**Solution:**

Provide the auth token in connection options:

```typescript path=src/db/index.ts start=1
import { initializeConnection } from '@remcostoeten/drizzleasy/server'

export const db = await initializeConnection(
    process.env.DATABASE_URL!,
    { authToken: process.env.TURSO_AUTH_TOKEN }
)
```

Make sure your `.env` has the token:

```env
DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

---

## Next.js Specific Issues

### Dynamic Import Failures in Next.js 15

**Error:**
```
❌ Failed to import schema file in Next.js environment: /path/to/schema.ts
   Reason: Cannot find module

   Troubleshooting:
   - Check that the file exists and has no syntax errors
   - Ensure all imports in the schema file are valid
   - Try using manual schema override: initializeConnection(url, { schema })
   - Try running: bun run build
```

**Cause:** Next.js 15 with Turbopack has complex module resolution.

**Solution 1:** Use manual schema override

```typescript path=src/db/index.ts start=1
import { initializeConnection } from '@remcostoeten/drizzleasy/server'
import * as schema from './schema'

export const db = await initializeConnection(
    process.env.DATABASE_URL!,
    { schema }
)
```

**Solution 2:** Simplify schema file structure

Avoid complex imports and keep schema files simple:

```typescript path=src/db/schema.ts start=1
// ✅ Simple, direct imports
import { pgTable, serial, text } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name')
})
```

---

### Build Errors with Server Actions

**Error:**
```
Error: Cannot use client-only code in server actions
```

**Cause:** Mixing client and server imports.

**Solution:**

Keep imports separate and use correct paths:

```typescript path=app/actions.ts start=1
// ✅ Server Action - ONLY server imports
'use server'
import { createFn } from '@remcostoeten/drizzleasy/server'
```

```typescript path=app/components/form.tsx start=1
// ✅ Client Component - ONLY client imports  
'use client'
import { useOptimisticCrud } from '@remcostoeten/drizzleasy/client'
import { createUser } from '../actions' // Server action
```

**Never do this:**

```typescript path=null start=null
// ❌ Wrong - mixing imports
'use server'
import { crud } from '@remcostoeten/drizzleasy' // Wrong path
import { useOptimisticCrud } from '@remcostoeten/drizzleasy/client' // Client code in server
```

---

### Turbopack Module Resolution Issues

**Cause:** Turbopack in Next.js 15 has stricter module resolution.

**Solution:**

Use manual schema override to bypass auto-loading:

```typescript path=src/db/index.ts start=1
import { initializeConnection } from '@remcostoeten/drizzleasy/server'
import * as schema from './schema'

export const db = await initializeConnection(
    process.env.DATABASE_URL!,
    { schema }
)
```

This completely bypasses the config file loading system.

---

## Environment Issues

### Missing Environment Variables

**Error:**
```
Error: DATABASE_URL is not defined
```

**Solution:**

1. Create `.env` file in project root
2. Add your database URL
3. Restart your development server

```env
DATABASE_URL=postgresql://user:pass@host/db
TURSO_AUTH_TOKEN=your_token_here
```

For Next.js, also create `.env.local`:

```env
DATABASE_URL=postgresql://user:pass@host/db
```

---

### Development vs Production Database

**Issue:** Accidentally using production database in development.

**Solution:**

Use environment-based configuration:

```typescript path=src/db/index.ts start=1
import { initializeConnection } from '@remcostoeten/drizzleasy/server'

export const db = await initializeConnection({
    development: 'file:./dev.db',
    production: process.env.DATABASE_URL!,
    test: 'file:./test.db'
})
```

Or use different env files:
- `.env.development` - Local SQLite
- `.env.production` - Production database URL

---

## Getting Help

If you're still stuck after trying these solutions:

1. **Check existing issues:** [GitHub Issues](https://github.com/remcostoeten/drizzleasy/issues)
2. **Search discussions:** [GitHub Discussions](https://github.com/remcostoeten/drizzleasy/discussions)
3. **Open a new issue** with:
   - Your database type
   - Drizzleasy version (`bun list @remcostoeten/drizzleasy`)
   - Drizzle ORM version (`bun list drizzle-orm`)
   - Full error message
   - Minimal reproduction code

---

## Related Documentation

- [Database Drivers Guide](./DATABASES.md) - Driver installation for each database
- [Quick Start Guide](./QUICK-START.md) - Complete setup walkthrough
- [Main README](./README.md) - Package overview