import { existsSync } from 'fs'
import { resolve, join } from 'path'
import { glob } from 'glob'

/**
 * Find drizzle.config.ts file in the project root directory.
 * Searches for common config file extensions in order of preference.
 *
 * @returns Absolute path to the drizzle config file
 * @throws Error if no config file is found
 *
 * @example
 * ```typescript
 * const configPath = findDrizzleConfig()
 * console.log(configPath) // '/path/to/project/drizzle.config.ts'
 * ```
 */
export function findDrizzleConfig(): string {
    const possibleConfigs = ['drizzle.config.ts', 'drizzle.config.js', 'drizzle.config.mjs']
    const searchedPaths: string[] = []
    let currentDir = process.cwd()
    
    for (let i = 0; i < 6; i++) {
        for (const config of possibleConfigs) {
            const configPath = resolve(currentDir, config)
            searchedPaths.push(configPath)
            if (existsSync(configPath)) {
                return configPath
            }
        }
        
        const parentDir = resolve(currentDir, '..')
        if (parentDir === currentDir) break
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

/**
 * Load and merge schema files from drizzle.config.ts configuration.
 * Automatically resolves glob patterns and imports all schema files.
 *
 * @returns Promise resolving to merged schema object
 * @throws Error if config file is not found or schema loading fails
 *
 * @example
 * ```typescript
 * const schema = await loadSchemaFromConfig()
 * console.log(Object.keys(schema)) // ['users', 'posts', 'comments']
 * ```
 */
export async function loadSchemaFromConfig(): Promise<any> {
    try {
        const configPath = findDrizzleConfig()

        // Dynamic import the config with proper error handling
        const config = await safeImport(configPath)
        const drizzleConfig = config.default

        if (!drizzleConfig.schema) {
            throw new Error('No schema found in drizzle.config.ts')
        }

        // Resolve schema pattern to actual files
        const schemaPattern = drizzleConfig.schema
        const schemaFiles = await resolveSchemaFiles(schemaPattern)

        if (schemaFiles.length === 0) {
            throw new Error(`No schema files found matching pattern: ${schemaPattern}`)
        }

        // Import all schema files with improved error handling
        const schemas = await Promise.all(
            schemaFiles.map(async (file) => {
                const absolutePath = resolve(process.cwd(), file)
                if (isNextJSEnvironment()) {
                    // Use Next.js-compatible import strategy
                    return await safeImportForNextJS(absolutePath)
                } else {
                    // Standard dynamic import
                    return await safeImport(absolutePath)
                }
            })
        )

        // Filter out null results from failed imports
        const validSchemas = schemas.filter(schema => schema !== null)
        
        if (validSchemas.length === 0) {
            throw new Error('Failed to load any schema files')
        }

        const merged = mergeSchemas(validSchemas)
        validateSchema(merged)
        return merged
    } catch (error) {
        throw new Error(`Failed to load schema: ${error}`)
    }
}

/**
 * Resolve glob patterns to actual schema file paths.
 * Supports both single files and glob patterns like './src/schema/*.ts'.
 *
 * @param pattern - Single file path or array of file paths/glob patterns
 * @returns Promise resolving to array of resolved file paths
 *
 * @internal Used internally by loadSchemaFromConfig
 */
async function resolveSchemaFiles(pattern: string | string[]): Promise<string[]> {
    const patterns = Array.isArray(pattern) ? pattern : [pattern]
    const files: string[] = []

    for (const p of patterns) {
        if (p.includes('*')) {
            // Glob pattern
            const globFiles = await glob(p, { cwd: process.cwd() })
            files.push(...globFiles)
        } else {
            // Single file
            files.push(p)
        }
    }

    return files
}

/**
 * Merge multiple schema objects into a single schema object.
 * Combines all exported tables from different schema files.
 *
 * @param schemas - Array of imported schema modules
 * @returns Merged schema object containing all tables
 *
 * @internal Used internally by loadSchemaFromConfig
 */
function mergeSchemas(schemas: any[]): any {
    const merged = {}

    for (const schema of schemas) {
        Object.assign(merged, schema)
    }

    return merged
}

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

/**
 * Safely import a module with better error handling.
 * Handles both CommonJS and ES modules.
 *
 * @param modulePath - Absolute path to the module
 * @returns Promise resolving to the imported module or null on error
 * @internal
 */
async function safeImport(modulePath: string): Promise<any> {
    try {
        const normalizedPath = modulePath.replace(/\\/g, '/')
        
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

/**
 * Next.js-specific safe import that handles Turbopack module resolution.
 * Uses alternative import strategies that work better with Next.js bundling.
 *
 * @param modulePath - Absolute path to the module
 * @returns Promise resolving to the imported module or null on error
 * @internal
 */
async function safeImportForNextJS(modulePath: string): Promise<any> {
    try {
        const relativePath = modulePath.replace(process.cwd(), '.')
        
        try {
            const module = await import(
                /* webpackIgnore: true */
                /* @vite-ignore */
                relativePath
            )
            return module
        } catch (relativeError) {
            try {
                const fileUrl = `file://${modulePath}`
                const module = await import(
                    /* webpackIgnore: true */
                    /* @vite-ignore */
                    fileUrl
                )
                return module
            } catch (fileUrlError) {
                const module = await import(
                    /* webpackIgnore: true */
                    /* @vite-ignore */
                    modulePath
                )
                return module
            }
        }
    } catch (error: any) {
        const errorMessage = error?.message || String(error)
        
        console.error(
            `\n❌ Failed to import schema file in Next.js environment: ${modulePath}\n` +
            `   Reason: ${errorMessage}\n\n` +
            `   Troubleshooting:\n` +
            `   - Check that the file exists and has no syntax errors\n` +
            `   - Ensure all imports in the schema file are valid\n` +
            `   - Try using manual schema override: initializeConnection(url, { schema })\n` +
            `   - Try running: bun run build\n`
        )
        
        if (process.env.NODE_ENV === 'development') {
            console.error('Next.js debug info:', {
                absolutePath: modulePath,
                relativePath: modulePath.replace(process.cwd(), '.'),
                cwd: process.cwd(),
                turbopack: !!process.env.TURBOPACK,
                exists: existsSync(modulePath)
            })
        }
        
        return null
    }
}

/**
 * Detect if we're running in a Next.js environment.
 * Checks for Next.js-specific environment variables and globals.
 *
 * @returns true if running in Next.js environment
 * @internal
 */
function isNextJSEnvironment(): boolean {
    return !!(
        // Check for Next.js environment variables
        process.env.NEXT_RUNTIME ||
        process.env.TURBOPACK ||
        process.env.__NEXT_PRIVATE_ORIGIN ||
        // Check for Next.js in process.env
        process.env.npm_config_user_config?.includes('next') ||
        // Check for Next.js in the process title or argv
        process.title?.includes('next') ||
        process.argv.some(arg => arg.includes('next'))
    )
}
