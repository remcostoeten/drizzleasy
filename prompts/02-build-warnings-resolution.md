# Build Warnings Resolution (Next.js + Bundlers)

See usage examples: [usage-examples.md](./usage-examples.md)

## Priority: 🔴 HIGH

## Context (0.12.0 audit)

Current dist includes server/CLI utilities (fs, path, glob) and dynamic imports. In Next.js builds this yields:

```
./node_modules/@remcostoeten/drizzleasy/dist/index.js
Critical dependency: the request of a dependency is an expression
```

This is caused by config loaders and dynamic `import(...)` inside the main entry.

## Goal

Ship clean, tree-shakeable client/server entrypoints so apps don’t pull server/CLI code when they only need browser-safe utilities (e.g., client hooks) or minimal server runtime.

## Plan

1) Split entrypoints by runtime

- Client: no fs/path/glob; no dynamic imports; only browser-safe utilities and types.
- Server: includes DB providers, initializeConnection, config loader.
- CLI: standalone.

Package.json exports:

```json
{
  "name": "@remcostoeten/drizzleasy",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/client.d.ts",
      "import": "./dist/client.js",
      "require": "./dist/client.cjs"
    },
    "./server": {
      "types": "./dist/server.d.ts",
      "import": "./dist/server.js",
      "require": "./dist/server.cjs"
    },
    "./cli": "./dist/cli.js"
  },
  "sideEffects": false
}
```

- Move config-loader (fs/path/glob, dynamic import of drizzle config/schema) to server entry.
- Keep `initializeConnection` in server entry only.
- Keep React client helpers (useOptimisticCrud, withTransition) and types in client entry only.

2) Externalize heavy/driver deps in the bundler

tsup/rollup config:

```js
export default {
  external: [
    'drizzle-orm',
    /^drizzle-orm\/.*/,
    '@libsql/client',
    '@neondatabase/serverless',
    'better-sqlite3',
    'pg',
    'fs', 'path', 'glob'
  ]
}
```

3) Remove dynamic imports from main paths

- Server can keep dynamic imports when absolutely necessary, but never expose them through the client entry.
- Prefer static imports plus conditional logic guarded by separate entrypoints.

4) Type-only re-exports

- Re-export shared types from client/server with `export type` to keep them DCE-friendly.

5) Docs and migration

- Clients that need DB connections must import from `@remcostoeten/drizzleasy/server`.
- Browser code must import from the root `@remcostoeten/drizzleasy` entry only.

## Bonus: Buglet to verify while refactoring

- Ensure provider initialization argument order is correct for Turso (setup function vs call sites).

## Acceptance Criteria

- Next.js build shows no “Critical dependency: the request of a dependency is an expression” warnings when only client entry is used.
- Importing from the root entry never pulls `fs`, `path`, or `glob` into the client bundle.
- Tree-shaking leaves only used helpers in client bundles.
- Server apps function as before when importing from `./server`.

## Validation Matrix

- Next 14 & 15 (webpack + turbopack): zero warnings, working runtime.
- Vite + React: bundle succeeds, no node built-ins included.
- Rollup: tree-shakes unused drivers.

## Tracking Tasks

- [ ] Extract client entry (hooks + types)
- [ ] Extract server entry (providers + initializeConnection + config loader)
- [ ] Extract CLI entry (no exports exposure by default)
- [ ] Update exports map (client default, server subpath)
- [ ] Mark externals in build config
- [ ] Remove dynamic imports from client path
- [ ] Add example imports to README
- [ ] Verify Next 14/15 build locally
