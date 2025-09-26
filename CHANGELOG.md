## [0.13.0] - 2025-01-26

### Added

- 🔥 **Separated client and server bundles** to fix Next.js bundling issues
- 📦 **New export paths**: 
  - `@remcostoeten/drizzleasy/client` for client-side hooks only
  - `@remcostoeten/drizzleasy/server` for server-side functionality only
  - `@remcostoeten/drizzleasy` (default) for client-side hooks and types

### Fixed

- 🐛 **Module resolution errors** in Next.js when importing client hooks
- 🔧 **Server-side dependencies** (fs, child_process, etc.) no longer bundled in client code
- 🚀 **Significantly reduced client bundle size** (1.3KB vs 60KB+)

### Migration Guide

**For client components using `useOptimisticCrud`:**
```tsx
// ✅ New way (recommended)
import { useOptimisticCrud } from '@remcostoeten/drizzleasy/client'

// ✅ Still works (default export includes client hooks)
import { useOptimisticCrud } from '@remcostoeten/drizzleasy'
```

**For server-side usage:**
```tsx
// ✅ New way (recommended)
import { crud, initializeConnection } from '@remcostoeten/drizzleasy/server'

// ❌ Old way (will include unnecessary client dependencies)
import { crud, initializeConnection } from '@remcostoeten/drizzleasy'
```

---

## [0.12.0] - 2025-01-20

### Added

- 🏭 **Production-ready utilities** for enhanced reliability and monitoring
- 🚨 **Advanced error handling** with `DrizzleasyError` classes and structured error reporting
- 📊 **Performance monitoring** with operation timing and success rate tracking
- 🔧 **Environment validation** with automatic database configuration detection
- 🔄 **Enhanced Turso provider** with connection optimization and retry logic
- 📈 **Connection pool monitoring** utilities for database performance insights

### Changed

- ⬆️ **Updated peer dependencies** to support latest versions:
  - `drizzle-orm`: `^0.44.0` (was `^0.29.0`)
  - `@libsql/client`: `^0.15.0` (was `^0.4.0`)
  - `react`: `^18.0.0 || ^19.0.0` (was `^18.0.0`)
  - `next`: `^14.0.0 || ^15.0.0` (was `^14.0.0`)
- 🔧 **Improved production configuration** with automatic environment-based optimizations
- 📝 **Enhanced TypeScript support** with better error types and configuration interfaces

### Fixed

- 🐛 **Peer dependency compatibility** issues resolved
- 🔒 **Production environment** validation and error handling
- ⚡ **Connection performance** optimizations for different deployment platforms

### Technical Improvements

- 🔍 **Deployment platform detection** (Vercel, Netlify, Railway, Heroku)
- 🛡️ **Type-safe error handling** with structured error responses
- 📊 **Metrics collection** for database operations and connection health
- 🔧 **Automatic configuration** based on environment and connection type

---

## [0.1.0] - 2025-09-18

### Added

- Engines and `sideEffects` fields to `package.json`
- Optional `peerDependencies` for drivers; kept `glob` as a runtime dependency

### Changed

- Migrated to Bun
- Migrated to a Turbo monorepo (for future examples and docs)
- Rewrote README without LLM
- Build now via `tsup` (ESM + CJS + DTS)

### Fixed

- Tightened SQLite URL detection with env-specific cache keys
- Vitest mocks (20/20 tests passing)

### Removed

- `execute()` fire function

---

## [0.9.0] - 2025-09-xx

### Added

- Comprehensive test suite
- Smart database driver connection supporting PostgreSQL (local + cloud), SQLite, and Turso libsql
- Database initialization for PostgreSQL
- `update()` and `destroy()` functions
- Initial `query()` and `mutate()` functions
