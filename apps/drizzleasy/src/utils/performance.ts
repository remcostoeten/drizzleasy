/**
 * Production performance monitoring utilities for Drizzleasy
 */

export type TPerformanceMetrics = {
  operation: string
  duration: number
  timestamp: Date
  success: boolean
  metadata?: Record<string, unknown>
}

class PerformanceMonitor {
  private metrics: TPerformanceMetrics[] = []
  private maxMetrics: number = 1000 // Prevent memory leaks

  public startTimer(operation: string): (success?: boolean, metadata?: Record<string, unknown>) => TPerformanceMetrics {
    const start = performance.now()
    const timestamp = new Date()

    return (success: boolean = true, metadata?: Record<string, unknown>) => {
      const duration = performance.now() - start
      const metric: TPerformanceMetrics = {
        operation,
        duration,
        timestamp,
        success,
        metadata
      }

      this.addMetric(metric)
      return metric
    }
  }

  private addMetric(metric: TPerformanceMetrics): void {
    this.metrics.push(metric)
    
    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }

  public getMetrics(operation?: string): TPerformanceMetrics[] {
    if (operation) {
      return this.metrics.filter(m => m.operation === operation)
    }
    return [...this.metrics]
  }

  public getAverageTime(operation?: string): number {
    const relevantMetrics = this.getMetrics(operation)
    if (relevantMetrics.length === 0) return 0
    
    const total = relevantMetrics.reduce((sum, m) => sum + m.duration, 0)
    return total / relevantMetrics.length
  }

  public getSuccessRate(operation?: string): number {
    const relevantMetrics = this.getMetrics(operation)
    if (relevantMetrics.length === 0) return 0
    
    const successful = relevantMetrics.filter(m => m.success).length
    return (successful / relevantMetrics.length) * 100
  }

  public clear(): void {
    this.metrics = []
  }
}

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor()

export function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const endTimer = performanceMonitor.startTimer(operation)
  
  return fn()
    .then((result) => {
      endTimer(true, metadata)
      return result
    })
    .catch((error) => {
      endTimer(false, { error: error.message, ...metadata })
      throw error
    })
}

export function getPerformanceMetrics(operation?: string): TPerformanceMetrics[] {
  return performanceMonitor.getMetrics(operation)
}

export function getAverageOperationTime(operation?: string): number {
  return performanceMonitor.getAverageTime(operation)
}

export function getOperationSuccessRate(operation?: string): number {
  return performanceMonitor.getSuccessRate(operation)
}

export function clearPerformanceMetrics(): void {
  performanceMonitor.clear()
}

// Utility for connection pool monitoring
export function createConnectionPoolMonitor() {
  let activeConnections = 0
  let maxConnections = 0
  let totalConnections = 0

  return {
    acquireConnection: () => {
      activeConnections++
      totalConnections++
      maxConnections = Math.max(maxConnections, activeConnections)
    },
    
    releaseConnection: () => {
      activeConnections = Math.max(0, activeConnections - 1)
    },
    
    getStats: () => ({
      active: activeConnections,
      max: maxConnections,
      total: totalConnections
    }),
    
    reset: () => {
      activeConnections = 0
      maxConnections = 0
      totalConnections = 0
    }
  }
}