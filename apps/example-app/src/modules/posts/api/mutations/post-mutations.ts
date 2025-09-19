'use server'

import { db } from '@/server/db'
import { posts } from '@/server/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { nanoid } from 'nanoid'
import type { Post, NewPost } from '../../models/z.post'

async function createPost(data: NewPost) {
  try {
    const newPost = {
      id: nanoid(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.insert(posts).values(newPost).returning()
    revalidatePath('/posts')
    
    return { data: result, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to create post' } }
  }
}

async function updatePost(id: string, data: Partial<Post>) {
  try {
    const result = await db.update(posts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning()
    
    revalidatePath('/posts')
    return { data: result, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to update post' } }
  }
}

async function deletePost(id: string) {
  try {
    const result = await db.delete(posts).where(eq(posts.id, id)).returning()
    revalidatePath('/posts')
    return { data: result, error: null }
  } catch (error) {
    return { data: null, error: { message: 'Failed to delete post' } }
  }
}

export { createPost, updatePost, deletePost }