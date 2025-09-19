import { createInterface } from 'readline'
import type { TMenu, TOption } from 'cli-types'
import { colors } from './colors'

/**
 * Interactive menu with keyboard navigation
 */
export function menu(config: TMenu) {
    return {
        async show(): Promise<TOption | null> {
            if (!process.stdin.isTTY) {
                console.log(`\n${colors.brand(config.title)}`)
                if (config.subtitle) {
                    console.log(`${colors.muted(config.subtitle)}\n`)
                }
                config.options.forEach((option, index) => {
                    console.log(`${colors.accent(`${index + 1}.`)} ${colors.white(option.label)}`)
                    if (option.description) {
                        console.log(`   ${colors.muted(option.description)}`)
                    }
                })
                console.log(
                    `\n${colors.muted('Non-interactive mode - use specific commands for automation.')}`
                )
                return null
            }

            const rl = createInterface({
                input: process.stdin,
                output: process.stdout,
                terminal: true
            })

            let selectedIndex = 0
            let isRunning = true

            process.stdin.setRawMode(true)
            process.stdin.resume()
            process.stdin.setEncoding('utf8')

            const render = () => {
                console.clear()
                console.log(`\n${colors.brand(config.title)}`)
                if (config.subtitle) {
                    console.log(`${colors.muted(config.subtitle)}\n`)
                }

                config.options.forEach((option, index) => {
                    const isSelected = index === selectedIndex

                    if (isSelected) {
                        const arrow = colors.accent('→')
                        const key = colors.boldCyan(option.key)
                        const label = colors.highlight(option.label)
                        console.log(`${arrow} ${key}. ${label}`)

                        if (option.description) {
                            console.log(`   ${colors.muted(option.description)}`)
                        }
                    } else {
                        const key = colors.muted(option.key)
                        const label = colors.white(option.label)
                        console.log(`  ${key}. ${label}`)
                    }
                })

                console.log(
                    `\n${colors.muted('Controls:')} ${colors.brightYellow('↑↓')} ${colors.white('Navigate')} ${colors.muted('|')} ${colors.brightGreen('Enter/Space')} ${colors.white('Select')} ${colors.muted('|')} ${colors.brightRed('Backspace')} ${colors.white('Back')} ${colors.muted('|')} ${colors.brightRed('Esc')} ${colors.white('Exit')}`
                )
            }

            const handleKey = (key: string) => {
                switch (key) {
                    case '\u0003':
                    case '\u001b':
                        isRunning = false
                        break

                    case '\u0008':
                        isRunning = false
                        break

                    case '\r':
                    case ' ':
                        isRunning = false
                        break

                    case '\u001b[A':
                        selectedIndex = Math.max(0, selectedIndex - 1)
                        render()
                        break

                    case '\u001b[B':
                        selectedIndex = Math.min(config.options.length - 1, selectedIndex + 1)
                        render()
                        break

                    default:
                        const num = parseInt(key)
                        if (!isNaN(num) && num >= 0 && num <= 9) {
                            const option = config.options.find(opt => opt.key === num.toString())
                            if (option) {
                                selectedIndex = config.options.indexOf(option)
                                isRunning = false
                            }
                        }
                }
            }

            render()
            process.stdin.on('data', handleKey)

            return new Promise(resolve => {
                const check = () => {
                    if (!isRunning) {
                        process.stdin.removeListener('data', handleKey)
                        process.stdin.setRawMode(false)
                        rl.close()

                        const selectedOption = config.options[selectedIndex]
                        resolve(selectedOption || null)
                    } else {
                        setTimeout(check, 50)
                    }
                }
                check()
            })
        }
    }
}
