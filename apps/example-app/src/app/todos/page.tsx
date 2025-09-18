import { getTodosAction } from '@/actions/todos'
import { TodoList } from '@/components/TodoList'

export default async function TodosPage() {
    const { data: todos } = await getTodosAction()

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Todo App</h1>
            <TodoList initialTodos={todos || []} />
        </div>
    )
}
