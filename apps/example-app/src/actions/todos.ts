// 'use server'
// import { createTodo, readTodos, updateTodo, destroyTodo } from '@/lib/crud'
// import { revalidatePath } from 'next/cache'
// import type { Todo } from '@/server/schema'

// export async function createTodoAction(data: { title: string; description?: string }) {
//     const result = await createTodo('todos')({
//         id: crypto.randomUUID(),
//         ...data
//     })

//     if (!result.error) {
//         revalidatePath('/todos')
//     }

//     return result
// }

// export async function updateTodoAction(id: string, data: Partial<Todo>) {
//     const result = await updateTodo('todos')(id, data)

//     if (!result.error) {
//         revalidatePath('/todos')
//     }

//     return result
// }

// export async function destroyTodoAction(id: string) {
//     const result = await destroyTodo('todos')(id)

//     if (!result.error) {
//         revalidatePath('/todos')
//     }

//     return result
// }

// export async function getTodosAction() {
//     return await readTodos('todos')()
// }
