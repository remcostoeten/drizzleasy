'use client'

import { useState } from 'react'
import { TodoList } from './todo-list'
import { CreateTodoForm } from './create-todo-form'
import { Card } from '@/shared/components/ui'
import type { Todo } from '@/modules/todos/models/z.todo'

type TProps = {
  initialTodos: Todo[]
}

function TodoManager({ initialTodos }: TProps) {
  const [todos, setTodos] = useState(initialTodos)
  
  function handleTodoCreated(newTodo: Todo) {
    setTodos(prev => [...prev, newTodo])
  }
  
  function handleTodoUpdated(updatedTodo: Todo) {
    setTodos(prev => prev.map(todo => 
      todo.id === updatedTodo.id ? updatedTodo : todo
    ))
  }
  
  function handleTodoDeleted(todoId: string) {
    setTodos(prev => prev.filter(todo => todo.id !== todoId))
  }
  
  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Todo Manager</h1>
            <p className="text-gray-400 text-lg">Built with Drizzleasy & Next.js</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <h2 className="text-xl font-semibold mb-4">Create New Todo</h2>
                <CreateTodoForm onTodoCreated={handleTodoCreated} />
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <h2 className="text-xl font-semibold mb-4">Your Todos ({todos.length})</h2>
                <TodoList 
                  todos={todos}
                  onTodoUpdated={handleTodoUpdated}
                  onTodoDeleted={handleTodoDeleted}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { TodoManager }
