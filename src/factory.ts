import type { TEntity } from './types'
import { crud } from './crud'

export function createFn<T extends TEntity = TEntity>() {
  return (tableName: string) => crud.create<T>(tableName)
}

export function readFn<T extends TEntity = TEntity>() {
  return (tableName: string) => crud.read<T>(tableName)
}

export function updateFn<T extends TEntity = TEntity>() {
  return (tableName: string) => crud.update<T>(tableName)
}

export function deleteFn<T extends TEntity = TEntity>() {
  return (tableName: string) => crud.delete<T>(tableName)
}