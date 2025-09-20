import type { TIdStrategy, TIdStrategyType } from '../types/id-strategy'

/**
 * Simple nanoid implementation (21 chars, URL-safe)
 */
function generateNanoid(): string {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-'
    let id = ''
    for (let i = 0; i < 21; i++) {
        id += alphabet[Math.floor(Math.random() * alphabet.length)]
    }
    return id
}

/**
 * UUID v4 generator
 */
function generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

/**
 * CUID2 simplified generator (for demo purposes)
 */
function generateCuid2(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 10)
    const counter = Math.floor(Math.random() * 1000).toString(36)
    return `c${timestamp}${random}${counter}`
}

/**
 * ULID generator (simplified)
 */
function generateUlid(): string {
    const timestamp = Date.now().toString(36).padStart(10, '0')
    const random = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 32).toString(32)
    ).join('')
    return `${timestamp}${random}`.toUpperCase()
}

/**
 * Generate an ID based on the specified strategy
 */
export function generateId(strategy: TIdStrategy, tableName: string): string {
    if (typeof strategy === 'object' && strategy.type === 'custom') {
        return strategy.generate(tableName)
    }

    const strategyType = strategy as TIdStrategyType
    
    switch (strategyType) {
        case 'nanoid':
            return generateNanoid()
        case 'uuid':
            return generateUuid()
        case 'cuid2':
            return generateCuid2()
        case 'ulid':
            return generateUlid()
        default:
            throw new Error(`Unknown ID strategy: ${strategyType}`)
    }
}

/**
 * Check if a value is likely a numeric/serial ID field
 */
export function isNumericIdField(fieldType: any): boolean {
    if (!fieldType) return false
    
    const typeStr = typeof fieldType === 'string' 
        ? fieldType.toLowerCase() 
        : fieldType?.dataType?.toLowerCase() || ''
    
    return typeStr.includes('int') || 
           typeStr.includes('serial') || 
           typeStr.includes('bigserial') ||
           typeStr.includes('smallserial')
}