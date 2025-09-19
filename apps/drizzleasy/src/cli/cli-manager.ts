import type { TConfig } from 'cli-types'

/**
 * Create CLI manager
 */
export function cli(config: TConfig) {
    return {
        run() {
            const args = process.argv.slice(2)

            if (args.includes('--version') || args.includes('-v')) {
                return showVersion(config)
            }

            if (args.includes('--help') || args.includes('-h')) {
                return showHelp(config)
            }

            const command = args[0]

            if (!command) {
                return config.commands.seed.run([])
            }

            if (command.startsWith('--')) {
                const subcommand = command.slice(2)
                if (config.commands[subcommand]) {
                    return config.commands[subcommand].run(args.slice(1))
                }
            }

            if (config.commands[command]) {
                return config.commands[command].run(args.slice(1))
            }

            showHelp(config)
        }
    }
}

function showHelp(config: TConfig) {
    console.log(`
${config.name} v${config.version}
${config.description}

Usage: 
  bun run cli              Interactive CLI (default)
  bun run cli --seed       Interactive CLI  
  bun run cli seed         Interactive CLI
  bun run cli --help       Show this help

Options:
  --help, -h     Show this help message
  --version, -v  Show version number

Examples:
  bun run cli              # Start interactive CLI
  bun run cli --seed       # Start interactive CLI
  bun run cli:fresh        # Force rebuild and start
`)
}

function showVersion(config: TConfig) {
    console.log(`${config.name} v${config.version}`)
}
