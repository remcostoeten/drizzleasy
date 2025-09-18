import { colors, box } from './colors'

/**
 * Show help documentation
 */
export function help() {
    console.clear()

    const width = 80
    const border = colors.accent(`${box.topLeft}${'─'.repeat(width - 2)}${box.topRight}`)
    const borderBottom = colors.accent(
        `${box.bottomLeft}${'─'.repeat(width - 2)}${box.bottomRight}`
    )
    const side = colors.accent(box.vertical)

    console.log(`
${border}
${side}                            ${colors.brand('Drizzleasy CLI Help')}                            ${side}
${borderBottom}

${colors.highlight('OVERVIEW')}
  Drizzleasy CLI is a simple, powerful tool for database management.
  This initial release focuses on essential database operations with
  automatic provider detection and type-safe operations.

${colors.highlight('FEATURES')}
  ${colors.success('•')} ${colors.white('Automatic database provider detection (PostgreSQL, Turso, SQLite)')}
  ${colors.success('•')} ${colors.white('Type-safe database operations with Drizzle ORM')}
  ${colors.success('•')} ${colors.white('Clean, colorized interface with no external dependencies')}
  ${colors.success('•')} ${colors.white('Schema-aware operations with full IntelliSense')}

${colors.highlight('CONTROLS')}
  ${colors.brightYellow('↑↓ Arrow Keys')}    ${colors.white('Navigate menu options')}
  ${colors.brightGreen('Enter/Space')}      ${colors.white('Select current option')}
  ${colors.brightRed('Backspace')}        ${colors.white('Go back to previous screen')}
  ${colors.brightRed('Escape')}           ${colors.white('Exit the application')}
  ${colors.brightCyan('0-9')}              ${colors.white('Quick select by number')}
  ${colors.brightRed('Ctrl+C')}           ${colors.white('Force exit')}

${colors.highlight('AVAILABLE COMMANDS')}

  ${colors.boldCyan('1. Clear Database')}
     Drops all tables and resets your database to initial state.
     Automatically detects your database provider and uses the
     appropriate method for clearing.

${colors.highlight('EXAMPLES')}

  ${colors.muted('#')} ${colors.white('Start CLI (default)')}
  ${colors.brightCyan('bun run cli')}

  ${colors.muted('#')} ${colors.white('Show help')}
  ${colors.brightCyan('bun run cli --help')}

  ${colors.muted('#')} ${colors.white('Direct command (when published)')}
  ${colors.brightCyan('npx @remcostoeten/drizzleasy')}

${colors.highlight('DATABASE SUPPORT')}
  ${colors.success('•')} ${colors.boldCyan('PostgreSQL')} ${colors.white('- Drops and recreates public schema')}
  ${colors.success('•')} ${colors.boldCyan('Turso')} ${colors.white('- Drops all user tables')}
  ${colors.success('•')} ${colors.boldCyan('SQLite')} ${colors.white('- Drops all user tables')}

${colors.highlight('SCHEMA REQUIREMENTS')}
  Drizzleasy CLI automatically detects your database configuration from:
  ${colors.success('•')} ${colors.white('drizzle.config.ts in your project root')}
  ${colors.success('•')} ${colors.white('Environment variables (DATABASE_URL, etc.)')}
  ${colors.success('•')} ${colors.white('Database provider settings')}

${colors.highlight('TROUBLESHOOTING')}
  ${colors.warning('•')} ${colors.white('Ensure your database connection is working')}
  ${colors.warning('•')} ${colors.white('Check that your Drizzle schema is properly configured')}
  ${colors.warning('•')} ${colors.white('Verify environment variables are set correctly')}
  ${colors.warning('•')} ${colors.white('Use --help for command-specific help')}

For more information, visit: ${colors.brightCyan('https://github.com/remcostoeten/drizzleasy')}

${colors.muted('Press any key to return to the main menu...')}
`)

    // Wait for user input
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')

    return new Promise<void>(resolve => {
        process.stdin.once('data', () => {
            process.stdin.setRawMode(false)
            resolve()
        })
    })
}
