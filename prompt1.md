# AGENT 1: Schema Auto-Loading Improvements

## Project Context

You are working on **drizzleasy** at `/home/remco-stoeten/projects/PACKAGES/drizzleasy`. This is a TypeScript library that provides ultra-simple, type-safe CRUD operations for Next.js with Drizzle ORM.

**Key Project Structure:**
- Monorepo with `apps/drizzleasy` (main package) and `apps/docs` (documentation)
- Built with Bun, TypeScript 5.0+, and tsup for bundling
- Exports: `/server` (server-side), `/client` (React hooks), `/cli` (command-line tools)
- Peer dependencies: `drizzle-orm ^0.44.0`, optional database drivers

**Core Functionality:**
- Auto-detects database provider from URL (PostgreSQL, Turso, SQLite)
- Automatically loads schema from `drizzle.config.ts`
- Provides factory functions: `createFn()`, `readFn()`, `updateFn()`, `destroyFn()`
- Connection caching and multi-database support

## Coding Guidelines (CRITICAL)

Follow these rules strictly:

### TypeScript & Function Style
- Use `function` declarations only, never arrow function constants
- Named exports only (except Next.js pages/views)
- Prefix types with `T`, interfaces with `I` (e.g., `TUser`, `IUserProps`)
- Single non-exported type per file must be named `TProps`
- No comments unless absolutely necessary for obscure syntax

### Functional Programming
- Functions must be pure when possible
- Favor immutability (spread objects/arrays, don't mutate)
- No classes, `extends`, `new`, or `this`
- Use composition over inheritance

### Testing
- No testing needed unless explicitly requested by user
- If tests are mentioned, ask for confirmation before implementing

## Branch & Working Directory

**Branch:** `fix/schema-loading-improvements`  
**Working Directory:** `/home/remco-stoeten/projects/PACKAGES/drizzleasy/apps/drizzleasy`

## Problem Statement

The current schema auto-loading system in `src/database/config-loader.ts` has critical issues:

1. **Limited search scope** - Only searches `process.cwd()`, fails in monorepos
2. **Poor error messages** - Vague errors that don't guide users to solutions  
3. **Next.js/Turbopack issues** - Dynamic imports fail in complex bundling environments
4. **No schema validation** - Imports succeed even with invalid/empty schemas
5. **No manual override** - Users can't bypass auto-loading to pass schema directly

## Your Mission

Improve the schema auto-loading system to be robust, provide actionable error messages, and offer manual override capability.

## Task 1: Enhanced Directory Search

**File:** `src/database/config-loader.ts`  
**Function:** `findDrizzleConfig()`

**Current Issue:** Only searches `process.cwd()`

**Required Changes:**
```typescript
export function findDrizzleConfig(): string {
    const possibleConfigs = ['drizzle.config.ts', 'drizzle.config.js', 'drizzle.config.mjs']
    const searchedPaths: string[] = []
    let currentDir = process.cwd()
    
    // Search current directory and up to 5 parent directories
    for (let i = 0; i < 6; i++) {
        for (const config of possibleConfigs) {
            const configPath = resolve(currentDir, config)
            searchedPaths.push(configPath)
            if (existsSync(configPath)) {
                return configPath
            }
        }
        
        const parentDir = resolve(currentDir, '..')
        if (parentDir === currentDir) break // Reached filesystem root
        currentDir = parentDir
    }
    
    throw new Error(
        'drizzle.config.ts not found in project root or parent directories.\n\n' +
        'Please ensure you have a drizzle.config.ts file with a schema field:\n' +
        '  export default { schema: "./src/db/schema.ts" }\n\n' +
        'Searched directories:\n' +
        searchedPaths.map(p => `  - ${p}`).join('\n')
    )
}
```

## Task 2: Schema Validation

**File:** `src/database/config-loader.ts`  
**Add new function:**

```typescript
function validateSchema(schema: any): void {
    if (!schema || typeof schema !== 'object') {
        throw new Error(
            'Invalid schema: Schema must be an object.\n\n' +
            'Make sure your schema file exports table definitions:\n' +
            '  export const users = pgTable("users", { id: serial("id").primaryKey() })'
        )
    }
    
    const tableNames = Object.keys(schema)
    if (tableNames.length === 0) {
        throw new Error(
            'Empty schema: No tables found in schema files.\n\n' +
            'Make sure your schema files export table definitions using named exports.'
        )
    }
    
    // Check if at least one export looks like a Drizzle table
    const hasValidTable = tableNames.some(key => {
        const table = schema[key]
        return table && typeof table === 'object' && Symbol.for('drizzle:table') in table
    })
    
    if (!hasValidTable) {
        throw new Error(
            `Invalid schema: Found exports (${tableNames.join(', ')}) but none are Drizzle tables.\n\n` +
            'Make sure you are using Drizzle ORM table definitions:\n' +
            '  import { pgTable, serial, text } from "drizzle-orm/pg-core"\n' +
            '  export const users = pgTable("users", { ... })'
        )
    }
}
```

**Update `loadSchemaFromConfig()`:** Add validation before return:
```typescript
const merged = mergeSchemas(validSchemas)
validateSchema(merged) // Add this line
return merged
```

## Task 3: Improved Import Error Messages

**File:** `src/database/config-loader.ts`  
**Function:** `safeImport()`

**Update with better error context:**
```typescript
async function safeImport(modulePath: string): Promise<any> {
    try {
        const normalizedPath = modulePath.replace(/\\\\/g, '/')
        const module = await import(
            /* webpackIgnore: true */
            /* @vite-ignore */
            normalizedPath
        )
        return module
    } catch (error: any) {
        const errorMessage = error?.message || String(error)
        
        console.error(
            `\n❌ Failed to import schema file: ${modulePath}\n` +
            `   Reason: ${errorMessage}\n\n` +
            `   Troubleshooting:\n` +
            `   - Check that the file exists and has no syntax errors\n` +
            `   - Ensure all imports in the schema file are valid\n` +
            `   - Try running: bun run build\n`
        )
        
        if (process.env.NODE_ENV === 'development') {
            console.error('Debug info:', {
                path: modulePath,
                exists: existsSync(modulePath),
                cwd: process.cwd()
            })
        }
        
        return null
    }
}
```

Apply similar improvements to `safeImportForNextJS()`.

## Task 4: Manual Schema Override

**File:** `src/database/index.ts`

**Update `ConnectionOptions` type:**
```typescript
type ConnectionOptions = {
    authToken?: string
    schema?: any // Add manual schema override
}
```

**Update `createSingleConnection()` function:**
```typescript
async function createSingleConnection(
    url: string,
    options?: ConnectionOptions,
    cacheNamespace: string = 'default'
) {
    const cacheKey = `${cacheNamespace}:${url}:${options?.authToken || ''}`
    
    if (connectionCache.has(cacheKey)) {
        return connectionCache.get(cacheKey)
    }
    
    // Allow manual schema override or auto-load
    const schema = options?.schema || await loadSchemaFromConfig()
    
    // Rest of function remains unchanged...
    let connection: any
    
    if (url.startsWith('libsql://')) {
        if (!options?.authToken) {
            throw new Error('Turso requires authToken option')
        }
        connection = await setupTurso(url, options.authToken, schema)
    } else if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
        if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes(':5432')) {
            connection = await setupPostgresLocal(url, schema)
        } else {
            connection = await setupPostgres(url, schema)
        }
    } else if (url.startsWith('file:') || (!url.includes('://') && url.endsWith('.db'))) {
        connection = await setupSqlite(url, schema)
    } else {
        throw new Error(`Unsupported database URL format: ${url}`)
    }
    
    connectionCache.set(cacheKey, connection)
    return connection
}
```

## Task 5: Update Types

**File:** `src/types/database.ts` (or appropriate types file)

Ensure the `ConnectionOptions` type is properly exported and available where needed. If this file doesn't exist, you may need to add the type definition to the main types export.

## Testing & Verification

**Manual Testing:**
```bash
# Navigate to package directory
cd /home/remco-stoeten/projects/PACKAGES/drizzleasy/apps/drizzleasy

# Build to check for TypeScript errors
bun run build

# Run existing tests
bun run test

# Test scenarios to verify manually:
# 1. Remove drizzle.config.ts and see improved error message
# 2. Create invalid schema file and verify validation works
# 3. Test manual schema override in connection
```

## Success Criteria

- ✅ `findDrizzleConfig()` searches parent directories (up to 5 levels)
- ✅ Error messages are actionable and include searched paths
- ✅ Schema validation detects invalid/empty schemas with helpful messages  
- ✅ `initializeConnection()` accepts optional `schema` parameter
- ✅ Import error messages provide troubleshooting guidance
- ✅ All existing functionality continues to work
- ✅ TypeScript builds without errors
- ✅ Existing tests pass

## Files You Will Modify

1. `src/database/config-loader.ts` - Main changes (functions: `findDrizzleConfig`, `loadSchemaFromConfig`, `safeImport`, `safeImportForNextJS`, add `validateSchema`)
2. `src/database/index.ts` - Add schema parameter to connection options
3. `src/types/` - Update/add types as needed

## Important Notes

- Follow functional programming guidelines (no arrow functions, pure functions)
- Use named exports only
- Keep error messages actionable and user-friendly
- Don't break existing API compatibility
- Test thoroughly with `bun run build` and `bun run test`
- Ask before implementing tests unless explicitly needed

## Coordination

You are **Agent 1** working in parallel with **Agent 2** (Documentation). Agent 2 will reference your improved error messages in their documentation work. Share your final error message formats when complete so they can document them properly.