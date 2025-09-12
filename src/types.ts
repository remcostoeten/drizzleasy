// Base entity types for reusability and type safety

export interface BaseEntity {
  id: string | number
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface TimestampedEntity extends BaseEntity {
  createdAt: string | Date
  updatedAt: string | Date
}

export type CreateInput<T extends BaseEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateInput<T extends BaseEntity> = Partial<Omit<T, 'id' | 'createdAt'>>
export type EntityWithId<T> = T & { id: string | number }

export interface CrudResult<T> {
  data?: T
  error?: Error
}

export interface CrudOperations<T extends BaseEntity> {
  create: (data: CreateInput<T>) => Promise<CrudResult<T[]>>
  read: {
    all: () => Promise<CrudResult<T[]>>
    byId?: (id: string | number) => Promise<CrudResult<T | null>>
  }
  update: (id: string | number, data: UpdateInput<T>) => Promise<CrudResult<T[]>>
  destroy: (id: string | number) => Promise<CrudResult<T[]>>
}

export type ServerActionResult<T> = CrudResult<T>