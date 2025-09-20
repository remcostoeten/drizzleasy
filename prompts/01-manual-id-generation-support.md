# Manual ID Generation Support (Replaced by Unified Create)

See usage examples: [usage-examples.md](./usage-examples.md)

## Priority: 🔴 HIGH

This prompt has been superseded by the unified create strategy in [00-unified-create-and-id-strategy.md](./00-unified-create-and-id-strategy.md).

## Summary

Zero-Generics Type Inference: Users don’t write `<TUser>` — passing the table object provides perfect types via Drizzle’s `$inferInsert/$inferSelect`.

- We will NOT introduce a separate `createWithIdFn`.
- Instead, we unify “create” so it supports both manual and automatic IDs with a single, intuitive API.
- Users can opt-in to a table-first, generic-free API for zero-boilerplate type inference.

## Problem (original)

`createFn<T>()` excludes `id`, which blocks manual ID use-cases (nanoid/uuid/custom). This previously led to proposing a separate `createWithIdFn`.

## Final Direction (accepted)

1) Table-first, generic-free create

```ts
const { data, error } = await crud.create(schema.categories)({
  name: 'Work',
  color: '#ff0000',
  userId: 'user123'
});
```

2) Single create with idStrategy

- If `id` is provided → use it
- If `id` is missing and PK is numeric → DB autoincrement
- If `id` is missing and PK is text → auto-generate using configured strategy (`nanoid`, `uuid`, `cuid2`, `ulid`, or custom)

Configuration:

```ts
configure(db, schema, {
  id: {
    default: 'nanoid',
    tables: { categories: 'nanoid' },
    detect: true
  }
});
```

3) API simplification

- Factory functions removed; use table-first CRUD only
- String-based table names removed; always pass the table object for type inference

## Migration Guide

- Replace any mention of `createWithIdFn` with the table-first unified create.
- Docs/examples should show id optional and strategy-based generation.

## Acceptance Criteria

- One create flow documented everywhere
- No separate createWithId function exposed or documented
- Omitting `id` on text PK generates an id; numeric PK relies on DB
- Type inference works without generics in table-first usage
