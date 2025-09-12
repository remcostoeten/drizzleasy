import { eq } from 'drizzle-orm'
import { getDb, getSchema, validateTableName } from './config'
import { safeExecute } from './core/execute'
import type { TEntity, TCreateInput, TUpdateInput, TResult } from './types'

/**
 * @example
 * ```typescript
 * const result = await crud.create('users')({ name: 'John' })
 * const users = await crud.read('users').all()
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
    const base = {
      all(): Promise<TResult<T[]>> {
        return safeExecute(async () => {
          const db = getDb()
          const schema = getSchema()
          validateTableName(tableName, schema)
          return await db.select().from(schema[tableName]) as T[]
        })
      },
      
      byId(id: string | number): Promise<TResult<T | null>> {
        return safeExecute(async () => {
          const db = getDb()
          const schema = getSchema()
          validateTableName(tableName, schema)
          const result = await db.select().from(schema[tableName]).where(eq(schema[tableName].id, id)).limit(1) as T[]
          return result[0] || null
        })
      }
    }
    return Object.assign(base.all, base)
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

  delete<T extends TEntity>(tableName: string) {
    return (id: string | number): Promise<TResult<T[]>> => {
      return safeExecute(async () => {
        const db = getDb()
        const schema = getSchema()
        validateTableName(tableName, schema)
        return await db.delete(schema[tableName]).where(eq(schema[tableName].id, id)).returning() as T[]
      })
    }
  }
} as const