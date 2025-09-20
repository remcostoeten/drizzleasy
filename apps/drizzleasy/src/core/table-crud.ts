import { eq, and, gt, gte, lt, lte, ne, inArray, like } from 'drizzle-orm'
import { getDb, getOptions } from '../config'
import { safeExecute } from './execute'
import { generateId, isNumericIdField } from '../utils/id-generator'
import type { TResult } from '../types/operations'

/**
 * Table-first CRUD operations with zero-generics type inference.
 * 
 * Pass your Drizzle table object to get fully typed CRUD operations
 * without writing any generics.
 * 
 * @example
 * ```typescript
 * import { crud } from '@remcostoeten/drizzleasy'
 * import { schema } from './schema'
 * 
 * // Create - types inferred from table
 * const { data } = await crud.create(schema.users)({
 *   name: 'John',
 *   email: 'john@example.com'
 * })
 * 
 * // Read - returns typed array
 * const { data: users } = await crud.read(schema.users)()
 * 
 * // Update
 * await crud.update(schema.users)('user-id', { name: 'Jane' })
 * 
 * // Delete
 * await crud.destroy(schema.users)('user-id')
 * ```
 */
export const tableCrud = {
    /**
     * Create a new record with automatic ID generation.
     * 
     * @param table - The Drizzle table object
     * @returns Function that accepts data (with optional id) and returns created record
     */
    create<TTable extends Record<string, any>>(table: TTable) {
        type TInsert = typeof table.$inferInsert
        type TSelect = typeof table.$inferSelect
        
        return async function (
            data: Omit<TInsert, 'id' | 'createdAt' | 'updatedAt'> & { id?: TInsert['id'] }
        ): Promise<TResult<TSelect[]>> {
            return safeExecute(async () => {
                const db = getDb()
                const options = getOptions()
                const tableName = (table as any).constructor.name || 'table'
                
                let insertData: any = { ...data }
                
                // Handle ID generation
                if (!('id' in insertData) || insertData.id === undefined) {
                    // Check if this is a numeric/serial field
                    const idField = (table as any).id
                    
                    if (idField && !isNumericIdField(idField)) {
                        // Text-based ID, generate one
                        const idStrategy = options.id?.tables?.[tableName] || 
                                         options.id?.default || 
                                         'nanoid'
                        insertData.id = generateId(idStrategy, tableName)
                    }
                    // For numeric fields, let the database handle it (auto-increment)
                }
                
                // Handle timestamps if they exist in the schema
                const now = new Date()
                if ('createdAt' in (table as any)) {
                    insertData.createdAt = now
                }
                if ('updatedAt' in (table as any)) {
                    insertData.updatedAt = now
                }
                
                const result = await db
                    .insert(table)
                    .values(insertData)
                    .returning()
                
                return result as TSelect[]
            })
        }
    },
    
    /**
     * Read records with optional filtering.
     * 
     * @param table - The Drizzle table object
     * @returns Query builder with where/byId methods
     */
    read<TTable extends Record<string, any>>(table: TTable) {
        type TSelect = typeof table.$inferSelect
        
        let whereConditions: any[] = []
        
        const queryBuilder = {
            /**
             * Add WHERE conditions to the query
             */
            where(condition: Partial<TSelect> | Record<string, any>) {
                const { buildWhereConditions } = require('./where')
                const newCondition = buildWhereConditions(condition, table)
                if (newCondition) {
                    whereConditions.push(newCondition)
                }
                return Object.assign(callable, queryBuilder)
            },
            
            /**
             * Find a single record by ID
             */
            async byId(id: string | number): Promise<TResult<TSelect | null>> {
                return safeExecute(async () => {
                    const db = getDb()
                    const result = await db
                        .select()
                        .from(table)
                        .where(eq(table.id, id))
                        .limit(1)
                    
                    return (result[0] as TSelect) || null
                })
            },
            
            /**
             * Pagination support - limit results
             */
            limit(count: number) {
                const newBuilder = { ...queryBuilder, _limit: count }
                return Object.assign(callable, newBuilder)
            },
            
            /**
             * Pagination support - offset results
             */
            offset(count: number) {
                const newBuilder = { ...queryBuilder, _offset: count }
                return Object.assign(callable, newBuilder)
            },
            
            /**
             * Order results by field
             */
            orderBy(field: keyof TSelect, direction: 'asc' | 'desc' = 'asc') {
                const newBuilder = { ...queryBuilder, _orderBy: { field, direction } }
                return Object.assign(callable, newBuilder)
            }
        }
        
        // Make it callable to execute the query
        const callable = async (): Promise<TResult<TSelect[]>> => {
            return safeExecute(async () => {
                const db = getDb()
                let query = db.select().from(table)
                
                if (whereConditions.length > 0) {
                    query = query.where(and(...whereConditions))
                }
                
                // Apply ordering if specified
                if ((queryBuilder as any)._orderBy) {
                    const { field, direction } = (queryBuilder as any)._orderBy
                    const column = table[field as string]
                    if (column) {
                        query = direction === 'desc' 
                            ? query.orderBy(column.desc())
                            : query.orderBy(column)
                    }
                }
                
                // Apply limit if specified
                if ((queryBuilder as any)._limit) {
                    query = query.limit((queryBuilder as any)._limit)
                }
                
                // Apply offset if specified
                if ((queryBuilder as any)._offset) {
                    query = query.offset((queryBuilder as any)._offset)
                }
                
                return await query as TSelect[]
            })
        }
        
        return Object.assign(callable, queryBuilder)
    },
    
    /**
     * Update an existing record by ID.
     * 
     * @param table - The Drizzle table object
     * @returns Function that accepts ID and update data
     */
    update<TTable extends Record<string, any>>(table: TTable) {
        type TInsert = typeof table.$inferInsert
        type TSelect = typeof table.$inferSelect
        
        return async function (
            id: string | number,
            data: Partial<Omit<TInsert, 'id' | 'createdAt'>>
        ): Promise<TResult<TSelect[]>> {
            return safeExecute(async () => {
                const db = getDb()
                
                const updateData: any = { ...data }
                
                // Update the updatedAt timestamp if it exists
                if ('updatedAt' in (table as any)) {
                    updateData.updatedAt = new Date()
                }
                
                const result = await db
                    .update(table)
                    .set(updateData)
                    .where(eq(table.id, id))
                    .returning()
                
                return result as TSelect[]
            })
        }
    },
    
    /**
     * Delete a record by ID.
     * 
     * @param table - The Drizzle table object
     * @returns Function that accepts ID and returns deleted record
     */
    destroy<TTable extends Record<string, any>>(table: TTable) {
        type TSelect = typeof table.$inferSelect
        
        return async function (id: string | number): Promise<TResult<TSelect[]>> {
            return safeExecute(async () => {
                const db = getDb()
                const result = await db
                    .delete(table)
                    .where(eq(table.id, id))
                    .returning()
                
                return result as TSelect[]
            })
        }
    }
}