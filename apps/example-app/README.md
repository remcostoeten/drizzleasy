# Drizzleasy Example App

A modern, well-architected Next.js application showcasing the power of [@remcostoeten/drizzleasy](https://github.com/remcostoeten/drizzleasy) with dark Vercel aesthetics and functional programming principles.

## 🚀 Features

- **Complete CRUD Operations**: Todos, Users, and Blog Posts
- **Type-Safe Database Operations**: Built with Drizzleasy's ultra-simple API
- **Optimistic UI Updates**: Instant feedback with server-side validation
- **Modern Architecture**: Modular, scalable structure following best practices
- **Dark Vercel Theme**: Beautiful, accessible dark mode design
- **Functional Programming**: Clean, composable code without classes

## 🏗️ Architecture

This app follows a custom-rolled architecture with strong separation of concerns:

```
src/
├── shared/           # Shared components and utilities
│   └── components/ui/ # Reusable UI components
├── modules/          # Feature-specific code
│   ├── todos/        # Todo management module
│   ├── users/        # User management module
│   └── posts/        # Blog posts module
├── views/            # Page compositions
├── components/       # Singular-use components
└── app/              # Next.js app router pages
```

Each module contains:
- **API**: Server actions for queries and mutations
- **Models**: Zod schemas for validation
- **Hooks**: Custom React hooks for state management
- **Views**: UI compositions for the feature

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Set up your database:**
   Create a `.env.local` file in the root of this app:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/drizzleasy_example"
   ```

3. **Generate and push the schema:**
   ```bash
   # Push schema to database (recommended for development)
   bun run db:push
   
   # Or generate and run migrations (for production)
   bun run db:generate
   bun run db:migrate
   ```

4. **Start the development server:**
   ```bash
   bun run dev
   ```

## 📱 Available Pages

### Home (`/`)
- Overview of all features
- Quick start guide
- Navigation to all modules

### Todo Manager (`/todos`)
- Create, read, update, delete todos
- Priority levels (low, medium, high)
- Real-time optimistic updates
- Completion status tracking

### User Management (`/users`)
- User profiles with avatars
- Email validation
- Active/inactive status management
- User creation and deletion

### Blog Posts (`/posts`)
- Create and manage blog posts
- User relationships (posts belong to users)
- Rich content management
- Author attribution

## 🎨 UI Components

All components follow the dark Vercel theme with:
- **Button**: Multiple variants (primary, secondary, danger, ghost)
- **Card**: Elevated containers with hover effects
- **Input**: Form inputs with validation states
- **Badge**: Status indicators with color coding
- **Modal**: Accessible modal dialogs
- **Spinner**: Loading indicators

## 🔧 Available Scripts

- `bun run dev` - Start development server with Turbopack
- `bun run build` - Build for production
- `bun run db:generate` - Generate migration files from schema
- `bun run db:push` - Push schema changes to database (dev)
- `bun run db:migrate` - Run migrations (production)
- `bun run db:studio` - Open Drizzle Studio

## 🗄️ Database Schema

The app includes three main tables with relationships:

```sql
-- Todos table
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  author_id TEXT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 Key Features Demonstrated

### Drizzleasy Integration
- **Simple CRUD**: `crud.create<T>('table')(data)`
- **Type Safety**: Full TypeScript support with inferred types
- **Error Handling**: Graceful error handling with result types
- **Server Actions**: Seamless integration with Next.js server actions

### Modern React Patterns
- **Server Components**: Efficient server-side rendering
- **Client Components**: Interactive UI with state management
- **Optimistic Updates**: Instant UI feedback
- **Form Handling**: Controlled components with validation

### Architecture Benefits
- **Modularity**: Features are self-contained and portable
- **Scalability**: Easy to add new features and modules
- **Maintainability**: Clear separation of concerns
- **Reusability**: Shared components and utilities

## 🚀 Getting Started

1. Visit `http://localhost:3000` to see the main page
2. Explore the Todo Manager to see CRUD operations
3. Check out User Management for relationship handling
4. Try the Blog Posts to see complex data relationships

## 📚 Learn More

- [Drizzleasy Documentation](https://github.com/remcostoeten/drizzleasy)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🤝 Contributing

This example app demonstrates best practices for building scalable Next.js applications with Drizzleasy. Feel free to use it as a starting point for your own projects!