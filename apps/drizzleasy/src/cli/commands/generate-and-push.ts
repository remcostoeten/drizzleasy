import { exec } from 'child_process'
import { promisify } from 'util'
import { colors } from '../ui/colors'

const execAsync = promisify(exec)

/**
 * Generate and push schema function with auto-detection
 */
export async function generateAndPushSchema() {
    console.log(`\n${colors.info('ℹ')}  ${colors.white('Generate and Push Schema')}`)
    console.log(
        `${colors.muted('This will generate and push your Drizzle schema to the database')}\n`
    )
    console.log(`${colors.brightCyan('  npx drizzle-kit push')}`)

    try {
        const generateResult = await execAsync('npx drizzle-kit generate')
        console.log(generateResult.stdout)
        if (generateResult.stderr) console.log(generateResult.stderr)

        const pushResult = await execAsync('npx drizzle-kit push')
        console.log(pushResult.stdout)
        if (pushResult.stderr) console.log(pushResult.stderr)
    } catch (error) {
        console.log(`${colors.error('✗')}  ${colors.red('Failed to push schema:')}`)
        console.log(`${colors.muted(error instanceof Error ? error.message : String(error))}`)
    }
}
