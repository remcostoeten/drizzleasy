import type { TDatabase, TSchema } from './types'

let db: TDatabase | null = null
let schema: TSchema | null = null

function configure<T extends TDatabase, S extends TSchema>(
  database: T, 
  schemaObj: S
) {
  db = database
  schema = schemaObj
}

function getDb(): TDatabase {
  if (!db) {
    throw new Error('Database not configured')
  }
  return db
}

function getSchema(): TSchema {
  if (!schema) {
    throw new Error('Schema not configured')
  }
  return schema
}

function validateTableName(tableName: string, schema: TSchema): void {
  if (!schema[tableName]) {
    throw new Error(`Table '${tableName}' not found in schema`)
  }
}

export { configure, getDb, getSchema, validateTableName }
