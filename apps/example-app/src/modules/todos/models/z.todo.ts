import { z } from 'zod'

const todoSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  completed: z.boolean().nullable().default(false),
  priority: z.enum(['low', 'medium', 'high']).nullable().default('medium'),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional()
})

const newTodoSchema = todoSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
})

type Todo = z.infer<typeof todoSchema>
type NewTodo = z.infer<typeof newTodoSchema>

export { todoSchema, newTodoSchema }
export type { Todo, NewTodo }
