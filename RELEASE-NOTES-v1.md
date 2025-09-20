# Drizzleasy v1.0.0 Release Notes 🎉

## 🚀 Major Breaking Release

This is a complete rewrite of Drizzleasy with a focus on **simplicity and developer experience**. The new table-first API eliminates generics at call sites while maintaining perfect TypeScript support.

## ⚡ Highlights

### Zero-Generics, Table-First API
- **Before:** `const create = createFn<TUser>(); await create('users')({...})`
- **After:** `await crud.create(schema.users)({...})` ✨
- Types are perfectly inferred from your Drizzle table objects

### Automatic ID Generation
- Built-in support for `nanoid`, `uuid`, `cuid2`, and `ulid`
- Configurable per-table strategies
- Automatic detection of numeric vs text primary keys

### Production-Ready Features
- **Batch operations** with transaction support
- **Enhanced error handling** with categorized errors
- **Built-in pagination** (offset and cursor-based)
- **Split entrypoints** - no more Next.js build warnings!

## 📝 Complete Changelog

### Added
- ✅ Table-first CRUD API with zero-generics type inference
- ✅ Automatic ID generation with configurable strategies
- ✅ Batch operations (`batch.create`, `batch.update`, `batch.destroy`)
- ✅ Enhanced error handling with typed categories
- ✅ Pagination support (offset and cursor-based)
- ✅ Split client/server/CLI entrypoints
- ✅ Retry mechanism with exponential backoff
- ✅ Operation metadata and performance tracking

### Changed (Breaking)
- 🔄 Primary API now requires table objects instead of strings
- 🔄 Factory functions deprecated in favor of table-first approach
- 🔄 Default export is now client-safe (server features at `/server`)
- 🔄 Configuration now accepts ID strategy options

### Removed
- ❌ Factory functions (`createFn`, `readFn`, etc.) - use `crud.*` instead
- ❌ String-based table names - pass table objects for type safety

## 🔧 Migration Guide

### Basic Migration

```typescript
// Old (v0.x)
import { createFn, readFn } from '@remcostoeten/drizzleasy'

const create = createFn<TUser>()
const read = readFn<TUser>()

await create('users')({ name: 'John' })
const users = await read('users')()

// New (v1.0)
import { crud } from '@remcostoeten/drizzleasy/server'
import { schema } from './schema'

await crud.create(schema.users)({ name: 'John' })
const users = await crud.read(schema.users)()
```

### Configuration

```typescript
import { configure } from '@remcostoeten/drizzleasy/server'

configure(db, schema, {
  id: {
    default: 'nanoid',
    tables: {
      users: 'uuid',
      posts: 'nanoid'
    }
  }
})
```

### Import Paths

```typescript
// Client-side (React hooks, types)
import { useOptimisticCrud } from '@remcostoeten/drizzleasy'

// Server-side (CRUD, batch, config)
import { crud, batch, configure } from '@remcostoeten/drizzleasy/server'

// Legacy compatibility
import { createFn, readFn } from '@remcostoeten/drizzleasy/legacy'
```

## 🎯 Key Improvements

### Developer Experience
- No more generics at call sites
- Perfect TypeScript inference from table objects
- Cleaner, more intuitive API
- Better error messages with categorization

### Performance
- Batch operations reduce database round trips
- Transaction support for data consistency
- Automatic retry for transient failures
- Split builds for optimal bundle size

### Production Ready
- Enhanced error handling with user-friendly messages
- Built-in pagination for large datasets
- Comprehensive metadata for monitoring
- No build warnings in Next.js applications

## 📚 Documentation

Complete documentation and examples available at:
- GitHub: https://github.com/remcostoeten/drizzleasy
- Docs: https://drizzleasy.vercel.app

## 🙏 Acknowledgments

Thanks to all the users who provided feedback that shaped this release!

## 📄 License

MIT © Remco Stoeten