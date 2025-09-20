import { defineConfig } from 'tsup'

export default defineConfig([
    // Client entry (browser-safe, default export)
    {
        entry: { 'client': 'src/client-entry.ts' },
        format: ['cjs', 'esm'],
        dts: true,
        splitting: false,
        sourcemap: true,
        clean: true,
        outDir: 'dist',
        target: 'es2020',
        platform: 'browser',
        external: [
            'react',
            'react-dom',
            'next'
        ],
        outExtension({ format }) {
            return {
                js: format === 'cjs' ? '.cjs' : '.js'
            }
        }
    },
    // Server entry (Node.js with all features)
    {
        entry: { 'server': 'src/server-entry.ts' },
        format: ['cjs', 'esm'],
        dts: true,
        splitting: false,
        sourcemap: true,
        clean: false,
        outDir: 'dist',
        target: 'node18',
        platform: 'node',
        external: [
            'drizzle-orm',
            /^drizzle-orm\/.*/,
            '@neondatabase/serverless',
            '@libsql/client',
            'better-sqlite3',
            'pg',
            'postgres',
            'glob',
            'fs',
            'path',
            'react',
            'react-dom',
            'next'
        ],
        outExtension({ format }) {
            return {
                js: format === 'cjs' ? '.cjs' : '.js'
            }
        },
        esbuildOptions(options) {
            options.alias = {
                cli: './src/cli',
                types: './src/types'
            }
        }
    },
    // CLI entry (standalone executable)
    {
        entry: { 'cli/index': 'src/cli-entry.ts' },
        format: ['esm'],
        dts: false,
        splitting: false,
        sourcemap: false,
        clean: false,
        outDir: 'dist',
        target: 'node18',
        platform: 'node',
        external: [
            'drizzle-orm',
            /^drizzle-orm\/.*/,
            '@neondatabase/serverless',
            '@libsql/client',
            'better-sqlite3',
            'pg',
            'postgres',
            'glob'
        ]
    },
    // Legacy index for backward compatibility
    {
        entry: { 'index': 'src/index.ts' },
        format: ['cjs', 'esm'],
        dts: true,
        splitting: false,
        sourcemap: true,
        clean: false,
        outDir: 'dist',
        target: 'node18',
        platform: 'node',
        external: [
            'drizzle-orm',
            /^drizzle-orm\/.*/,
            '@neondatabase/serverless',
            '@libsql/client',
            'better-sqlite3',
            'pg',
            'postgres',
            'glob',
            'fs',
            'path',
            'react',
            'react-dom',
            'next'
        ],
        outExtension({ format }) {
            return {
                js: format === 'cjs' ? '.cjs' : '.js'
            }
        }
    }
])
