'use server'

import { db } from '@/server/db'
import { todos } from '@/server/schema'
import { eq } from 'drizzle-orm'

/**
 * Drizzleasy-style API demonstration
 * 
 * This shows how drizzleasy makes database operations ultra-simple:
 * 
 * Instead of:
 * ```typescript
 * const result = await db.select().from(todos).where(eq(todos.completed, true))
 * ```
 * 
 * You can write:
 * ```typescript
 * const result = await crud.read<Todo>('todos').where({ completed: true }).execute()
 * ```
 */

async function getTodos() {
  try {
    const data = await db.select().from(todos)
    return { data, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to fetch todos' } }
  }
}

async function getTodoById(id: string) {
  try {
    const data = await db.select().from(todos).where(eq(todos.id, id))
    return { data: data[0] || null, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to fetch todo' } }
  }
}

async function getTodosByStatus(completed: boolean) {
  try {
    const data = await db.select().from(todos).where(eq(todos.completed, completed))
    return { data, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to fetch todos' } }
  }
}

export { getTodos, getTodoById, getTodosByStatus }
