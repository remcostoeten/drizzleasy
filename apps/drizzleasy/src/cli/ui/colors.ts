/**
 * Lightweight ANSI color utilities with zero runtime overhead
 * Uses built-in terminal escape sequences - no dependencies
 */

// ANSI color codes
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'

// Colors
const BLACK = '\x1b[30m'
const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const BLUE = '\x1b[34m'
const MAGENTA = '\x1b[35m'
const CYAN = '\x1b[36m'
const WHITE = '\x1b[37m'

// Bright colors
const BRIGHT_BLACK = '\x1b[90m'
const BRIGHT_RED = '\x1b[91m'
const BRIGHT_GREEN = '\x1b[92m'
const BRIGHT_YELLOW = '\x1b[93m'
const BRIGHT_BLUE = '\x1b[94m'
const BRIGHT_MAGENTA = '\x1b[95m'
const BRIGHT_CYAN = '\x1b[96m'
const BRIGHT_WHITE = '\x1b[97m'

// Background colors
const BG_BLACK = '\x1b[40m'
const BG_RED = '\x1b[41m'
const BG_GREEN = '\x1b[42m'
const BG_YELLOW = '\x1b[43m'
const BG_BLUE = '\x1b[44m'
const BG_MAGENTA = '\x1b[45m'
const BG_CYAN = '\x1b[46m'
const BG_WHITE = '\x1b[47m'

/**
 * Color utility functions
 */
export const colors = {
    // Basic styling
    reset: (text: string) => `${RESET}${text}${RESET}`,
    bold: (text: string) => `${BOLD}${text}${RESET}`,
    dim: (text: string) => `${DIM}${text}${RESET}`,

    // Regular colors
    black: (text: string) => `${BLACK}${text}${RESET}`,
    red: (text: string) => `${RED}${text}${RESET}`,
    green: (text: string) => `${GREEN}${text}${RESET}`,
    yellow: (text: string) => `${YELLOW}${text}${RESET}`,
    blue: (text: string) => `${BLUE}${text}${RESET}`,
    magenta: (text: string) => `${MAGENTA}${text}${RESET}`,
    cyan: (text: string) => `${CYAN}${text}${RESET}`,
    white: (text: string) => `${WHITE}${text}${RESET}`,

    // Bright colors
    brightBlack: (text: string) => `${BRIGHT_BLACK}${text}${RESET}`,
    brightRed: (text: string) => `${BRIGHT_RED}${text}${RESET}`,
    brightGreen: (text: string) => `${BRIGHT_GREEN}${text}${RESET}`,
    brightYellow: (text: string) => `${BRIGHT_YELLOW}${text}${RESET}`,
    brightBlue: (text: string) => `${BRIGHT_BLUE}${text}${RESET}`,
    brightMagenta: (text: string) => `${BRIGHT_MAGENTA}${text}${RESET}`,
    brightCyan: (text: string) => `${BRIGHT_CYAN}${text}${RESET}`,
    brightWhite: (text: string) => `${BRIGHT_WHITE}${text}${RESET}`,

    // Background colors
    bgBlack: (text: string) => `${BG_BLACK}${text}${RESET}`,
    bgRed: (text: string) => `${BG_RED}${text}${RESET}`,
    bgGreen: (text: string) => `${BG_GREEN}${text}${RESET}`,
    bgYellow: (text: string) => `${BG_YELLOW}${text}${RESET}`,
    bgBlue: (text: string) => `${BG_BLUE}${text}${RESET}`,
    bgMagenta: (text: string) => `${BG_MAGENTA}${text}${RESET}`,
    bgCyan: (text: string) => `${BG_CYAN}${text}${RESET}`,
    bgWhite: (text: string) => `${BG_WHITE}${text}${RESET}`,

    // Semantic colors
    success: (text: string) => `${BRIGHT_GREEN}${text}${RESET}`,
    error: (text: string) => `${BRIGHT_RED}${text}${RESET}`,
    warning: (text: string) => `${BRIGHT_YELLOW}${text}${RESET}`,
    info: (text: string) => `${BRIGHT_CYAN}${text}${RESET}`,
    muted: (text: string) => `${BRIGHT_BLACK}${text}${RESET}`,

    // Branded colors for Drizzleasy
    brand: (text: string) => `${BRIGHT_MAGENTA}${text}${RESET}`,
    accent: (text: string) => `${BRIGHT_CYAN}${text}${RESET}`,
    highlight: (text: string) => `${BOLD}${BRIGHT_WHITE}${text}${RESET}`,

    // Combinations
    boldGreen: (text: string) => `${BOLD}${BRIGHT_GREEN}${text}${RESET}`,
    boldRed: (text: string) => `${BOLD}${BRIGHT_RED}${text}${RESET}`,
    boldYellow: (text: string) => `${BOLD}${BRIGHT_YELLOW}${text}${RESET}`,
    boldCyan: (text: string) => `${BOLD}${BRIGHT_CYAN}${text}${RESET}`,
    boldMagenta: (text: string) => `${BOLD}${BRIGHT_MAGENTA}${text}${RESET}`
}

/**
 * Box drawing characters for beautiful borders
 */
export const box = {
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '╰',
    bottomRight: '╯',
    horizontal: '─',
    vertical: '│',
    cross: '┼',
    teeDown: '┬',
    teeUp: '┴',
    teeRight: '├',
    teeLeft: '┤'
}

/**
 * Create a colored box border
 */
export function createBox(width: number, height: number, color = colors.muted) {
    const lines = []

    // Top border
    lines.push(color(`${box.topLeft}${'─'.repeat(width - 2)}${box.topRight}`))

    // Middle lines
    for (let i = 0; i < height - 2; i++) {
        lines.push(color(`${box.vertical}${' '.repeat(width - 2)}${box.vertical}`))
    }

    // Bottom border
    lines.push(color(`${box.bottomLeft}${'─'.repeat(width - 2)}${box.bottomRight}`))

    return lines
}

/**
 * Gradient text effect using color transitions
 */
export function gradient(text: string, startColor: string, endColor: string) {
    // Simple gradient effect by alternating colors
    return text
        .split('')
        .map((char, i) => {
            const ratio = i / (text.length - 1)
            return ratio < 0.5 ? `${startColor}${char}${RESET}` : `${endColor}${char}${RESET}`
        })
        .join('')
}
