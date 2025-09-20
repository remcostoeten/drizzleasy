/**
 * Production environment validation and configuration utilities for Drizzleasy
 */

import { ValidationError } from './error-handler'

export type TEnvironmentConfig = {
  nodeEnv: 'development' | 'production' | 'test'
  isDevelopment: boolean
  isProduction: boolean
  isTest: boolean
}

export type TDatabaseEnvironmentConfig = {
  url?: string
  authToken?: string
  syncUrl?: string
  syncInterval?: number
  maxConnections?: number
  connectionTimeout?: number
}

export function getEnvironment(): TEnvironmentConfig {
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test'
  
  return {
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    isTest: nodeEnv === 'test'
  }
}

export function validateDatabaseEnvironment(required: boolean = true): TDatabaseEnvironmentConfig {
  const config: TDatabaseEnvironmentConfig = {
    url: process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
    syncUrl: process.env.DATABASE_SYNC_URL,
    syncInterval: process.env.DATABASE_SYNC_INTERVAL ? parseInt(process.env.DATABASE_SYNC_INTERVAL) : undefined,
    maxConnections: process.env.DATABASE_MAX_CONNECTIONS ? parseInt(process.env.DATABASE_MAX_CONNECTIONS) : undefined,
    connectionTimeout: process.env.DATABASE_CONNECTION_TIMEOUT ? parseInt(process.env.DATABASE_CONNECTION_TIMEOUT) : undefined
  }

  const env = getEnvironment()

  if (required || env.isProduction) {
    const missing: string[] = []

    if (!config.url) {
      missing.push('DATABASE_URL or TURSO_DATABASE_URL')
    }

    // Auth token is required for Turso/LibSQL connections
    if (config.url?.includes('libsql://') && !config.authToken) {
      missing.push('DATABASE_AUTH_TOKEN or TURSO_AUTH_TOKEN')
    }

    if (missing.length > 0) {
      throw new ValidationError(
        `Missing required database environment variables: ${missing.join(', ')}`,
        {
          missing,
          environment: env.nodeEnv,
          required
        }
      )
    }
  }

  return config
}

export function validateEnvironmentVariables(variables: Record<string, boolean>): void {
  const missing: string[] = []
  
  for (const [varName, isRequired] of Object.entries(variables)) {
    if (isRequired && !process.env[varName]) {
      missing.push(varName)
    }
  }

  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required environment variables: ${missing.join(', ')}`,
      { missing }
    )
  }
}

export function getConnectionUrl(): string | undefined {
  return process.env.DATABASE_URL || 
         process.env.TURSO_DATABASE_URL ||
         process.env.POSTGRES_URL ||
         process.env.MYSQL_URL ||
         process.env.SQLITE_URL
}

export function getConnectionType(url?: string): 'postgres' | 'mysql' | 'sqlite' | 'turso' | 'unknown' {
  const connectionUrl = url || getConnectionUrl()
  
  if (!connectionUrl) return 'unknown'
  
  if (connectionUrl.startsWith('postgres://') || connectionUrl.startsWith('postgresql://')) {
    return 'postgres'
  }
  
  if (connectionUrl.startsWith('mysql://')) {
    return 'mysql'
  }
  
  if (connectionUrl.startsWith('libsql://') || connectionUrl.includes('turso.io')) {
    return 'turso'
  }
  
  if (connectionUrl.endsWith('.db') || connectionUrl.includes('sqlite')) {
    return 'sqlite'
  }
  
  return 'unknown'
}

export function getOptimalConfiguration(): {
  maxConnections: number
  connectionTimeout: number
  syncInterval?: number
} {
  const env = getEnvironment()
  const connectionType = getConnectionType()
  
  // Base configuration
  let config = {
    maxConnections: 10,
    connectionTimeout: 30000, // 30 seconds
    syncInterval: undefined as number | undefined
  }
  
  // Production optimizations
  if (env.isProduction) {
    config.maxConnections = 20
    config.connectionTimeout = 10000 // 10 seconds in production
    
    if (connectionType === 'turso') {
      config.syncInterval = 60 // 1 minute sync for Turso in production
    }
  }
  
  // Development optimizations
  if (env.isDevelopment) {
    config.maxConnections = 5
    config.connectionTimeout = 60000 // 1 minute in development
  }
  
  // Override with environment variables if provided
  if (process.env.DATABASE_MAX_CONNECTIONS) {
    config.maxConnections = parseInt(process.env.DATABASE_MAX_CONNECTIONS)
  }
  
  if (process.env.DATABASE_CONNECTION_TIMEOUT) {
    config.connectionTimeout = parseInt(process.env.DATABASE_CONNECTION_TIMEOUT)
  }
  
  if (process.env.DATABASE_SYNC_INTERVAL) {
    config.syncInterval = parseInt(process.env.DATABASE_SYNC_INTERVAL)
  }
  
  return config
}

export function isNextJsEnvironment(): boolean {
  return typeof process !== 'undefined' && 
         (process.env.NEXT_RUNTIME !== undefined || 
          process.env.VERCEL !== undefined ||
          process.env.NETLIFY !== undefined)
}

export function getDeploymentPlatform(): 'vercel' | 'netlify' | 'railway' | 'heroku' | 'unknown' {
  if (process.env.VERCEL) return 'vercel'
  if (process.env.NETLIFY) return 'netlify'
  if (process.env.RAILWAY_PROJECT_ID) return 'railway'
  if (process.env.DYNO) return 'heroku'
  return 'unknown'
}