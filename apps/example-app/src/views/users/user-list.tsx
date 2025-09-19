'use client'

import { useState } from 'react'
import Image from 'next/image'
import { toggleUserStatus, deleteUser } from '@/modules/users/api/mutations'
import { Button, Badge, Modal } from '@/shared/components/ui'
import type { User } from '@/modules/users/models/z.user'

type TProps = {
  initialUsers: User[]
}

function UserList({ initialUsers }: TProps) {
  const [users, setUsers] = useState(initialUsers)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  
  async function handleToggleStatus(id: string, isActive: boolean) {
    const result = await toggleUserStatus(id, !isActive)
    
    if (!result.error && result.data) {
      setUsers(users.map(user => 
        user.id === id ? { ...user, isActive: !isActive } : user
      ))
    }
  }
  
  function handleDeleteClick(user: User) {
    setUserToDelete(user)
    setDeleteModalOpen(true)
  }
  
  async function confirmDelete() {
    if (userToDelete) {
      const result = await deleteUser(userToDelete.id)
      
      if (!result.error) {
        setUsers(users.filter(user => user.id !== userToDelete.id))
        setDeleteModalOpen(false)
        setUserToDelete(null)
      }
    }
  }
  
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-lg">No users yet</p>
        <p className="text-sm">Create your first user to get started</p>
      </div>
    )
  }
  
  return (
    <>
      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
              user.isActive 
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                : 'bg-gray-800/50 border-gray-700 opacity-75'
            }`}
          >
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <Image 
                  src={user.avatar} 
                  alt={user.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-300 font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium ${!user.isActive ? 'text-gray-400' : 'text-white'}`}>
                {user.name}
              </h3>
              <p className={`text-sm ${!user.isActive ? 'text-gray-500' : 'text-gray-300'}`}>
                {user.email}
              </p>
            </div>
            
            <Badge 
              variant={user.isActive ? 'success' : 'default'}
            >
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
            
            <Button
              variant={user.isActive ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => handleToggleStatus(user.id, user.isActive || false)}
            >
              {user.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteClick(user)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
      
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete &quot;{userToDelete?.name}&quot;? This action cannot be undone.
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

export { UserList }
