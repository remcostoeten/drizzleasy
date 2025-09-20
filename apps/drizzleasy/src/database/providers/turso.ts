import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { DatabaseConnectionError, handleAsyncError } from '../../utils/error-handler'
import { getEnvironment, getOptimalConfiguration } from '../../utils/environment'
import { measurePerformance } from '../../utils/performance'

export type TTursoConfig = {
  url: string
  authToken: string
  syncUrl?: string
  syncInterval?: number
  encryptionKey?: string
}

/**
 * Setup Turso (libSQL) connection with authentication token and production optimizations.
 * Turso is a distributed SQLite service that requires auth tokens.
 *
 * @param config - Turso configuration object
 * @param schema - Drizzle schema object with table definitions
 * @returns Promise resolving to configured Drizzle database instance
 * @throws DatabaseConnectionError if connection fails
 *
 * @example
 * ```typescript
 * const db = await setupTurso({
 *   url: 'libsql://my-db.turso.io',
 *   authToken: process.env.TURSO_AUTH_TOKEN!,
 *   syncInterval: 60
 * }, schema)
 * ```
 *
 * @internal Used internally by initializeConnection
 */
export async function setupTurso(config: TTursoConfig | string, schema: any, authToken?: string): Promise<any> {
    return handleAsyncError(async () => {
        return measurePerformance('turso-connection', async () => {
            const env = getEnvironment()
            const optimalConfig = getOptimalConfiguration()
            
            // Handle legacy string parameter for backward compatibility
            let tursoConfig: TTursoConfig
            if (typeof config === 'string') {
                if (!authToken) {
                    throw new DatabaseConnectionError(
                        'Auth token is required when using string URL parameter',
                        { url: config }
                    )
                }
                tursoConfig = { url: config, authToken }
            } else {
                tursoConfig = config
            }

            const client = createClient({
                url: tursoConfig.url,
                authToken: tursoConfig.authToken,
                syncUrl: tursoConfig.syncUrl || tursoConfig.url,
                syncInterval: tursoConfig.syncInterval || optimalConfig.syncInterval,
                encryptionKey: tursoConfig.encryptionKey
            })

            const db = drizzle(client, { 
                schema, 
                logger: env.isDevelopment
            })
            
            return db
        }, {
            url: tursoConfig.url,
            hasAuthToken: !!tursoConfig.authToken,
            syncEnabled: !!tursoConfig.syncInterval
        })
    }, 'Failed to establish Turso database connection', 'TURSO_CONNECTION_ERROR')
}
