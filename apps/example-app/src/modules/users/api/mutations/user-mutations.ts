'use server'

import { db } from '@/server/db'
import { users } from '@/server/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'
import type { User, NewUser } from '../../models/z.user'

async function createUser(data: NewUser) {
  try {
    const newUser = {
      id: nanoid(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.insert(users).values(newUser).returning()
    revalidatePath('/users')
    
    return { data: result, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to create user' } }
  }
}

async function updateUser(id: string, data: Partial<User>) {
  try {
    const result = await db.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    
    revalidatePath('/users')
    return { data: result, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to update user' } }
  }
}

async function deleteUser(id: string) {
  try {
    const result = await db.delete(users).where(eq(users.id, id)).returning()
    revalidatePath('/users')
    return { data: result, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to delete user' } }
  }
}

async function toggleUserStatus(id: string, isActive: boolean) {
  return updateUser(id, { isActive })
}

export { createUser, updateUser, deleteUser, toggleUserStatus }