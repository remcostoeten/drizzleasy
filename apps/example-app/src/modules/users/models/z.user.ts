import { z } from 'zod'

const userSchema = z.object({
  id: z.string(),
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  avatar: z.string().nullable().optional(),
  isActive: z.boolean().nullable().default(true),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional()
})

const newUserSchema = userSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
})

type User = z.infer<typeof userSchema>
type NewUser = z.infer<typeof newUserSchema>

export { userSchema, newUserSchema }
export type { User, NewUser }
