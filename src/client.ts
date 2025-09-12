'use client'
import { useOptimistic, useTransition, startTransition as reactStartTransition } from 'react'
import type { TEntity, TResult } from './types'

function useOptimisticCrud<T extends TEntity>(initialData: T[]) {
  const [optimisticData, addOptimistic] = useOptimistic(
    initialData,
    (state: T[], newItem: Omit<T, 'id'>) => [
      ...state,
      { id: crypto.randomUUID(), ...newItem } as T
    ]
  )
  
  const [isPending, startTransition] = useTransition()
  
  function optimisticCreate(
    newItem: Omit<T, 'id'>, 
    serverAction: () => Promise<TResult<T[]>>
  ) {
    startTransition(async () => {
      addOptimistic(newItem)
      try {
        const result = await serverAction()
        if (result.error) {
          console.error('Server action failed:', result.error)
        }
      } catch (error) {
        console.error('Optimistic create failed:', error)
      }
    })
  }
  
  return {
    data: optimisticData,
    isPending,
    optimisticCreate
  }
}

function withTransition<T>(serverAction: () => Promise<TResult<T>>) {
  return function() {
    reactStartTransition(async () => {
      try {
        const result = await serverAction()
        if (result.error) {
          console.error('Server action failed:', result.error)
        }
      } catch (error) {
        console.error('Transition failed:', error)
      }
    })
  }
}

export { useOptimisticCrud, withTransition }
