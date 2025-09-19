import { TodoManager } from './todo-manager'
import { getTodos } from '@/modules/todos/api/queries'

async function TodosView() {
  const { data: todos = [] } = await getTodos()
  
  return <TodoManager initialTodos={todos || []} />
}

export { TodosView }
