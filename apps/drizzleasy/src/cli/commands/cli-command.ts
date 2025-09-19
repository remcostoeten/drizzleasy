import { intro } from '../ui/intro-screen'
import { menu } from '../ui/interactive-menu'
import { help } from '../ui/help-screen'
import { colors } from '../ui/colors'
import { clearDatabase } from './clear-database'
import { generateAndPushSchema } from './generate-and-push'
import { generateRandomSchema } from './generate-schema'
import { viewTables } from './view-tables'
import type { TCommand } from 'cli-types'

/**
 * Main CLI command with interactive menu
 */
export const cliCommand: TCommand = {
  async run(args: string[]) {
    if (args.includes('--help') || args.includes('-h')) {
      await help()
      return 
    }
    
    intro('0.1.0')
    
    const mainMenu = menu({
      title: '🌱 Drizzleasy CLI',
      subtitle: 'Choose an option:',
      options: [
        {
          key: '1',
          label: 'Clear Database',
          description: 'Drop all tables and reset database to initial state',
          action: clearDatabase
        },
        {
          key: '2',
          label: 'Generate and push schema',
          description: 'Generate and push schema to database',
          action: generateAndPushSchema
        },
        {
          key: '3',
          label: 'Generate Random Schema + Push',
          description: 'Generate random schema templates with different options',
          action: generateRandomSchema
        },
        {
          key: '4',
          label: 'View tables',
          description: 'View tables in the database',
          action: viewTables
        },
        {
          key: '0',
          label: 'Help & Documentation',
          description: 'Show help, examples, and documentation',
          action: help
        }
      ]
    })
    
    const selectedOption = await mainMenu.show()
    
    if (selectedOption) {
      console.log(`\n${colors.success('✓')} ${colors.white('Selected:')} ${colors.accent(selectedOption.label)}`)
      await selectedOption.action()
    } else {
      console.log(`\n${colors.muted('Goodbye!')} ${colors.brightCyan('Thanks for using Drizzleasy!')}`)
    }
  }
}
