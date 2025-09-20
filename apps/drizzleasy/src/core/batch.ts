import { getDb, getOptions } from '../config'
import { generateId, isNumericIdField } from '../utils/id-generator'
import { safeExecute } from './execute'
import { eq } from 'drizzle-orm'

/**
 * Result type for batch operations
 */
export type TBatchResult<T> = {
    /** Successfully processed records */
    data: T[]
    /** Errors that occurred during batch operation */
    errors: Array<{
        /** Index in original array where error occurred */
        index: number
        /** The error that occurred */
        error: Error
        /** The data that failed to process */
        failedData?: any
    }>
    /** True if some operations succeeded and some failed */
    partialSuccess: boolean
    /** Metadata about the batch operation */
    meta: {
        /** Total number of items processed */
        total: number
        /** Number of successful operations */
        successful: number
        /** Number of failed operations */
        failed: number
        /** Time taken for the batch operation in milliseconds */
        duration: number
    }
}

/**
 * Options for batch operations
 */
export type TBatchOptions = {
    /** Whether to wrap in transaction (default: true) */
    transaction?: boolean
    /** How to handle individual failures */
    failureMode?: 'abort' | 'continue' | 'rollback'
    /** Batch size for large datasets */
    chunkSize?: number
    /** Whether to stop on first error */
    stopOnError?: boolean
}

/**
 * Batch operations for table-first CRUD
 * 
 * @example
 * ```typescript
 * import { batch } from '@remcostoeten/drizzleasy/server'
 * import { schema } from './schema'
 * 
 * // Batch create
 * const { data, errors } = await batch.create(schema.users)([
 *   { name: 'John', email: 'john@example.com' },
 *   { name: 'Jane', email: 'jane@example.com' }
 * ])
 * 
 * // Batch update
 * const { data } = await batch.update(schema.users)([
 *   { id: 'user1', data: { name: 'Updated John' } },
 *   { id: 'user2', data: { email: 'newemail@example.com' } }
 * ])
 * 
 * // Batch delete
 * const { data } = await batch.destroy(schema.users)(['user1', 'user2', 'user3'])
 * ```
 */
export const batch = {
    /**
     * Create multiple records in a single operation
     */
    create<TTable extends Record<string, any>>(
        table: TTable,
        options: TBatchOptions = {}
    ) {
        type TInsert = typeof table.$inferInsert
        type TSelect = typeof table.$inferSelect
        
        return async function (
            items: Array<Omit<TInsert, 'id' | 'createdAt' | 'updatedAt'> & { id?: TInsert['id'] }>
        ): Promise<TBatchResult<TSelect>> {
            const startTime = Date.now()
            const {
                transaction = true,
                failureMode = 'continue',
                chunkSize = 100,
                stopOnError = false
            } = options
            
            const results: TSelect[] = []
            const errors: TBatchResult<TSelect>['errors'] = []
            
            const db = getDb()
            const idOptions = getOptions().id
            const tableName = (table as any).constructor?.name || 'table'
            const idField = (table as any).id
            const isNumericId = idField && isNumericIdField(idField)
            
            async function processItems(items: typeof items) {
                for (let i = 0; i < items.length; i += chunkSize) {
                    const chunk = items.slice(i, i + chunkSize)
                    
                    for (let j = 0; j < chunk.length; j++) {
                        const itemIndex = i + j
                        const item = chunk[j]
                        
                        try {
                            let insertData: any = { ...item }
                            
                            // Handle ID generation
                            if (!('id' in insertData) || insertData.id === undefined) {
                                if (!isNumericId) {
                                    const idStrategy = idOptions?.tables?.[tableName] || 
                                                     idOptions?.default || 
                                                     'nanoid'
                                    insertData.id = generateId(idStrategy, tableName)
                                }
                            }
                            
                            // Handle timestamps
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
                            
                            results.push(...(result as TSelect[]))
                        } catch (error) {
                            errors.push({
                                index: itemIndex,
                                error: error instanceof Error ? error : new Error(String(error)),
                                failedData: item
                            })
                            
                            if (stopOnError || failureMode === 'abort') {
                                throw error
                            }
                        }
                    }
                }
            }
            
            if (transaction && failureMode !== 'continue') {
                try {
                    await (db as any).transaction(async (tx: any) => {
                        // Replace db with tx for the transaction
                        const originalDb = db
                        Object.assign(db, tx)
                        await processItems(items)
                        Object.assign(db, originalDb)
                    })
                } catch (error) {
                    if (failureMode === 'rollback') {
                        // Transaction will auto-rollback
                        return {
                            data: [],
                            errors: [{
                                index: 0,
                                error: error instanceof Error ? error : new Error(String(error)),
                                failedData: items
                            }],
                            partialSuccess: false,
                            meta: {
                                total: items.length,
                                successful: 0,
                                failed: items.length,
                                duration: Date.now() - startTime
                            }
                        }
                    }
                    throw error
                }
            } else {
                await processItems(items)
            }
            
            return {
                data: results,
                errors,
                partialSuccess: errors.length > 0 && results.length > 0,
                meta: {
                    total: items.length,
                    successful: results.length,
                    failed: errors.length,
                    duration: Date.now() - startTime
                }
            }
        }
    },
    
    /**
     * Update multiple records in a single operation
     */
    update<TTable extends Record<string, any>>(
        table: TTable,
        options: TBatchOptions = {}
    ) {
        type TInsert = typeof table.$inferInsert
        type TSelect = typeof table.$inferSelect
        
        return async function (
            updates: Array<{
                id: string | number
                data: Partial<Omit<TInsert, 'id' | 'createdAt'>>
            }>
        ): Promise<TBatchResult<TSelect>> {
            const startTime = Date.now()
            const {
                transaction = true,
                failureMode = 'continue',
                stopOnError = false
            } = options
            
            const results: TSelect[] = []
            const errors: TBatchResult<TSelect>['errors'] = []
            const db = getDb()
            
            async function processUpdates() {
                for (let i = 0; i < updates.length; i++) {
                    const { id, data } = updates[i]
                    
                    try {
                        const updateData: any = { ...data }
                        
                        // Update timestamp
                        if ('updatedAt' in (table as any)) {
                            updateData.updatedAt = new Date()
                        }
                        
                        const result = await db
                            .update(table)
                            .set(updateData)
                            .where(eq(table.id, id))
                            .returning()
                        
                        if (result.length > 0) {
                            results.push(...(result as TSelect[]))
                        } else {
                            throw new Error(`Record with id ${id} not found`)
                        }
                    } catch (error) {
                        errors.push({
                            index: i,
                            error: error instanceof Error ? error : new Error(String(error)),
                            failedData: updates[i]
                        })
                        
                        if (stopOnError || failureMode === 'abort') {
                            throw error
                        }
                    }
                }
            }
            
            if (transaction && failureMode !== 'continue') {
                try {
                    await (db as any).transaction(async (tx: any) => {
                        const originalDb = db
                        Object.assign(db, tx)
                        await processUpdates()
                        Object.assign(db, originalDb)
                    })
                } catch (error) {
                    if (failureMode === 'rollback') {
                        return {
                            data: [],
                            errors: [{
                                index: 0,
                                error: error instanceof Error ? error : new Error(String(error)),
                                failedData: updates
                            }],
                            partialSuccess: false,
                            meta: {
                                total: updates.length,
                                successful: 0,
                                failed: updates.length,
                                duration: Date.now() - startTime
                            }
                        }
                    }
                    throw error
                }
            } else {
                await processUpdates()
            }
            
            return {
                data: results,
                errors,
                partialSuccess: errors.length > 0 && results.length > 0,
                meta: {
                    total: updates.length,
                    successful: results.length,
                    failed: errors.length,
                    duration: Date.now() - startTime
                }
            }
        }
    },
    
    /**
     * Delete multiple records in a single operation
     */
    destroy<TTable extends Record<string, any>>(
        table: TTable,
        options: TBatchOptions = {}
    ) {
        type TSelect = typeof table.$inferSelect
        
        return async function (
            ids: Array<string | number>
        ): Promise<TBatchResult<TSelect>> {
            const startTime = Date.now()
            const {
                transaction = true,
                failureMode = 'continue',
                stopOnError = false
            } = options
            
            const results: TSelect[] = []
            const errors: TBatchResult<TSelect>['errors'] = []
            const db = getDb()
            
            async function processDeletes() {
                for (let i = 0; i < ids.length; i++) {
                    const id = ids[i]
                    
                    try {
                        const result = await db
                            .delete(table)
                            .where(eq(table.id, id))
                            .returning()
                        
                        if (result.length > 0) {
                            results.push(...(result as TSelect[]))
                        } else {
                            throw new Error(`Record with id ${id} not found`)
                        }
                    } catch (error) {
                        errors.push({
                            index: i,
                            error: error instanceof Error ? error : new Error(String(error)),
                            failedData: id
                        })
                        
                        if (stopOnError || failureMode === 'abort') {
                            throw error
                        }
                    }
                }
            }
            
            if (transaction && failureMode !== 'continue') {
                try {
                    await (db as any).transaction(async (tx: any) => {
                        const originalDb = db
                        Object.assign(db, tx)
                        await processDeletes()
                        Object.assign(db, originalDb)
                    })
                } catch (error) {
                    if (failureMode === 'rollback') {
                        return {
                            data: [],
                            errors: [{
                                index: 0,
                                error: error instanceof Error ? error : new Error(String(error)),
                                failedData: ids
                            }],
                            partialSuccess: false,
                            meta: {
                                total: ids.length,
                                successful: 0,
                                failed: ids.length,
                                duration: Date.now() - startTime
                            }
                        }
                    }
                    throw error
                }
            } else {
                await processDeletes()
            }
            
            return {
                data: results,
                errors,
                partialSuccess: errors.length > 0 && results.length > 0,
                meta: {
                    total: ids.length,
                    successful: results.length,
                    failed: errors.length,
                    duration: Date.now() - startTime
                }
            }
        }
    }
}