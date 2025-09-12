import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { PgDatabase } from 'drizzle-orm/pg-core'
import type { MySql2Database } from 'drizzle-orm/mysql2'

export type TDatabase = DrizzleD1Database<any> | PgDatabase<any> | MySql2Database<any>
export type TSchema = Record<string, any>