import { createFn, readFn, updateFn, destroyFn } from '@remcostoeten/drizzleasy'
import type { User, Post, Todo } from '@/server/schema'

// Create typed CRUD functions for Users
export const createUser = createFn<User>()
export const readUsers = readFn<User>()
export const updateUser = updateFn<User>()
export const destroyUser = destroyFn<User>()

// Create typed CRUD functions for Posts
export const createPost = createFn<Post>()
export const readPosts = readFn<Post>()
export const updatePost = updateFn<Post>()
export const destroyPost = destroyFn<Post>()

// Create typed CRUD functions for Todos
export const createTodo = createFn<Todo>()
export const readTodos = readFn<Todo>()
export const updateTodo = updateFn<Todo>()
export const destroyTodo = destroyFn<Todo>()

// Helper functions
export async function getUserByEmail(email: string) {
    const { data: users } = await readUsers('users')()
    return users?.find(user => user.email === email) || null
}

export async function getUserPosts(userId: string) {
    const { data: posts } = await readPosts('posts')()
    return posts?.filter(post => post.authorId === userId) || []
}
