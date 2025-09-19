'use client'

import { useState } from 'react'
import { createTodo } from '@/modules/todos/api/mutations'
import { Button, Input } from '@/shared/components/ui'
import type { NewTodo, Todo } from '@/modules/todos/models/z.todo'

type TProps = {
  onTodoCreated: (todo: Todo) => void
}

function CreateTodoForm({ onTodoCreated }: TProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    const newTodo: NewTodo = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      completed: false
    }
    
    try {
      const result = await createTodo(newTodo)
      
      if (result.error) {
        setError(result.error.message)
      } else if (result.data && result.data[0]) {
        onTodoCreated(result.data[0])
        setTitle('')
        setDescription('')
        setPriority('medium')
      }
    } catch (err) {
      setError('Failed to create todo')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        placeholder="What needs to be done?"
        value={title}
        onChange={setTitle}
        error={error}
        disabled={isSubmitting}
      />
      
      <Input
        label="Description (optional)"
        placeholder="Add more details..."
        value={description}
        onChange={setDescription}
        disabled={isSubmitting}
      />
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-200">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
          disabled={isSubmitting}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      
      <Button
        type="submit"
        loading={isSubmitting}
        disabled={!title.trim() || isSubmitting}
        className="w-full"
      >
        Create Todo
      </Button>
    </form>
  )
}

export { CreateTodoForm }
