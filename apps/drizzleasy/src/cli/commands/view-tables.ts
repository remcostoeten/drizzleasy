import { colors } from '../ui/colors'

/**
 * View tables in the database
 */
export async function viewTables() {
    console.log(`\n${colors.info('ℹ')}  ${colors.white('View Tables')}`)
    console.log(`${colors.muted('View tables in the database')}\n`)

    // Detect database provider
    const provider = detectDatabaseProvider()
    console.log(
        `${colors.info('ℹ')}  ${colors.white('Detected database:')} ${colors.accent(provider)}`
    )

    if (provider === 'unknown') {
        console.log(`\n${colors.warning('⚠')}  ${colors.yellow('Unknown database provider')}`)
        console.log(
            `${colors.muted('Set DATABASE_URL environment variable to connect to your database.')}`
        )
        showManualInstructions()
        return
    }

    console.log(
        `\n${colors.info('ℹ')}  ${colors.white('Database connection required for live table viewing.')}`
    )
    console.log(`${colors.muted('Showing example queries for your database type:')}\n`)

    showTableQueries(provider)
}

function detectDatabaseProvider(): string {
    const databaseUrl = process.env.DATABASE_URL || ''

    if (databaseUrl.startsWith('libsql://')) {
        return 'turso'
    } else if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
        return databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
            ? 'postgres-local'
            : 'postgres'
    } else if (databaseUrl.startsWith('file:') || databaseUrl.endsWith('.db')) {
        return 'sqlite'
    }

    return 'unknown'
}

function showTableQueries(provider: string) {
    console.log(`${colors.brightCyan('SQL Queries to view tables:')}\n`)

    if (provider === 'postgres' || provider === 'postgres-local') {
        console.log(`${colors.accent('PostgreSQL:')}`)
        console.log(`${colors.white('-- List all tables')}`)
        console.log(
            `${colors.brightCyan("SELECT tablename FROM pg_tables WHERE schemaname = 'public';")}`
        )
        console.log(`\n${colors.white('-- Show table structure')}`)
        console.log(`${colors.brightCyan('\\d table_name')}`)
        console.log(`\n${colors.white('-- Count rows in all tables')}`)
        console.log(
            `${colors.brightCyan(`SELECT 
  schemaname,
  tablename,
  attname,
  typename,
  char_maximum_length
FROM pg_tables t
LEFT JOIN pg_attribute a ON a.attrelid = t.tablename::regclass
LEFT JOIN pg_type y ON y.oid = a.atttypid
WHERE schemaname = 'public' AND a.attnum > 0;`)}`
        )
    } else if (provider === 'turso' || provider === 'sqlite') {
        const dbType = provider === 'turso' ? 'Turso' : 'SQLite'
        console.log(`${colors.accent(`${dbType}:`)}`)
        console.log(`${colors.white('-- List all tables')}`)
        console.log(
            `${colors.brightCyan("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")}`
        )
        console.log(`\n${colors.white('-- Show table structure')}`)
        console.log(`${colors.brightCyan('PRAGMA table_info(table_name);')}`)
        console.log(`\n${colors.white('-- Count rows in table')}`)
        console.log(`${colors.brightCyan('SELECT COUNT(*) FROM table_name;')}`)
        console.log(`\n${colors.white('-- Show all table schemas')}`)
        console.log(
            `${colors.brightCyan("SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")}`
        )
    }

    console.log(
        `\n${colors.info('ℹ')}  ${colors.white('Connect to your database and run these queries to view your tables.')}`
    )
}

function showManualInstructions() {
    console.log(`\n${colors.brightCyan('Manual Instructions:')}`)
    console.log(`\n${colors.accent('1. Set your DATABASE_URL:')}`)
    console.log(`${colors.muted('   export DATABASE_URL="your_database_connection_string"')}`)

    console.log(`\n${colors.accent('2. Example connection strings:')}`)
    console.log(`${colors.muted('   PostgreSQL: postgresql://user:pass@host:5432/dbname')}`)
    console.log(`${colors.muted('   Turso:      libsql://your-db-url')}`)
    console.log(`${colors.muted('   SQLite:     file:./database.db')}`)

    console.log(`\n${colors.accent('3. Use database tools:')}`)
    console.log(`${colors.muted('   • psql (PostgreSQL)')}`)
    console.log(`${colors.muted('   • sqlite3 (SQLite)')}`)
    console.log(`${colors.muted('   • Turso CLI (Turso)')}`)
    console.log(`${colors.muted('   • GUI tools: TablePlus, DBeaver, etc.')}`)
}
