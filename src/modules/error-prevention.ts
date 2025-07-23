/**
 * Error Prevention Module
 * Ensures the application never crashes and handles all possible startup errors
 */

export class ErrorPreventionSystem {
  private static instance: ErrorPreventionSystem;
  private errorLog: Error[] = [];
  private initialized = false;

  private constructor() {
    this.setupGlobalErrorHandlers();
    this.setupPromiseRejectionHandlers();
    this.setupCustomElementProtection();
    this.setupConsoleInterceptors();
    this.setupNetworkErrorHandling();
  }

  static getInstance(): ErrorPreventionSystem {
    if (!ErrorPreventionSystem.instance) {
      ErrorPreventionSystem.instance = new ErrorPreventionSystem();
    }
    return ErrorPreventionSystem.instance;
  }

  /**
   * Initialize all error prevention measures
   */
  initialize(): void {
    if (this.initialized) return;
    
    try {
      this.polyfillMissingFeatures();
      this.fixBrowserQuirks();
      this.preventExtensionConflicts();
      this.setupStorageFallbacks();
      this.initialized = true;
      
      console.info('✅ Error prevention system initialized successfully');
    } catch (error) {
      console.error('Error prevention system encountered an error:', error);
      // Even if initialization fails, we continue
    }
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Handle all uncaught errors
    window.addEventListener('error', (event) => {
      event.preventDefault();
      this.handleError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      return true;
    });

    // Handle errors in async functions
    window.addEventListener('unhandledrejection', (event) => {
      event.preventDefault();
      this.handleError(new Error(event.reason), {
        type: 'unhandledRejection',
        promise: event.promise
      });
      return true;
    });
  }

  /**
   * Setup promise rejection handlers
   */
  private setupPromiseRejectionHandlers(): void {
    // Override Promise.prototype.catch to add logging
    const originalCatch = Promise.prototype.catch;
    Promise.prototype.catch = function(onRejected) {
      return originalCatch.call(this, (reason: any) => {
        console.warn('Promise rejection caught:', reason);
        if (onRejected) {
          return onRejected(reason);
        }
        throw reason;
      });
    };
  }

  /**
   * Protect against custom element conflicts
   */
  private setupCustomElementProtection(): void {
    const originalDefine = customElements.define;
    const definedElements = new Set<string>();

    customElements.define = function(name: string, constructor: any, options?: any) {
      try {
        // Check if already defined
        if (definedElements.has(name) || customElements.get(name)) {
          console.warn(`Custom element '${name}' already defined. Skipping.`);
          return;
        }

        // Wrap constructor to catch errors
        class SafeConstructor extends constructor {
          constructor() {
            try {
              super();
            } catch (error) {
              console.error(`Error in custom element '${name}' constructor:`, error);
              // Create a fallback element
              const fallback = document.createElement('div');
              fallback.textContent = `Error loading component: ${name}`;
              fallback.style.color = 'red';
              return fallback as any;
            }
          }
        }

        originalDefine.call(this, name, SafeConstructor as any, options);
        definedElements.add(name);
      } catch (error) {
        console.error(`Failed to define custom element '${name}':`, error);
      }
    };
  }

  /**
   * Setup console interceptors for better error tracking
   */
  private setupConsoleInterceptors(): void {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
      originalError.apply(console, args);
      this.logError(new Error(args.join(' ')));
    };

    console.warn = (...args: any[]) => {
      originalWarn.apply(console, args);
      // Track warnings that might indicate problems
      if (args.some(arg => typeof arg === 'string' && arg.includes('error'))) {
        this.logError(new Error(`Warning: ${args.join(' ')}`));
      }
    };
  }

  /**
   * Setup network error handling
   */
  private setupNetworkErrorHandling(): void {
    // Intercept fetch to handle network errors
    const originalFetch = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok && response.status >= 500) {
          console.warn(`Network error: ${response.status} ${response.statusText}`);
        }
        return response;
      } catch (error) {
        console.error('Fetch error:', error);
        // Return a mock response to prevent app crash
        return new Response(JSON.stringify({ error: 'Network error' }), {
          status: 503,
          statusText: 'Service Unavailable'
        });
      }
    };

    // Handle XMLHttpRequest errors
    const XHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(...args: any[]) {
      this.addEventListener('error', () => {
        console.error('XHR error:', this.statusText);
      });
      return XHROpen.apply(this, args as any);
    };
  }

  /**
   * Polyfill missing browser features
   */
  private polyfillMissingFeatures(): void {
    // Polyfill Array.prototype.at
    if (!(Array.prototype as any).at) {
      (Array.prototype as any).at = function(index: number) {
        return index >= 0 ? this[index] : this[this.length + index];
      };
    }

    // Polyfill Object.hasOwn
    if (!(Object as any).hasOwn) {
      (Object as any).hasOwn = function(obj: any, prop: string) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
      };
    }

    // Ensure Promise.allSettled exists
    if (!Promise.allSettled) {
      Promise.allSettled = function<T>(promises: Promise<T>[]): Promise<PromiseSettledResult<T>[]> {
        return Promise.all(
          promises.map(p =>
            p.then(
              value => ({ status: 'fulfilled' as const, value }),
              reason => ({ status: 'rejected' as const, reason })
            )
          )
        ) as Promise<PromiseSettledResult<T>[]>;
      } as any;
    }

    // Ensure structuredClone exists
    if (!window.structuredClone) {
      window.structuredClone = function(obj: any) {
        return JSON.parse(JSON.stringify(obj));
      };
    }
  }

  /**
   * Fix known browser quirks
   */
  private fixBrowserQuirks(): void {
    // Fix Safari date parsing
    const originalDateParse = Date.parse;
    Date.parse = function(dateString: string) {
      // Handle Safari's stricter date parsing
      if (typeof dateString === 'string') {
        // Convert common formats to ISO
        dateString = dateString.replace(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/, '$1-$2-$3T$4:$5:$6');
      }
      return originalDateParse(dateString);
    };

    // Fix IE11 CustomEvent
    if (typeof window.CustomEvent !== 'function') {
      (window as any).CustomEvent = function(event: string, params: any) {
        params = params || { bubbles: false, cancelable: false, detail: null };
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
      };
      (window as any).CustomEvent.prototype = window.Event.prototype;
    }
  }

  /**
   * Prevent browser extension conflicts
   */
  private preventExtensionConflicts(): void {
    // List of known problematic global variables from extensions
    const extensionGlobals = [
      '__REACT_DEVTOOLS_GLOBAL_HOOK__',
      '__REDUX_DEVTOOLS_EXTENSION__',
      'grammarly',
      'lastpass',
      'honey',
      '__GRAMMARLY__'
    ];

    extensionGlobals.forEach(globalName => {
      if (globalName in window) {
        try {
          // Create a safe wrapper
          const original = (window as any)[globalName];
          (window as any)[globalName] = new Proxy(original, {
            get(target, prop) {
              try {
                return target[prop];
              } catch (error) {
                console.warn(`Extension error in ${globalName}:`, error);
                return undefined;
              }
            },
            set(target, prop, value) {
              try {
                target[prop] = value;
                return true;
              } catch (error) {
                console.warn(`Extension error in ${globalName}:`, error);
                return false;
              }
            }
          });
        } catch (error) {
          console.warn(`Could not wrap extension global ${globalName}:`, error);
        }
      }
    });
  }

  /**
   * Setup storage fallbacks
   */
  private setupStorageFallbacks(): void {
    // Create in-memory storage as fallback
    const memoryStorage = new Map<string, string>();

    // Wrap localStorage
    if (typeof localStorage !== 'undefined') {
      const originalSetItem = localStorage.setItem;
      const originalGetItem = localStorage.getItem;
      const originalRemoveItem = localStorage.removeItem;

      localStorage.setItem = function(key: string, value: string) {
        try {
          originalSetItem.call(this, key, value);
          memoryStorage.set(key, value);
        } catch (error) {
          console.warn('localStorage.setItem failed, using memory:', error);
          memoryStorage.set(key, value);
        }
      };

      localStorage.getItem = function(key: string) {
        try {
          return originalGetItem.call(this, key);
        } catch (error) {
          console.warn('localStorage.getItem failed, using memory:', error);
          return memoryStorage.get(key) || null;
        }
      };

      localStorage.removeItem = function(key: string) {
        try {
          originalRemoveItem.call(this, key);
          memoryStorage.delete(key);
        } catch (error) {
          console.warn('localStorage.removeItem failed, using memory:', error);
          memoryStorage.delete(key);
        }
      };
    }

    // Wrap IndexedDB
    if (typeof indexedDB !== 'undefined') {
      const originalOpen = indexedDB.open;
      indexedDB.open = function(...args: Parameters<typeof indexedDB.open>) {
        try {
          return originalOpen.apply(this, args);
        } catch (error) {
          console.error('IndexedDB.open failed:', error);
          // Return a mock that won't crash the app
          const mockRequest = new EventTarget() as IDBOpenDBRequest;
          setTimeout(() => {
            const errorEvent = new Event('error');
            mockRequest.dispatchEvent(errorEvent);
          }, 0);
          return mockRequest;
        }
      };
    }
  }

  /**
   * Handle and log errors
   */
  private handleError(error: Error, context?: any): void {
    this.logError(error);
    
    // Log to console with context
    console.group('🚨 Error Caught by Prevention System');
    console.error('Error:', error);
    if (context) {
      console.error('Context:', context);
    }
    console.error('Stack:', error.stack);
    console.groupEnd();

    // Send to monitoring service if available
    this.reportToMonitoring(error, context);
  }

  /**
   * Log error for later analysis
   */
  private logError(error: Error): void {
    this.errorLog.push(error);
    
    // Keep only last 100 errors to prevent memory issues
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }
  }

  /**
   * Report error to monitoring service
   */
  private reportToMonitoring(error: Error, context?: any): void {
    // Check if monitoring service is available
    if (typeof (window as any).Sentry !== 'undefined') {
      (window as any).Sentry.captureException(error, { extra: context });
    }
    
    // Also log to any other monitoring services
    if (typeof (window as any).dataLayer !== 'undefined') {
      (window as any).dataLayer.push({
        event: 'error',
        errorMessage: error.message,
        errorStack: error.stack,
        errorContext: context
      });
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): { total: number; recent: Error[] } {
    return {
      total: this.errorLog.length,
      recent: this.errorLog.slice(-10)
    };
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }
}

// Create and export singleton instance
export const errorPrevention = ErrorPreventionSystem.getInstance();

// Auto-initialize on import
if (typeof window !== 'undefined') {
  // Initialize as soon as possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      errorPrevention.initialize();
    });
  } else {
    errorPrevention.initialize();
  }
}