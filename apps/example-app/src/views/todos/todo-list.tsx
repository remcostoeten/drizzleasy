'use client'

import { useState } from 'react'
import { toggleTodo, deleteTodo } from '@/modules/todos/api/mutations'
import { Button, Badge, Modal, Spinner } from '@/shared/components/ui'
import type { Todo } from '@/modules/todos/models/z.todo'

type TProps = {
  todos: Todo[]
  onTodoUpdated: (todo: Todo) => void
  onTodoDeleted: (todoId: string) => void
}

function TodoList({ todos, onTodoUpdated, onTodoDeleted }: TProps) {
  const [isPending, setIsPending] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null)
  
  async function handleToggle(id: string, completed: boolean) {
    setIsPending(true)
    const result = await toggleTodo(id, !completed)
    
    if (!result.error && result.data) {
      const updatedTodo = { ...todos.find(t => t.id === id)!, completed: !completed }
      onTodoUpdated(updatedTodo)
    }
    setIsPending(false)
  }
  
  function handleDeleteClick(todo: Todo) {
    setTodoToDelete(todo)
    setDeleteModalOpen(true)
  }
  
  async function confirmDelete() {
    if (todoToDelete) {
      const result = await deleteTodo(todoToDelete.id)
      
      if (!result.error) {
        onTodoDeleted(todoToDelete.id)
        setDeleteModalOpen(false)
        setTodoToDelete(null)
      }
    }
  }
  
  if (isPending) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="lg" />
      </div>
    )
  }
  
  if (todos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-lg">No todos yet</p>
        <p className="text-sm">Create your first todo to get started</p>
      </div>
    )
  }
  
  return (
    <>
      <div className="space-y-3">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
              todo.completed 
                ? 'bg-gray-800/50 border-gray-700 opacity-75' 
                : 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-md'
            }`}
          >
            <input
              type="checkbox"
              checked={todo.completed || false}
              onChange={() => handleToggle(todo.id, todo.completed || false)}
              className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-white focus:ring-white focus:ring-offset-gray-900"
            />
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                {todo.title}
              </h3>
              {todo.description && (
                <p className={`text-sm mt-1 ${todo.completed ? 'text-gray-500' : 'text-gray-300'}`}>
                  {todo.description}
                </p>
              )}
            </div>
            
            <Badge 
              variant={
                todo.priority === 'high' ? 'danger' : 
                todo.priority === 'medium' ? 'warning' : 
                'default'
              }
            >
              {todo.priority || 'medium'}
            </Badge>
            
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteClick(todo)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
      
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Todo"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete &quot;{todoToDelete?.title}&quot;? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export { TodoList }
