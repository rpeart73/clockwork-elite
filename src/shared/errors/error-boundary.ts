/**
 * Enterprise-grade error handling with automatic recovery
 */

export interface ErrorContext {
  userId?: string;
  sessionId: string;
  component: string;
  action: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface RecoveryStrategy {
  type: 'retry' | 'fallback' | 'reset' | 'report';
  maxAttempts?: number;
  delay?: number;
  fallbackValue?: unknown;
}

export class ErrorHandler {
  private static retryCount = new Map<string, number>();
  private static errorLog: Array<ErrorContext & { error: Error }> = [];
  
  /**
   * Handles errors with automatic recovery strategies
   */
  static async handle(
    error: Error,
    context: ErrorContext,
    strategy: RecoveryStrategy = { type: 'report' }
  ): Promise<unknown> {
    // Log error for monitoring
    this.errorLog.push({ ...context, error });
    
    // Send to monitoring service
    await this.reportToMonitoring(error, context);
    
    // Execute recovery strategy
    switch (strategy.type) {
      case 'retry':
        return this.executeRetry(error, context, strategy);
      case 'fallback':
        return this.executeFallback(strategy.fallbackValue);
      case 'reset':
        return this.executeReset(context);
      case 'report':
      default:
        return this.executeReport(error, context);
    }
  }
  
  private static async executeRetry(
    error: Error,
    context: ErrorContext,
    strategy: RecoveryStrategy
  ): Promise<boolean> {
    const key = `${context.component}-${context.action}`;
    const attempts = this.retryCount.get(key) || 0;
    
    if (attempts < (strategy.maxAttempts || 3)) {
      this.retryCount.set(key, attempts + 1);
      
      // Exponential backoff
      const delay = (strategy.delay || 1000) * Math.pow(2, attempts);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return true; // Signal to retry the operation
    }
    
    // Max retries exceeded, fall back to report
    this.retryCount.delete(key);
    await this.executeReport(error, context);
    return false;
  }
  
  private static executeFallback(fallbackValue: unknown): unknown {
    return fallbackValue || null;
  }
  
  private static async executeReset(context: ErrorContext): Promise<void> {
    // Clear component state and restart
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('component:reset', {
        detail: { component: context.component }
      });
      window.dispatchEvent(event);
    }
  }
  
  private static async executeReport(
    error: Error,
    context: ErrorContext
  ): Promise<void> {
    console.error('Unrecoverable error:', {
      error: error.message,
      stack: error.stack,
      context
    });
    
    // In production, this would create a support ticket
    if (process.env.NODE_ENV === 'production') {
      await this.createSupportTicket(error, context);
    }
  }
  
  private static async reportToMonitoring(
    error: Error,
    context: ErrorContext
  ): Promise<void> {
    // Report to multiple monitoring services for redundancy
    const promises = [
      this.reportToSentry(error, context),
      this.reportToApplicationInsights(error, context),
      this.reportToOpenTelemetry(error, context)
    ];
    
    // Don't let monitoring failures affect the app
    await Promise.allSettled(promises);
  }
  
  private static async reportToSentry(error: Error, context: ErrorContext): Promise<void> {
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          component: context.component,
          action: context.action
        },
        extra: context.metadata
      });
    }
  }
  
  private static async reportToApplicationInsights(
    error: Error,
    context: ErrorContext
  ): Promise<void> {
    if (typeof window !== 'undefined' && window.appInsights) {
      window.appInsights.trackException({
        exception: error,
        properties: {
          component: context.component,
          action: context.action,
          ...context.metadata
        }
      });
    }
  }
  
  private static async reportToOpenTelemetry(
    _error: Error,
    _context: ErrorContext
  ): Promise<void> {
    // OpenTelemetry implementation
    // This would send traces to your observability backend
  }
  
  private static async createSupportTicket(
    _error: Error,
    _context: ErrorContext
  ): Promise<void> {
    // Auto-create support ticket for critical errors
    // This would integrate with your ticketing system
  }
  
  /**
   * Gets error recovery recommendations based on error type
   */
  static getRecoveryStrategy(error: Error): RecoveryStrategy {
    // Network errors - retry with backoff
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return { type: 'retry', maxAttempts: 3, delay: 1000 };
    }
    
    // Validation errors - use fallback
    if (error.name === 'ValidationError') {
      return { type: 'fallback', fallbackValue: null };
    }
    
    // State corruption - reset component
    if (error.name === 'StateError') {
      return { type: 'reset' };
    }
    
    // Default - report the error
    return { type: 'report' };
  }
  
  /**
   * Checks system health and preemptively fixes issues
   */
  static async performHealthCheck(): Promise<void> {
    const checks = [
      this.checkMemoryUsage(),
      this.checkStorageQuota(),
      this.checkNetworkConnectivity(),
      this.checkServiceWorkerStatus()
    ];
    
    const results = await Promise.allSettled(checks);
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn(`Health check ${index} failed:`, result.reason);
      }
    });
  }
  
  private static async checkMemoryUsage(): Promise<void> {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      if (usageRatio > 0.9) {
        // Memory pressure detected, trigger cleanup
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('memory:pressure'));
        }
      }
    }
  }
  
  private static async checkStorageQuota(): Promise<void> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usageRatio = (estimate.usage || 0) / (estimate.quota || 1);
      
      if (usageRatio > 0.8) {
        // Storage nearly full, cleanup old data
        await this.cleanupOldData();
      }
    }
  }
  
  private static async checkNetworkConnectivity(): Promise<void> {
    if (!navigator.onLine) {
      throw new Error('Network offline');
    }
  }
  
  private static async checkServiceWorkerStatus(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration || !registration.active) {
        // Re-register service worker
        await navigator.serviceWorker.register('/sw.js');
      }
    }
  }
  
  private static async cleanupOldData(): Promise<void> {
    // Implement data cleanup logic
    // Remove old cached data, compress logs, etc.
  }
}

// Global window declarations for monitoring services
declare global {
  interface Window {
    Sentry: any;
    appInsights: any;
  }
}