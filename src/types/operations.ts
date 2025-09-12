import type { TEntity } from './entities'

export type TResult<T> = {
  data?: T
  error?: Error
}

export type TOperations<T extends TEntity> = {
  create: (data: import('./entities').TCreateInput<T>) => Promise<TResult<T[]>>
  read: {
    all: () => Promise<TResult<T[]>>
    byId?: (id: string | number) => Promise<TResult<T | null>>
  }
  update: (id: string | number, data: import('./entities').TUpdateInput<T>) => Promise<TResult<T[]>>
  destroy: (id: string | number) => Promise<TResult<T[]>>
}