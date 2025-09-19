'use server'

import { db } from '@/server/db'
import { posts } from '@/server/schema'
import { eq } from 'drizzle-orm'

async function getPosts() {
  try {
    const data = await db.select().from(posts)
    return { data, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to fetch posts' } }
  }
}

async function getPostById(id: string) {
  try {
    const data = await db.select().from(posts).where(eq(posts.id, id))
    return { data: data[0] || null, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to fetch post' } }
  }
}

async function getPostsByAuthor(authorId: string) {
  try {
    const data = await db.select().from(posts).where(eq(posts.authorId, authorId))
    return { data, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to fetch posts' } }
  }
}

export { getPosts, getPostById, getPostsByAuthor }