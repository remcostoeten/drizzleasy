# Unified Create + ID Strategy (Zero-Generics UX)

See usage examples: [usage-examples.md](./usage-examples.md)

## Priority: 🔴 HIGH

## Problem

The current factory `createFn<T>()` excludes `id`, forcing either:
- A second function (`createWithIdFn`) for manual IDs, or
- Dropping to the untyped `crud.create('table')({...})` path.

This conflicts with the package’s USP: the simplest possible CRUD with minimal boilerplate and no confusing generics.

## Goal

- One intuitive “create” that works for both manual and automatic IDs
- Zero generics for end users by inferring types from the table object
- No complicated where-clauses or extra API surface to learn

## Proposal

### Zero-Generics Type Inference (applies to create/read/update/destroy)

- Users pass the Drizzle table object (e.g., `schema.users`) — no `<TUser>` is needed at call sites.
- Input type is inferred from `typeof table.$inferInsert`.
- Return type is inferred from `typeof table.$inferSelect` (arrays for list operations).
- This yields perfect type-safety without angle-bracket generics in user code. Internally, the library can still use generics.

1) Table-first, generic-free API (primary path)

```ts
// Users pass the table object; types are inferred — no generics
const { data, error } = await crud.create(schema.categories)({
  name: 'Work',
  color: '#ff0000',
  userId: 'user123'
});
```

- Accept the real table object (schema.categories). TypeScript infers `$inferInsert`/`$inferSelect` under the hood.

2) Single create with idStrategy (no createWithIdFn)

- If `id` is present in input → use it.
- If `id` is missing:
  - If PK is numeric/serial → let the DB autogenerate.
  - If PK is text → generate using configured `idStrategy`.

Configuration surface:

```ts
export type TIdStrategy =
  | 'nanoid'
  | 'uuid'
  | 'cuid2'
  | 'ulid'
  | { type: 'custom'; generate: (tableName: string) => string };

type TDrizzleasyOptions = {
  id?: {
    default: TIdStrategy;                // fallback strategy
    tables?: Record<string, TIdStrategy>; // per-table overrides
    detect?: boolean;                     // try to detect PK type
  };
};

configure(db, schema, {
  id: {
    default: 'nanoid',
    tables: { categories: 'nanoid' },
    detect: true
  }
});
```

Create implementation surface (conceptual):

```ts
// id is optional for create; runtime fills it when appropriate
// Created/updated timestamps remain excluded or auto-filled by DB as today
export type TCreateInputUnified<T> =
  Omit<T, 'createdAt' | 'updatedAt'> & Partial<Pick<T, 'id'>>;
```

3) Optional codegen for fully boilerplate-free helpers

Emit typed helpers per table for teams who prefer function-per-table without passing a table reference:

```ts
// drizzleasy.gen.ts (generated)
export function createCategory(input: TCreateInputUnified<TCategory>) { /* ... */ }
export function readCategory() { /* ... */ }
```

## Examples

Manual id (works transparently):

```ts
const { data } = await crud.create(schema.categories)({ id: nanoid(), name: 'Work' });
```

Automatic id (no field provided):

```ts
// If PK is numeric → DB autoincrement
// If PK is text → strategy generates it
const { data } = await crud.create(schema.categories)({ name: 'Work' });
```


## Acceptance Criteria

- Only one create path exists and is documented (table-first CRUD).
- Passing a table object infers types — no generics required in end-user code.
- Omitting `id` on text PK generates an id using the configured strategy.
- Omitting `id` on numeric PK defers to DB autoincrement.
- Explicit `id` in input is respected.
- API surface remains minimal; no extra createWithId function; no factory functions; no string table names.

## Migration Notes

- Breaking change: remove factory functions (createFn/readFn/updateFn/destroyFn) from the public API.
- Single surface: table-first CRUD only — `crud.create(schema.table)(data)`.
- String-based table names are not supported; this enforces zero-generics inference and reduces ambiguity.
- Documentation and examples reflect the single table-first path only.

## Nice-to-haves (non-blocking)

- Provide built-in generators for `'nanoid' | 'uuid' | 'cuid2' | 'ulid'`.
- Add `createMany(table)([])` that inherits the same id strategy per record.
