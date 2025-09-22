import { TDatabase, TSchema } from '../types/database'
import { setupPostgres } from './providers/postgres'
import { setupPostgresLocal } from './providers/postgres-local'
import { setupSqlite } from './providers/sqlite'
import { setupTurso } from './providers/turso'
import { loadSchemaFromConfig } from './config-loader'

export interface ConnectionConfig {
    url: string
    authToken?: string
    options?: {
        maxRetries?: number
        retryDelay?: number
        poolSize?: number
        timeout?: number
        healthCheckInterval?: number
    }
}

export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy'
    connections: Record<string, ConnectionHealth>
    lastCheck: Date
}

export interface ConnectionHealth {
    status: 'healthy' | 'degraded' | 'unhealthy'
    lastCheck: Date
    responseTime: number
    errorCount: number
    lastError?: string
}

export interface DatabaseConnection {
    db: TDatabase
    config: ConnectionConfig
    health: ConnectionHealth
    close: () => Promise<void>
}

export class ConnectionManager {
    private connections = new Map<string, DatabaseConnection>()
    private healthCheckIntervals = new Map<string, NodeJS.Timeout>()
    private schema: TSchema | null = null

    /**
     * Initialize a database connection with health monitoring and retry logic
     */
    async initialize(config: ConnectionConfig, name: string = 'default'): Promise<DatabaseConnection> {
        // Load schema if not already loaded
        if (!this.schema) {
            try {
                this.schema = await loadSchemaFromConfig()
            } catch (error) {
                throw new Error(`Failed to load schema: ${error}`)
            }
        }

        // Check if connection already exists
        if (this.connections.has(name)) {
            const existing = this.connections.get(name)!
            if (existing.health.status === 'healthy') {
                return existing
            }
            // Close unhealthy connection before creating new one
            await this.closeConnection(name)
        }

        const connection = await this.createConnectionWithRetry(config, name)
        this.connections.set(name, connection)
        
        // Start health monitoring
        this.startHealthMonitoring(name, config.options?.healthCheckInterval || 30000)
        
        return connection
    }

    /**
     * Get an existing connection by name
     */
    getConnection(name: string = 'default'): DatabaseConnection {
        const connection = this.connections.get(name)
        if (!connection) {
            throw new Error(`Connection '${name}' not found. Initialize it first.`)
        }
        
        if (connection.health.status === 'unhealthy') {
            throw new Error(`Connection '${name}' is unhealthy. Last error: ${connection.health.lastError}`)
        }
        
        return connection
    }

    /**
     * Perform health check on all connections
     */
    async healthCheck(): Promise<HealthStatus> {
        const connections: Record<string, ConnectionHealth> = {}
        
        for (const [name, connection] of this.connections) {
            connections[name] = await this.checkConnectionHealth(connection)
        }
        
        const overallStatus = this.determineOverallHealth(Object.values(connections))
        
        return {
            status: overallStatus,
            connections,
            lastCheck: new Date()
        }
    }

    /**
     * Close a specific connection
     */
    async closeConnection(name: string): Promise<void> {
        const connection = this.connections.get(name)
        if (connection) {
            // Stop health monitoring
            const interval = this.healthCheckIntervals.get(name)
            if (interval) {
                clearInterval(interval)
                this.healthCheckIntervals.delete(name)
            }
            
            // Close connection
            await connection.close()
            this.connections.delete(name)
        }
    }

    /**
     * Close all connections
     */
    async close(): Promise<void> {
        const closePromises = Array.from(this.connections.keys()).map(name => 
            this.closeConnection(name)
        )
        await Promise.all(closePromises)
    }

    /**
     * Create connection with retry logic and exponential backoff
     */
    private async createConnectionWithRetry(
        config: ConnectionConfig, 
        name: string
    ): Promise<DatabaseConnection> {
        const maxRetries = config.options?.maxRetries || 3
        const baseDelay = config.options?.retryDelay || 1000
        
        let lastError: Error | null = null
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const db = await this.createDatabaseConnection(config)
                
                // Test connection with a simple query
                await this.testConnection(db)
                
                const health: ConnectionHealth = {
                    status: 'healthy',
                    lastCheck: new Date(),
                    responseTime: 0,
                    errorCount: 0
                }
                
                return {
                    db,
                    config,
                    health,
                    close: async () => {
                        // Provider-specific cleanup will be handled by the underlying driver
                        // For now, we just mark as closed
                        return Promise.resolve()
                    }
                }
            } catch (error) {
                lastError = error as Error
                
                if (attempt < maxRetries) {
                    // Exponential backoff: delay = baseDelay * 2^attempt
                    const delay = baseDelay * Math.pow(2, attempt)
                    await this.sleep(delay)
                }
            }
        }
        
        throw new Error(
            `Failed to establish connection '${name}' after ${maxRetries + 1} attempts. ` +
            `Last error: ${this.sanitizeError(lastError?.message || 'Unknown error')}`
        )
    }

    /**
     * Create database connection based on URL type
     */
    private async createDatabaseConnection(config: ConnectionConfig): Promise<TDatabase> {
        const { url, authToken } = config
        
        if (url.startsWith('libsql://')) {
            if (!authToken) {
                throw new Error('Turso requires authToken option')
            }
            return await setupTurso(url, authToken, this.schema!)
        } else if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
            // Detect local vs cloud PostgreSQL
            if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes(':5432')) {
                return await setupPostgresLocal(url, this.schema!)
            } else {
                return await setupPostgres(url, this.schema!)
            }
        } else if (url.startsWith('file:') || (!url.includes('://') && url.endsWith('.db'))) {
            return await setupSqlite(url, this.schema!)
        } else {
            throw new Error(`Unsupported database URL format: ${url}`)
        }
    }

    /**
     * Test connection with a simple query
     */
    private async testConnection(db: TDatabase): Promise<void> {
        try {
            // Try a simple query that should work on all database types
            // This is a basic connectivity test
            const query = db.select().limit(1)
            await query
        } catch (error) {
            throw new Error(`Connection test failed: ${error}`)
        }
    }

    /**
     * Start health monitoring for a connection
     */
    private startHealthMonitoring(name: string, intervalMs: number): void {
        const interval = setInterval(async () => {
            const connection = this.connections.get(name)
            if (connection) {
                connection.health = await this.checkConnectionHealth(connection)
            }
        }, intervalMs)
        
        this.healthCheckIntervals.set(name, interval)
    }

    /**
     * Check health of a specific connection
     */
    private async checkConnectionHealth(connection: DatabaseConnection): Promise<ConnectionHealth> {
        const startTime = Date.now()
        
        try {
            await this.testConnection(connection.db)
            
            const responseTime = Date.now() - startTime
            
            return {
                status: 'healthy',
                lastCheck: new Date(),
                responseTime,
                errorCount: 0
            }
        } catch (error) {
            const responseTime = Date.now() - startTime
            const errorCount = connection.health.errorCount + 1
            
            return {
                status: errorCount > 3 ? 'unhealthy' : 'degraded',
                lastCheck: new Date(),
                responseTime,
                errorCount,
                lastError: this.sanitizeError((error as Error).message)
            }
        }
    }

    /**
     * Determine overall health status from individual connection healths
     */
    private determineOverallHealth(healths: ConnectionHealth[]): 'healthy' | 'degraded' | 'unhealthy' {
        if (healths.length === 0) return 'unhealthy'
        
        const unhealthyCount = healths.filter(h => h.status === 'unhealthy').length
        const degradedCount = healths.filter(h => h.status === 'degraded').length
        
        if (unhealthyCount > 0) return 'unhealthy'
        if (degradedCount > 0) return 'degraded'
        return 'healthy'
    }

    /**
     * Sanitize error messages to prevent credential leakage
     */
    private sanitizeError(message: string): string {
        // Remove potential credentials from error messages
        return message
            .replace(/postgresql:\/\/[^@]+@/g, 'postgresql://***:***@')
            .replace(/postgres:\/\/[^@]+@/g, 'postgres://***:***@')
            .replace(/libsql:\/\/[^@]+@/g, 'libsql://***@')
            .replace(/password[=:]\s*[^\s&]+/gi, 'password=***')
            .replace(/token[=:]\s*[^\s&]+/gi, 'token=***')
    }

    /**
     * Sleep utility for retry delays
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

// Export singleton instance
export const connectionManager = new ConnectionManager()