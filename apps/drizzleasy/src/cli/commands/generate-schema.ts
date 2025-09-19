import { colors } from '../ui/colors'
import { menu } from '../ui/interactive-menu'
import type { TOption } from 'cli-types'

/**
 * Generate random schema with different options
 */
export async function generateRandomSchema() {
    console.log(`\n${colors.info('ℹ')}  ${colors.white('Generate Random Schema + Push')}`)
    console.log(`${colors.muted('Choose a schema type to generate and push to your database')}\n`)

    const schemaMenu = menu({
        title: '🎲 Schema Generator',
        subtitle: 'Choose a schema type:',
        options: [
            {
                key: '1',
                label: 'E-commerce Schema',
                description: 'Users, products, orders, categories with relationships',
                action: () => generateEcommerceSchema()
            },
            {
                key: '2',
                label: 'Blog Schema',
                description: 'Posts, users, comments, tags with full-text search',
                action: () => generateBlogSchema()
            },
            {
                key: '3',
                label: 'CRM Schema',
                description: 'Contacts, companies, deals, activities, notes',
                action: () => generateCRMSchema()
            },
            {
                key: '4',
                label: 'Social Media Schema',
                description: 'Users, posts, likes, follows, messages',
                action: () => generateSocialSchema()
            },
            {
                key: '5',
                label: 'Task Management Schema',
                description: 'Projects, tasks, users, comments, attachments',
                action: () => generateTaskSchema()
            },
            {
                key: '0',
                label: 'Back to Main Menu',
                description: 'Return to the main CLI menu',
                action: () => console.log(`${colors.muted('Returning to main menu...')}`)
            }
        ]
    })

    const selectedOption = await schemaMenu.show()

    if (selectedOption) {
        console.log(
            `\n${colors.success('✓')} ${colors.white('Selected:')} ${colors.accent(selectedOption.label)}`
        )
        await selectedOption.action()
    }
}

async function generateEcommerceSchema() {
    console.log(`\n${colors.info('ℹ')}  ${colors.white('Generating E-commerce Schema...')}`)

    const schema = `
-- E-commerce Schema
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
`

    await showSchemaAndPush(schema, 'ecommerce')
}

async function generateBlogSchema() {
    console.log(`\n${colors.info('ℹ')}  ${colors.white('Generating Blog Schema...')}`)

    const schema = `
-- Blog Schema
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id INTEGER REFERENCES users(id),
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6'
);

CREATE TABLE post_tags (
  post_id INTEGER REFERENCES posts(id),
  tag_id INTEGER REFERENCES tags(id),
  PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id),
  author_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  parent_id INTEGER REFERENCES comments(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

    await showSchemaAndPush(schema, 'blog')
}

async function generateCRMSchema() {
    console.log(`\n${colors.info('ℹ')}  ${colors.white('Generating CRM Schema...')}`)

    const schema = `
-- CRM Schema
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  website VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  company_id INTEGER REFERENCES companies(id),
  job_title VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deals (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2),
  stage VARCHAR(50) DEFAULT 'prospecting',
  contact_id INTEGER REFERENCES contacts(id),
  company_id INTEGER REFERENCES companies(id),
  expected_close_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  contact_id INTEGER REFERENCES contacts(id),
  deal_id INTEGER REFERENCES deals(id),
  due_date TIMESTAMP,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  contact_id INTEGER REFERENCES contacts(id),
  deal_id INTEGER REFERENCES deals(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

    await showSchemaAndPush(schema, 'crm')
}

async function generateSocialSchema() {
    console.log(`\n${colors.info('ℹ')}  ${colors.white('Generating Social Media Schema...')}`)

    const schema = `
-- Social Media Schema
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url VARCHAR(500),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE follows (
  follower_id INTEGER REFERENCES users(id),
  following_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE likes (
  user_id INTEGER REFERENCES users(id),
  post_id INTEGER REFERENCES posts(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id),
  receiver_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

    await showSchemaAndPush(schema, 'social')
}

async function generateTaskSchema() {
    console.log(`\n${colors.info('ℹ')}  ${colors.white('Generating Task Management Schema...')}`)

    const schema = `
-- Task Management Schema
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_id INTEGER REFERENCES projects(id),
  assignee_id INTEGER REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'todo',
  priority VARCHAR(20) DEFAULT 'medium',
  due_date DATE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  task_id INTEGER REFERENCES tasks(id),
  author_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attachments (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  task_id INTEGER REFERENCES tasks(id),
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

    await showSchemaAndPush(schema, 'tasks')
}

async function showSchemaAndPush(schema: string, schemaType: string) {
    console.log(`\n${colors.brightCyan('Generated Schema:')}`)
    console.log(`${colors.muted(schema)}`)

    console.log(`\n${colors.info('ℹ')}  ${colors.white('Next steps:')}`)
    console.log(`${colors.muted('1. Save this schema to a file (e.g., schema.sql)')}`)
    console.log(`${colors.muted('2. Run: npx drizzle-kit push')}`)
    console.log(`${colors.muted('3. Or execute the SQL directly in your database')}`)

    console.log(`\n${colors.success('✓')}  ${colors.white('Schema generated successfully!')}`)
    console.log(`${colors.muted(`Type: ${schemaType} schema`)}`)
}
