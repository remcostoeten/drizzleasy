import { eq, and, gt, gte, lt, lte, ne, inArray, like } from 'drizzle-orm'
import { getDb, getSchema, validateTableName } from './config'
import { safeExecute } from './core/execute'
import type { TEntity, TCreateInput, TUpdateInput, TResult, TWhereClause } from './types'

/**
 * @example
 * ```typescript
 * const result = await crud.create<User>('users')({ name: 'John' })
 * const users = await crud.read<User>('users')()
 * const activeUsers = await crud.read<User>('users').where({ status: 'active' }).execute()
 * ```
 */
export const crud = {
  create<T extends TEntity>(tableName: string) {
    return (data: TCreateInput<T>): Promise<TResult<T[]>> => {
      return safeExecute(async () => {
        const db = getDb()
        const schema = getSchema()
        validateTableName(tableName, schema)
        return await db.insert(schema[tableName]).values(data).returning()
      })
    }
  },

  read<T extends TEntity>(tableName: string) {
    let whereConditions: any[] = []
    
    const queryBuilder = {
      where(condition: TWhereClause<T>) {
        const { buildWhereConditions } = require('./core/where')
        const db = getDb()
        const schema = getSchema()
        validateTableName(tableName, schema)
        const table = schema[tableName]
        
        const newCondition = buildWhereConditions(condition, table)
        if (newCondition) {
          whereConditions.push(newCondition)
        }
        return queryBuilder
      },
      
      async execute(): Promise<TResult<T[]>> {
        return safeExecute(async () => {
          const db = getDb()
          const schema = getSchema()
          validateTableName(tableName, schema)
          const table = schema[tableName]
          
          let query = db.select().from(table)
          
          if (whereConditions.length > 0) {
            query = query.where(and(...whereConditions))
          }
          
          return await query as T[]
        })
      },
      
      byId(id: string | number): Promise<TResult<T | null>> {
        return safeExecute(async () => {
          const db = getDb()
          const schema = getSchema()
          validateTableName(tableName, schema)
          const table = schema[tableName]
          
          const result = await db.select().from(table).where(eq(table.id, id)).limit(1) as T[]
          return result[0] || null
        })
      }
    }
    
    // Make it callable directly (returns all records)
    const callable = async (): Promise<TResult<T[]>> => {
      return safeExecute(async () => {
        const db = getDb()
        const schema = getSchema()
        validateTableName(tableName, schema)
        const table = schema[tableName]
        
        return await db.select().from(table) as T[]
      })
    }
    
    // Merge callable with methods
    return Object.assign(callable, queryBuilder)
  },

  update<T extends TEntity>(tableName: string) {
    return (id: string | number, data: TUpdateInput<T>): Promise<TResult<T[]>> => {
      return safeExecute(async () => {
        const db = getDb()
        const schema = getSchema()
        validateTableName(tableName, schema)
        return await db.update(schema[tableName]).set(data).where(eq(schema[tableName].id, id)).returning()
      })
    }
  },

  destroy<T extends TEntity>(tableName: string) {
    return (id: string | number): Promise<TResult<T[]>> => {
      return safeExecute(async () => {
        const db = getDb()
        const schema = getSchema()
        validateTableName(tableName, schema)
        return await db.destroy(schema[tableName]).where(eq(schema[tableName].id, id)).returning() as T[]
      })
    }
  }
} as const