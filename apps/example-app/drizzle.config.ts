import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/server/schema.ts',
  out: './src/server/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/drizzleasy_example',
  },
})