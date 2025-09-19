'use client'

import { useState } from 'react'
import { createUser } from '@/modules/users/api/mutations'
import { Button, Input } from '@/shared/components/ui'
import type { NewUser } from '@/modules/users/models/z.user'

function CreateUserForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    const newUser: NewUser = {
      name: name.trim(),
      email: email.trim(),
      avatar: avatar.trim() || undefined,
      isActive: true
    }
    
    try {
      const result = await createUser(newUser)
      
      if (result.error) {
        setError(result.error.message)
      } else {
        setName('')
        setEmail('')
        setAvatar('')
      }
    } catch (err) {
      setError('Failed to create user')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        placeholder="Enter full name"
        value={name}
        onChange={setName}
        error={error}
        disabled={isSubmitting}
      />
      
      <Input
        label="Email"
        type="email"
        placeholder="Enter email address"
        value={email}
        onChange={setEmail}
        disabled={isSubmitting}
      />
      
      <Input
        label="Avatar URL (optional)"
        placeholder="https://example.com/avatar.jpg"
        value={avatar}
        onChange={setAvatar}
        disabled={isSubmitting}
      />
      
      <Button
        type="submit"
        loading={isSubmitting}
        disabled={!name.trim() || !email.trim() || isSubmitting}
        className="w-full"
      >
        Create User
      </Button>
    </form>
  )
}

export { CreateUserForm }
