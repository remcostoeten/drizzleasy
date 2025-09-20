# Drizzleasy Usage Examples (Unified Create + Split Exports)

This document shows concise, copy-ready examples aligned with the new prompts.

Zero-Generics Type Inference: You don’t write `<TUser>` — passing `schema.table` gives perfect types via Drizzle’s `$inferInsert/$inferSelect`.
- Unified Create + ID Strategy (00)
- Split client/server exports (02)

## Imports and Entry Points

```ts path=null start=null
// Client-safe helpers (no DB access) — planned root entry
import { useOptimisticCrud, withTransition } from '@remcostoeten/drizzleasy'

// Server-only APIs — planned server subpath
import { configure, crud } from '@remcostoeten/drizzleasy/server'
```

## Configuration with idStrategy (unified create)

```ts path=null start=null
import { configure } from '@remcostoeten/drizzleasy/server'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from '@/lib/database/schema'

function initDb() {
  const sqlite = new Database('local.db')
  const db = drizzle(sqlite, { schema })
  configure(db, schema, {
    id: {
      default: 'nanoid',
      tables: { passwords: 'nanoid', categories: 'nanoid' },
      detect: true
    }
  })
}
```

## Unified Create — Table-first (zero generics)

```ts path=null start=null
import { crud } from '@remcostoeten/drizzleasy/server'
import * as schema from '@/lib/database/schema'

async function createCategory() {
  const { data, error } = await crud.create(schema.categories)({
    name: 'Work',
    color: '#ff0000',
    userId: 'user_123'
  })
  return { data, error }
}
```

## Unified Create — Manual ID (works transparently)

```ts path=null start=null
import { crud } from '@remcostoeten/drizzleasy/server'
import * as schema from '@/lib/database/schema'
import { nanoid } from 'nanoid'

async function createCategoryWithId() {
  const { data, error } = await crud.create(schema.categories)({
    id: nanoid(),
    name: 'Personal',
    color: '#00ff00',
    userId: 'user_123'
  })
  return { data, error }
}
```


## Read Builder — Natural where DSL

```ts path=null start=null
import { crud } from '@remcostoeten/drizzleasy/server'
import * as schema from '@/lib/database/schema'

async function listGmailPasswords(userId: string) {
  const result = await crud.read(schema.passwords)
    .where({ userId })
    .where({ website: '*gmail*' })
    ()
  return result
}
```

## Read by ID

```ts path=null start=null
import { crud } from '@remcostoeten/drizzleasy/server'
import * as schema from '@/lib/database/schema'

async function getPassword(id: string) {
  const { data, error } = await crud.read(schema.passwords).byId(id)
  return { data, error }
}
```

## Client UI — Optimistic create with server action

```tsx path=null start=null
'use client'
import { useOptimisticCrud, withTransition } from '@remcostoeten/drizzleasy'
import { createPasswordAction } from '@/features/passwords/actions'

type TPassword = {
  id: string
  title: string
  password: string
}

function PasswordList({ initial }: { initial: TPassword[] }) {
  const { data, isPending, optimisticCreate } = useOptimisticCrud<TPassword>(initial)

  function addPassword() {
    const run = () => createPasswordAction(new FormData())
    optimisticCreate({ title: 'Gmail', password: 'secret' }, run)
  }

  return (
    <div>
      <button onClick={addPassword} disabled={isPending}>Add</button>
      <ul>
        {data.map(p => <li key={p.id}>{p.title}</li>)}
      </ul>
    </div>
  )
}
```

## Planned: Ordering and Pagination

```ts path=null start=null
// Planned API (see 05-pagination-support.md)
const result = await crud.read(schema.passwords)
  .where({ userId: 'user_123' })
  // .orderBy('createdAt', 'desc')
  // .limit(20)
  // .offset(40)
  ()
```

## Planned: Batch Create

```ts path=null start=null
// Planned API (see 03-batch-operations.md)
// const { data, errors } = await crud.createMany(schema.categories)([
//   { name: 'Work' },
//   { name: 'Personal' },
//   { name: 'Finance' }
// ])
```

## Notes

- Prefer table-first APIs for zero-generics inference.
- Unified create respects explicit `id` and auto-generates when omitted based on configured `idStrategy`.
- Import from `@remcostoeten/drizzleasy/server` for any DB access; use the root entry only for client-safe helpers.
