# Drizzleasy Example App

This example app demonstrates how to use Drizzleasy with the schemas from `examples.mdx`.

## Setup

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
   # Generate migration files
   bun run db:generate
   
   # Push schema to database (recommended for development)
   bun run db:push
   
   # Or run migrations (for production)
   bun run db:migrate
   ```

4. **Start the development server:**
   ```bash
   bun run dev
   ```

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run db:generate` - Generate migration files from schema
- `bun run db:push` - Push schema changes to database (dev)
- `bun run db:migrate` - Run migrations (production)
- `bun run db:studio` - Open Drizzle Studio

## Examples Included

### 1. Todo App (`/todos`)
- Complete CRUD operations for todos
- Optimistic updates with `useOptimisticCrud`
- Server actions with revalidation

### 2. Schema Examples
- **Todos**: Basic CRUD with priority levels
- **Users**: User management with email validation
- **Posts**: Related data with user references

## Database Schema

The app includes three main tables:

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

## Using the Examples

1. Visit `http://localhost:3000` to see the main page
2. Click "Todo App Example" to see the working todo application
3. The todo app demonstrates:
   - Creating new todos
   - Toggling completion status
   - Deleting todos
   - Optimistic UI updates

## Next Steps

- Add more examples from `examples.mdx`
- Implement user authentication
- Add the blog/CRM examples
- Set up proper error handling