import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { initializeConnection, closeAllConnections } from '../database'

vi.mock('../database/providers/postgres', () => ({
    setupPostgres: vi.fn().mockResolvedValue({
        select: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
        })
    })
}))
vi.mock('../database/providers/postgres-local', () => ({
    setupPostgresLocal: vi.fn().mockResolvedValue({
        select: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
        })
    })
}))
vi.mock('../database/providers/sqlite', () => ({
    setupSqlite: vi.fn().mockResolvedValue({
        select: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
        })
    })
}))
vi.mock('../database/providers/turso', () => ({
    setupTurso: vi.fn().mockResolvedValue({
        select: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
        })
    })
}))
vi.mock('../database/config-loader', () => ({
    loadSchemaFromConfig: vi.fn().mockResolvedValue({ users: 'table' })
}))

describe('Database Connection', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(async () => {
        await closeAllConnections()
    })

    test('detects PostgreSQL cloud provider', async () => {
        const { setupPostgres } = await import('../database/providers/postgres')
        const db = await initializeConnection('postgresql://neon.tech/db')
        expect(setupPostgres).toHaveBeenCalledWith('postgresql://neon.tech/db', { users: 'table' })
        expect(db).toBeDefined()
    })

    test('detects local PostgreSQL', async () => {
        const { setupPostgresLocal } = await import('../database/providers/postgres-local')
        const db = await initializeConnection('postgresql://localhost:5432/mydb')
        expect(setupPostgresLocal).toHaveBeenCalledWith('postgresql://localhost:5432/mydb', {
            users: 'table'
        })
        expect(db).toBeDefined()
    })

    test('requires auth token for Turso', async () => {
        await expect(
            initializeConnection('libsql://my-db.turso.io', { maxRetries: 0 })
        ).rejects.toThrow('Turso requires authToken option')
    }, 10000)

    test('connects to Turso with auth token', async () => {
        const { setupTurso } = await import('../database/providers/turso')
        const db = await initializeConnection('libsql://my-db.turso.io', { authToken: 'token123' })
        expect(setupTurso).toHaveBeenCalledWith('libsql://my-db.turso.io', 'token123', {
            users: 'table'
        })
        expect(db).toBeDefined()
    })

    test('switches database by environment', async () => {
        process.env.NODE_ENV = 'development'
        const { setupSqlite } = await import('../database/providers/sqlite')

        const db = await initializeConnection({
            development: 'file:./dev.db',
            production: 'postgresql://prod.db'
        })

        expect(setupSqlite).toHaveBeenCalledWith('file:./dev.db', { users: 'table' })
        expect(db).toBeDefined()
    })

    test('creates multiple named connections', async () => {
        const { setupPostgres } = await import('../database/providers/postgres')
        const { setupSqlite } = await import('../database/providers/sqlite')

        const result = await initializeConnection({
            main: 'postgresql://main.db',
            cache: 'file:./cache.db'
        })

        expect(setupPostgres).toHaveBeenCalledWith('postgresql://main.db', { users: 'table' })
        expect(setupSqlite).toHaveBeenCalledWith('file:./cache.db', { users: 'table' })
        expect(result).toEqual({
            main: expect.any(Object),
            cache: expect.any(Object)
        })
    })

    test('rejects unsupported URL formats', async () => {
        await expect(
            initializeConnection('mysql://unsupported.db', { maxRetries: 0 })
        ).rejects.toThrow('Unsupported database URL format')
    }, 10000)
})
