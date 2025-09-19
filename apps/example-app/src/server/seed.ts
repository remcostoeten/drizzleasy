import { drizzle } from 'drizzle-orm/neon-http'
import { env } from './env'
import { todos, users, posts } from './schema'
import { nanoid } from 'nanoid'

const db = drizzle(env.DATABASE_URL)

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await db.delete(posts)
    await db.delete(todos)
    await db.delete(users)

    // Create sample users
    console.log('👥 Creating users...')
    const sampleUsers = [
      {
        id: nanoid(),
        email: 'john@example.com',
        name: 'John Doe',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        isActive: true
      },
      {
        id: nanoid(),
        email: 'jane@example.com',
        name: 'Jane Smith',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
        isActive: true
      },
      {
        id: nanoid(),
        email: 'bob@example.com',
        name: 'Bob Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
        isActive: false
      }
    ]

    const insertedUsers = await db.insert(users).values(sampleUsers).returning()
    console.log(`✅ Created ${insertedUsers.length} users`)

    // Create sample todos
    console.log('📝 Creating todos...')
    const sampleTodos = [
      {
        id: nanoid(),
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the new feature',
        completed: false,
        priority: 'high' as const
      },
      {
        id: nanoid(),
        title: 'Review pull requests',
        description: 'Review and merge pending pull requests',
        completed: true,
        priority: 'medium' as const
      },
      {
        id: nanoid(),
        title: 'Update dependencies',
        description: 'Update all project dependencies to latest versions',
        completed: false,
        priority: 'low' as const
      },
      {
        id: nanoid(),
        title: 'Write unit tests',
        description: 'Add unit tests for new components',
        completed: false,
        priority: 'high' as const
      },
      {
        id: nanoid(),
        title: 'Deploy to staging',
        description: 'Deploy the latest changes to staging environment',
        completed: true,
        priority: 'medium' as const
      }
    ]

    const insertedTodos = await db.insert(todos).values(sampleTodos).returning()
    console.log(`✅ Created ${insertedTodos.length} todos`)

    // Create sample posts
    console.log('📰 Creating posts...')
    const samplePosts = [
      {
        id: nanoid(),
        title: 'Getting Started with Drizzle ORM',
        content: 'Drizzle ORM is a powerful TypeScript ORM that provides excellent type safety and performance. In this post, we\'ll explore the basics of setting up Drizzle in a Next.js application.',
        authorId: insertedUsers[0].id
      },
      {
        id: nanoid(),
        title: 'Building Scalable Next.js Applications',
        content: 'Learn how to structure your Next.js applications for scalability. We\'ll cover folder organization, state management, and best practices for large-scale applications.',
        authorId: insertedUsers[1].id
      },
      {
        id: nanoid(),
        title: 'Database Seeding Best Practices',
        content: 'Database seeding is crucial for development and testing. This post covers different approaches to seeding your database with sample data.',
        authorId: insertedUsers[0].id
      },
      {
        id: nanoid(),
        title: 'TypeScript Tips for Better Code',
        content: 'Advanced TypeScript techniques that will make your code more maintainable and type-safe. From utility types to advanced generics.',
        authorId: insertedUsers[2].id
      }
    ]

    const insertedPosts = await db.insert(posts).values(samplePosts).returning()
    console.log(`✅ Created ${insertedPosts.length} posts`)

    console.log('🎉 Database seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   • Users: ${insertedUsers.length}`)
    console.log(`   • Todos: ${insertedTodos.length}`)
    console.log(`   • Posts: ${insertedPosts.length}`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✨ Seeding process completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error)
      process.exit(1)
    })
}

export { seedDatabase }
