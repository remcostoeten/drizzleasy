'use server'

import { db } from '@/server/db'
import { todos } from '@/server/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'
import type { Todo, NewTodo } from '../../models/z.todo'

/**
 * Drizzleasy-style API demonstration
 * 
 * This shows how drizzleasy makes mutations ultra-simple:
 * 
 * Instead of:
 * ```typescript
 * const result = await db.insert(todos).values(data).returning()
 * ```
 * 
 * You can write:
 * ```typescript
 * const result = await crud.create<Todo>('todos')(data)
 * ```
 */

async function createTodo(data: NewTodo) {
    try {
        const newTodo = {
            id: nanoid(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        
        const result = await db.insert(todos).values(newTodo).returning()
        revalidatePath('/todos')
        
        return { data: result, error: null }
    } catch (error) {
        return { data: null, error: { message: 'Failed to create todo' } }
    }
}

async function updateTodo(id: string, data: Partial<Todo>) {
    try {
        const result = await db.update(todos)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(todos.id, id))
            .returning()
        
        revalidatePath('/todos')
        return { data: result, error: null }
    } catch (error) {
        return { data: null, error: { message: 'Failed to update todo' } }
    }
}

async function deleteTodo(id: string) {
    try {
        const result = await db.delete(todos).where(eq(todos.id, id)).returning()
        revalidatePath('/todos')
        return { data: result, error: null }
    } catch (error) {
        return { data: null, error: { message: 'Failed to delete todo' } }
    }
}

async function toggleTodo(id: string, completed: boolean) {
    return updateTodo(id, { completed })
}

export { createTodo, updateTodo, deleteTodo, toggleTodo }
