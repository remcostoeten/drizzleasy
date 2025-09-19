import { z } from 'zod'

const postSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().nullable().optional(),
  authorId: z.string().nullable(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional()
})

const newPostSchema = postSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
})

type Post = z.infer<typeof postSchema>
type NewPost = z.infer<typeof newPostSchema>

export { postSchema, newPostSchema }
export type { Post, NewPost }
