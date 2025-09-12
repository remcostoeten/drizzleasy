// Base entity types
export type TEntity = {
  id: string | number
  createdAt?: string | Date
  updatedAt?: string | Date
}

export type TTimestamped = TEntity & {
  createdAt: string | Date
  updatedAt: string | Date
}

export type TCreateInput<T extends TEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>
export type TUpdateInput<T extends TEntity> = Partial<Omit<T, 'id' | 'createdAt'>>
export type TEntityWithId<T> = T & { id: string | number }