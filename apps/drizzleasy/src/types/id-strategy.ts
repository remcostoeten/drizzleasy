/**
 * Supported ID generation strategies
 */
export type TIdStrategyType = 'nanoid' | 'uuid' | 'cuid2' | 'ulid'

/**
 * Custom ID generator function
 */
export type TCustomIdGenerator = {
    type: 'custom'
    generate: (tableName: string) => string
}

/**
 * ID strategy can be a built-in type or custom generator
 */
export type TIdStrategy = TIdStrategyType | TCustomIdGenerator

/**
 * Configuration options for ID generation
 */
export type TIdOptions = {
    /** Default strategy to use when none specified */
    default: TIdStrategy
    /** Per-table strategy overrides */
    tables?: Record<string, TIdStrategy>
    /** Attempt to detect PK type from schema */
    detect?: boolean
}

/**
 * Overall Drizzleasy configuration options
 */
export type TDrizzleasyOptions = {
    /** ID generation configuration */
    id?: TIdOptions
}