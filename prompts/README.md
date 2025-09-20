# DrizzleEasy Improvement Prompts

These prompts refine `@remcostoeten/drizzleasy` around its #1 USP: ultra-simple CRUD with minimal boilerplate and no confusing generics.

## Priority Overview

### 🔴 HIGH PRIORITY
1. [Unified Create + ID Strategy](./00-unified-create-and-id-strategy.md)
2. [Build Warnings Resolution (Next.js + Bundlers)](./02-build-warnings-resolution.md)

### 🟡 MEDIUM PRIORITY
3. [Batch Operations](./03-batch-operations.md)
4. [Enhanced Error Handling](./04-enhanced-error-handling.md)
5. [Pagination Support](./05-pagination-support.md)

### 🟢 LOW PRIORITY
6. [Aggregation Functions](./06-aggregation-functions.md)

## Updated Direction

- Single surface: table-first CRUD only — remove factory functions (`createFn/readFn/updateFn/destroyFn`) and string table names.
- Unify create API — one flow that supports manual/automatic IDs via `idStrategy`.
- Split client/server/cli entrypoints to eliminate Next.js build warnings and enable tree-shaking.

## Development Plan

- Phase 1: Implement unified create + idStrategy and split exports (client default, server subpath, CLI standalone).
- Phase 2: Add batch ops and enhanced error handling (typed, categorized).
- Phase 3: Pagination (offset and cursor) and aggregation helpers.

## Principles

Zero-Generics Type Inference (all operations):
- Users don’t write `<TUser>` at call sites; they pass the Drizzle table object and get perfect types via `$inferInsert/$inferSelect`.
- This applies to create/read/update/destroy, batch ops, pagination, and aggregations.

- ✅ Zero-generics, table-first UX only (single surface)
- ✅ Tree-shakeable client code
- ✅ Clear, typed results and errors
- ✅ Minimal API surface; no factory functions; no string table names

- ✅ Zero-generics, table-first UX only (single surface)
- ✅ Tree-shakeable client code
- ✅ Clear, typed results and errors
- ✅ Minimal API surface; no factory functions; no string table names

## Real-World Basis

These prompts are based on implementing end-to-end features (server actions, views, Next.js builds) and auditing v0.12.0 in a real project environment.
