import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ConnectionManager } from '../database/connection-manager'

// Mock the config loader
vi.mock('../database/config-loader', () => ({
    loadSchemaFromConfig: vi.fn().mockResolvedValue({
        users: { id: 'text', name: 'text' }
    })
}))

// Mock the database providers
vi.mock('../database/providers/sqlite', () => ({
    setupSqlite: vi.fn().mockResolvedValue({
        select: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
        })
    })
}))

describe('ConnectionManager', () => {
    let connectionManager: ConnectionManager

    beforeEach(() => {
        connectionManager = new ConnectionManager()
        vi.clearAllMocks()
    })

    afterEach(async () => {
        await connectionManager.close()
    })

    it('should initialize a connection successfully', async () => {
        const config = {
            url: 'file::memory:',
            options: {
                maxRetries: 2,
                retryDelay: 100,
                healthCheckInterval: 1000
            }
        }

        const connection = await connectionManager.initialize(config, 'test')

        expect(connection).toBeDefined()
        expect(connection.db).toBeDefined()
        expect(connection.config).toEqual(config)
        expect(connection.health.status).toBe('healthy')
    })

    it('should retry connection on failure and eventually succeed', async () => {
        const { setupSqlite } = await import('../database/providers/sqlite')
        
        // Mock first call to fail, second to succeed
        vi.mocked(setupSqlite)
            .mockRejectedValueOnce(new Error('Connection failed'))
            .mockResolvedValueOnce({
                select: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([])
                })
            })

        const config = {
            url: 'file::memory:',
            options: {
                maxRetries: 2,
                retryDelay: 10 // Short delay for testing
            }
        }

        const connection = await connectionManager.initialize(config, 'retry-test')

        expect(connection).toBeDefined()
        expect(connection.health.status).toBe('healthy')
        expect(setupSqlite).toHaveBeenCalledTimes(2)
    })

    it('should fail after max retries', async () => {
        const { setupSqlite } = await import('../database/providers/sqlite')
        
        // Mock all calls to fail
        vi.mocked(setupSqlite).mockRejectedValue(new Error('Connection failed'))

        const config = {
            url: 'file::memory:',
            options: {
                maxRetries: 1,
                retryDelay: 10
            }
        }

        await expect(
            connectionManager.initialize(config, 'fail-test')
        ).rejects.toThrow(/Failed to establish connection/)
    })

    it('should sanitize error messages', async () => {
        const { setupSqlite } = await import('../database/providers/sqlite')
        
        // Mock to fail with credential in error message
        vi.mocked(setupSqlite).mockRejectedValue(
            new Error('Connection failed: postgresql://user:password@host/db')
        )

        const config = {
            url: 'file::memory:',
            options: {
                maxRetries: 0
            }
        }

        await expect(
            connectionManager.initialize(config, 'sanitize-test')
        ).rejects.toThrow(/postgresql:\/\/\*\*\*:\*\*\*@/)
    }, 10000)

    it('should perform health checks', async () => {
        const { setupSqlite } = await import('../database/providers/sqlite')
        
        // Reset mock to succeed
        vi.mocked(setupSqlite).mockResolvedValue({
            select: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([])
            })
        })

        const config = {
            url: 'file::memory:',
            options: {
                healthCheckInterval: 60000 // Long interval to avoid interference
            }
        }

        await connectionManager.initialize(config, 'health-test')
        
        const healthStatus = await connectionManager.healthCheck()

        expect(healthStatus.status).toBe('healthy')
        expect(healthStatus.connections['health-test']).toBeDefined()
        expect(healthStatus.connections['health-test'].status).toBe('healthy')
        expect(healthStatus.lastCheck).toBeInstanceOf(Date)
    }, 10000)
})