'use client'
import { useOptimisticCrud } from '@remcostoeten/drizzleasy'
import { createTodoAction, updateTodoAction, destroyTodoAction } from '@/actions/todos'
import type { Todo } from '@/server/schema'

interface TodoListProps {
    initialTodos: Todo[]
}

export function TodoList({ initialTodos }: TodoListProps) {
    const { data: todos, isPending, optimisticCreate } = useOptimisticCrud(initialTodos)

    const handleCreate = async (formData: FormData) => {
        const title = formData.get('title') as string
        const description = formData.get('description') as string

        optimisticCreate(
            { title, description, completed: false, priority: 'medium' },
            () => createTodoAction({ title, description })
        )
    }

    const handleToggle = async (todo: Todo) => {
        await updateTodoAction(todo.id, { completed: !todo.completed })
    }

    const handleDestroy = async (id: string) => {
        await destroyTodoAction(id)
    }

    return (
        <div>
            <form action={handleCreate} className="mb-4 space-y-4">
                <div>
                    <input 
                        name="title" 
                        placeholder="Todo title" 
                        required 
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <input 
                        name="description" 
                        placeholder="Description" 
                        className="w-full p-2 border rounded"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isPending}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    {isPending ? 'Adding...' : 'Add Todo'}
                </button>
            </form>

            <div className="space-y-2">
                {todos.map(todo => (
                    <div key={todo.id} className="flex items-center gap-2 p-2 border rounded">
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => handleToggle(todo)}
                        />
                        <span className={todo.completed ? 'line-through' : ''}>
                            {todo.title}
                        </span>
                        {todo.description && (
                            <span className="text-gray-500 text-sm">
                                - {todo.description}
                            </span>
                        )}
                        <button 
                            onClick={() => handleDestroy(todo.id)}
                            className="ml-auto px-2 py-1 bg-red-500 text-white text-sm rounded"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
