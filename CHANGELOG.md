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
