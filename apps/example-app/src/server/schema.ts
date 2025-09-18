import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const todos = pgTable('todos', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    completed: boolean('completed').default(false),
    priority: text('priority').$type<'low' | 'medium' | 'high'>().default('medium'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
})

export const users = pgTable('users', {
    id: text('id').primaryKey(),
    email: text('email').unique().notNull(),
    name: text('name').notNull(),
    avatar: text('avatar'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
})

export const posts = pgTable('posts', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content'),
    authorId: text('author_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
})

export const usersRelations = relations(users, ({ many }) => ({
    posts: many(posts)
}))

export const postsRelations = relations(posts, ({ one }) => ({
    author: one(users, { fields: [posts.authorId], references: [users.id] })
}))

export type Todo = typeof todos.$inferSelect
export type NewTodo = typeof todos.$inferInsert

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
