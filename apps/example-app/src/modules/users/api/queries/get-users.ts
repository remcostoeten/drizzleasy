'use server'

import { db } from '@/server/db'
import { users } from '@/server/schema'
import { eq } from 'drizzle-orm'

async function getUsers() {
  try {
    const data = await db.select().from(users)
    return { data, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to fetch users' } }
  }
}

async function getUserById(id: string) {
  try {
    const data = await db.select().from(users).where(eq(users.id, id))
    return { data: data[0] || null, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to fetch user' } }
  }
}

async function getActiveUsers() {
  try {
    const data = await db.select().from(users).where(eq(users.isActive, true))
    return { data, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to fetch users' } }
  }
}

export { getUsers, getUserById, getActiveUsers }