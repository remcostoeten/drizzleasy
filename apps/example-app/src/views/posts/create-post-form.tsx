'use client'

import { useState } from 'react'
import { createPost } from '@/modules/posts/api/mutations'
import { Button, Input } from '@/shared/components/ui'
import type { NewPost } from '@/modules/posts/models/z.post'
import type { User } from '@/modules/users/models/z.user'

type TProps = {
  users: User[]
}

function CreatePostForm({ users }: TProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [authorId, setAuthorId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!title.trim() || !authorId) {
      setError('Title and author are required')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    const newPost: NewPost = {
      title: title.trim(),
      content: content.trim() || undefined,
      authorId
    }
    
    try {
      const result = await createPost(newPost)
      
      if (result.error) {
        setError(result.error.message)
      } else {
        setTitle('')
        setContent('')
        setAuthorId('')
      }
    } catch (err) {
      setError('Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        placeholder="Enter post title"
        value={title}
        onChange={setTitle}
        error={error}
        disabled={isSubmitting}
      />
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-200">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post content..."
          rows={4}
          className="flex w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-200">Author</label>
        <select
          value={authorId}
          onChange={(e) => setAuthorId(e.target.value)}
          className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
          disabled={isSubmitting}
        >
          <option value="">Select an author</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
      
      <Button
        type="submit"
        loading={isSubmitting}
        disabled={!title.trim() || !authorId || isSubmitting}
        className="w-full"
      >
        Create Post
      </Button>
    </form>
  )
}

export { CreatePostForm }
