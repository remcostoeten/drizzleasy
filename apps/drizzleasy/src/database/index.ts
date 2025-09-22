import { connectionManager, ConnectionConfig, HealthStatus } from './connection-manager'

type ConnectionOptions = {
    authToken?: string
    maxRetries?: number
    retryDelay?: number
    poolSize?: number
    timeout?: number
    healthCheckInterval?: number
}

type MultiConnectionConfig =
    | {
          [key: string]: string | ConnectionConfig
      }
    | {
          development?: string | ConnectionConfig
          production?: string | ConnectionConfig
          test?: string | ConnectionConfig
      }

/**
 * Initialize database connection with health monitoring, retry logic, and connection pooling.
 *
 * @example Single database
 * ```typescript
 * const db = await initializeConnection(process.env.DATABASE_URL!)
 * ```
 *
 * @example Turso with auth token
 * ```typescript
 * const db = await initializeConnection(process.env.DATABASE_URL!, {
 *   authToken: process.env.TURSO_AUTH_TOKEN
 * })
 * ```
 *
 * @example Connection with retry and health monitoring
 * ```typescript
 * const db = await initializeConnection(process.env.DATABASE_URL!, {
 *   maxRetries: 3,
 *   retryDelay: 1000,
 *   healthCheckInterval: 30000
 * })
 * ```
 *
 * @example Environment switching
 * ```typescript
 * const db = await initializeConnection({
 *   development: 'file:./dev.db',
 *   production: process.env.DATABASE_URL!
 * })
 * ```
 */
export async function initializeConnection(
    input: string | MultiConnectionConfig,
    options?: ConnectionOptions
): Promise<any> {
    // Single URL
    if (typeof input === 'string') {
        const config: ConnectionConfig = {
            url: input,
            authToken: options?.authToken,
            options: {
                maxRetries: options?.maxRetries,
                retryDelay: options?.retryDelay,
                poolSize: options?.poolSize,
                timeout: options?.timeout,
                healthCheckInterval: options?.healthCheckInterval
            }
        }
        const connection = await connectionManager.initialize(config)
        return connection.db
    }

    // Multi-database config
    if (typeof input === 'object') {
        // Environment-based switching
        if ('development' in input || 'production' in input) {
            const env = process.env.NODE_ENV || 'development'
            const config = input[env as keyof typeof input]

            if (typeof config === 'string') {
                const connectionConfig: ConnectionConfig = {
                    url: config,
                    authToken: options?.authToken,
                    options: {
                        maxRetries: options?.maxRetries,
                        retryDelay: options?.retryDelay,
                        poolSize: options?.poolSize,
                        timeout: options?.timeout,
                        healthCheckInterval: options?.healthCheckInterval
                    }
                }
                const connection = await connectionManager.initialize(connectionConfig, 'env')
                return connection.db
            } else if (config && typeof config === 'object') {
                const connectionConfig: ConnectionConfig = {
                    url: config.url,
                    authToken: config.authToken || options?.authToken,
                    options: {
                        maxRetries: options?.maxRetries,
                        retryDelay: options?.retryDelay,
                        poolSize: options?.poolSize,
                        timeout: options?.timeout,
                        healthCheckInterval: options?.healthCheckInterval
                    }
                }
                const connection = await connectionManager.initialize(connectionConfig, 'env')
                return connection.db
            }

            throw new Error(`No configuration found for environment: ${env}`)
        }

        // Named databases
        const connections: Record<string, any> = {}
        for (const [name, config] of Object.entries(input)) {
            if (typeof config === 'string') {
                const connectionConfig: ConnectionConfig = {
                    url: config,
                    authToken: options?.authToken,
                    options: {
                        maxRetries: options?.maxRetries,
                        retryDelay: options?.retryDelay,
                        poolSize: options?.poolSize,
                        timeout: options?.timeout,
                        healthCheckInterval: options?.healthCheckInterval
                    }
                }
                const connection = await connectionManager.initialize(connectionConfig, name)
                connections[name] = connection.db
            } else if (config && typeof config === 'object') {
                const connectionConfig: ConnectionConfig = {
                    url: config.url,
                    authToken: config.authToken || options?.authToken,
                    options: {
                        maxRetries: options?.maxRetries,
                        retryDelay: options?.retryDelay,
                        poolSize: options?.poolSize,
                        timeout: options?.timeout,
                        healthCheckInterval: options?.healthCheckInterval
                    }
                }
                const connection = await connectionManager.initialize(connectionConfig, name)
                connections[name] = connection.db
            }
        }
        return connections
    }

    throw new Error('Invalid connection configuration')
}

/**
 * Get an existing database connection by name
 */
export function getConnection(name: string = 'default'): any {
    const connection = connectionManager.getConnection(name)
    return connection.db
}

/**
 * Check health status of all database connections
 */
export async function checkConnectionHealth(): Promise<HealthStatus> {
    return await connectionManager.healthCheck()
}

/**
 * Close a specific database connection
 */
export async function closeConnection(name: string = 'default'): Promise<void> {
    await connectionManager.closeConnection(name)
}

/**
 * Close all database connections
 */
export async function closeAllConnections(): Promise<void> {
    await connectionManager.close()
}

// Export connection manager types and utilities
export { ConnectionConfig, HealthStatus, ConnectionHealth, DatabaseConnection } from './connection-manager'
export { connectionManager } from './connection-manager'