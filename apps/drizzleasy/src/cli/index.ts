/**
 * Drizzleasy CLI - Interactive database seeding and management
 *
 * @example
 * ```bash
 * npx @remcostoeten/drizzleasy seed
 * npx @remcostoeten/drizzleasy seed --help
 * ```
 */

import { cli } from './cli-manager'
import { cliCommand } from './commands/cli-command'

/**
 * Run CLI
 */
export function run() {
    const drizzleasy = cli({
        name: 'drizzleasy',
        version: '0.1.0',
        description: 'Ultra-simple, type-safe CRUD operations for Next.js with Drizzle ORM',
        commands: {
            seed: cliCommand
        }
    })

    drizzleasy.run()
}

export { cli } from './cli-manager'
export { cliCommand } from './commands/cli-command'
