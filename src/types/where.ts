// Simple WHERE clause types with intuitive operators

// Comparison operators for numbers, strings, dates
type TComparisonOperator = 
  | `>${string}` 
  | `>=${string}` 
  | `<${string}` 
  | `<=${string}` 
  | `!${string}`

// String pattern operators
type TStringOperator = 
  | `*${string}*`  // Contains
  | `${string}*`   // Starts with
  | `*${string}`   // Ends with

// Simple WHERE value types
type TWhereValue<T> = 
  | T                           // Direct equality: { status: 'active' }
  | T[]                         // Array (IN): { role: ['admin', 'user'] }
  | (T extends number | string | Date ? TComparisonOperator : never)  // Comparison: { age: '>18' }
  | (T extends string ? TStringOperator : never)                       // String patterns: { name: '*john*' }

export type TWhereClause<T> = {
  [K in keyof T]?: TWhereValue<T[K]>
}