import { colors, box } from './colors'

/**
 * Show branded intro screen
 */
export function intro(version: string) {
    console.clear()

    const width = 80
    const border = colors.accent(`${box.topLeft}${'─'.repeat(width - 2)}${box.topRight}`)
    const borderBottom = colors.accent(
        `${box.bottomLeft}${'─'.repeat(width - 2)}${box.bottomRight}`
    )
    const side = colors.accent(box.vertical)

    console.log(`
${border}
${side}                                                                              ${side}
${side}  ${colors.brand('Drizzleasy Seeder')} ${colors.muted(`v${version.padEnd(8)}`)}                                    ${side}
${side}                                                                              ${side}
${side}  ${colors.highlight('Ultra-simple, type-safe database seeding for Next.js with Drizzle ORM')}      ${side}
${side}                                                                              ${side}
${side}  ${colors.success('•')} ${colors.white('100% TypeScript with full IntelliSense')}                                   ${side}
${side}  ${colors.success('•')} ${colors.white('Interactive CLI with fzf-style navigation')}                                ${side}
${side}  ${colors.success('•')} ${colors.white('Schema-aware seeding with automatic type inference')}                       ${side}
${side}  ${colors.success('•')} ${colors.white('Support for manual entry, fake data, and file imports')}                    ${side}
${side}                                                                              ${side}
${side}  ${colors.muted('Made with')} ${colors.brightRed('♥')} ${colors.muted('by')} ${colors.brightCyan('Remco Stoeten')}                                              ${side}
${side}                                                                              ${side}
${borderBottom}
`)
}
