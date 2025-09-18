import { colors } from '../ui/colors'

/**
 * Generate and push schema function with auto-detection
 */
export async function generateAndPushSchema() {
    console.log(`\n${colors.info('ℹ')}  ${colors.white('Generate and Push Schema')}`)
    console.log(
        `${colors.muted('This will generate and push your Drizzle schema to the database')}\n`
    )

    try {
        // Detect database type from environment
        const databaseUrl = process.env.DATABASE_URL || ''
        let provider = 'unknown'

        if (databaseUrl.startsWith('libsql://')) {
            provider = 'turso'
        } else if (
            databaseUrl.startsWith('postgresql://') ||
            databaseUrl.startsWith('postgres://')
        ) {
            provider =
                databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
                    ? 'postgres-local'
                    : 'postgres'
        } else if (databaseUrl.startsWith('file:') || databaseUrl.endsWith('.db')) {
            provider = 'sqlite'
        }

        console.log(
            `${colors.info('ℹ')}  ${colors.white('Detected database:')} ${colors.accent(provider)}`
        )

        if (provider === 'postgres' || provider === 'postgres-local') {
            console.log(`${colors.info('ℹ')}  ${colors.white('PostgreSQL detected - run:')}`)
            console.log(`${colors.brightCyan('  npx drizzle-kit push')}`)
        } else if (provider === 'turso') {
            console.log(`${colors.info('ℹ')}  ${colors.white('Turso detected - run:')}`)
            console.log(`${colors.brightCyan('  npx drizzle-kit push')}`)
        } else if (provider === 'sqlite') {
            console.log(`${colors.info('ℹ')}  ${colors.white('SQLite detected - run:')}`)
            console.log(`${colors.brightCyan('  npx drizzle-kit push')}`)
        } else {
            console.log(`${colors.warning('⚠')}  ${colors.yellow('Unknown database provider')}`)
        }

        console.log(
            `\n${colors.info('ℹ')}  ${colors.white('Schema generation requires Drizzle Kit')}`
        )
        console.log(
            `${colors.muted('Make sure you have drizzle-kit installed and drizzle.config.ts configured.')}`
        )
        console.log(`${colors.muted('Run the command above to push your schema to the database.')}`)
    } catch (error) {
        console.log(`\n${colors.error('✗')}  ${colors.red('Failed to detect database:')}`)
        console.log(`${colors.muted(error instanceof Error ? error.message : String(error))}`)
    }
}

/**
 * Clear database function with auto-detection
 */
export async function clearDatabase() {
    console.log(`\n${colors.warning('⚠')}  ${colors.yellow('Database Clear Operation')}`)
    console.log(`${colors.muted('This will drop ALL tables and reset your database!')}\n`)

    try {
        // Detect database type from environment
        const databaseUrl = process.env.DATABASE_URL || ''
        let provider = 'unknown'

        if (databaseUrl.startsWith('libsql://')) {
            provider = 'turso'
        } else if (
            databaseUrl.startsWith('postgresql://') ||
            databaseUrl.startsWith('postgres://')
        ) {
            provider =
                databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
                    ? 'postgres-local'
                    : 'postgres'
        } else if (databaseUrl.startsWith('file:') || databaseUrl.endsWith('.db')) {
            provider = 'sqlite'
        }

        console.log(
            `${colors.info('ℹ')}  ${colors.white('Detected database:')} ${colors.accent(provider)}`
        )

        if (provider === 'postgres' || provider === 'postgres-local') {
            console.log(
                `${colors.info('ℹ')}  ${colors.white('PostgreSQL detected - use DROP SCHEMA public CASCADE; CREATE SCHEMA public;')}`
            )
        } else if (provider === 'turso') {
            console.log(
                `${colors.info('ℹ')}  ${colors.white('Turso detected - use DROP TABLE for each table')}`
            )
        } else if (provider === 'sqlite') {
            console.log(
                `${colors.info('ℹ')}  ${colors.white('SQLite detected - use DROP TABLE for each table')}`
            )
        } else {
            console.log(
                `${colors.warning('⚠')}  ${colors.yellow('Unknown database provider - manual clearing required')}`
            )
        }

        console.log(
            `\n${colors.warning('⚠')}  ${colors.yellow('Manual database clearing required')}`
        )
        console.log(`${colors.muted('This feature requires database connection setup.')}`)
        console.log(`${colors.muted('Please run your database migrations to reset tables.')}`)
    } catch (error) {
        console.log(`\n${colors.error('✗')}  ${colors.red('Failed to detect database:')}`)
        console.log(`${colors.muted(error instanceof Error ? error.message : String(error))}`)
    }
}
