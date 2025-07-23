/**
 * Startup Validation Module
 * Checks for common issues before application starts
 */

export interface ValidationResult {
  passed: boolean;
  warnings: ValidationIssue[];
  errors: ValidationIssue[];
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  category: IssueCategory;
  message: string;
  suggestion?: string;
}

export type IssueCategory = 
  | 'browser-extension'
  | 'environment'
  | 'browser-compatibility'
  | 'storage'
  | 'network'
  | 'security';

class StartupValidator {
  private validationResults: ValidationResult = {
    passed: true,
    warnings: [],
    errors: []
  };

  /**
   * Run all validation checks
   */
  async validateEnvironment(): Promise<ValidationResult> {
    await this.checkBrowserExtensions();
    await this.checkEnvironmentType();
    await this.checkBrowserCompatibility();
    await this.checkStorageAvailability();
    await this.checkSecurityHeaders();
    await this.checkNetworkConnectivity();

    // Determine if validation passed (no errors)
    this.validationResults.passed = this.validationResults.errors.length === 0;

    return this.validationResults;
  }

  /**
   * Check for conflicting browser extensions
   */
  private async checkBrowserExtensions(): Promise<void> {
    // Check for known conflicting custom elements
    const conflictingElements = [
      'mce-autosize-textarea',
      'grammarly-extension',
      'lastpass-field',
      'honey-extension'
    ];

    conflictingElements.forEach(elementName => {
      try {
        if (customElements.get(elementName)) {
          this.addWarning({
            category: 'browser-extension',
            message: `Browser extension detected: ${elementName}`,
            suggestion: 'This extension may interfere with form inputs. Consider disabling it for this site if you experience issues.'
          });
        }
      } catch (error) {
        // Element not registered, which is good
      }
    });

    // Check for extension indicators in the DOM
    const extensionIndicators = [
      { selector: '[id*="grammarly"]', name: 'Grammarly' },
      { selector: '[id*="lastpass"]', name: 'LastPass' },
      { selector: '[id*="honey"]', name: 'Honey' },
      { selector: '[id*="adblock"]', name: 'AdBlock' }
    ];

    extensionIndicators.forEach(({ selector, name }) => {
      if (document.querySelector(selector)) {
        this.addWarning({
          category: 'browser-extension',
          message: `${name} extension detected`,
          suggestion: 'This extension may affect performance or functionality.'
        });
      }
    });
  }

  /**
   * Check if running in development or production
   */
  private async checkEnvironmentType(): Promise<void> {
    const isDevelopment = import.meta.env.DEV;
    const isProduction = import.meta.env.PROD;
    const mode = import.meta.env.MODE;

    // Check for mixed environment indicators
    if (window.location.hostname === 'localhost' && isProduction) {
      this.addWarning({
        category: 'environment',
        message: 'Production build running on localhost',
        suggestion: 'This appears to be a local preview of the production build.'
      });
    }

    // Check if trying to load dev resources in production
    if (isProduction && document.querySelector('script[src*="/src/"]')) {
      this.addError({
        category: 'environment',
        message: 'Development resources referenced in production',
        suggestion: 'Ensure index.html is using production build paths.'
      });
    }

    // Log environment info
    console.info('Environment:', {
      mode,
      isDevelopment,
      isProduction,
      hostname: window.location.hostname,
      protocol: window.location.protocol
    });
  }

  /**
   * Check browser compatibility
   */
  private async checkBrowserCompatibility(): Promise<void> {
    const requiredFeatures = [
      { feature: 'localStorage', test: () => typeof localStorage !== 'undefined' },
      { feature: 'IndexedDB', test: () => typeof indexedDB !== 'undefined' },
      { feature: 'Custom Elements', test: () => typeof customElements !== 'undefined' },
      { feature: 'Service Worker', test: () => 'serviceWorker' in navigator },
      { feature: 'Clipboard API', test: () => 'clipboard' in navigator }
    ];

    requiredFeatures.forEach(({ feature, test }) => {
      if (!test()) {
        this.addError({
          category: 'browser-compatibility',
          message: `Missing required feature: ${feature}`,
          suggestion: 'Please use a modern browser (Chrome, Firefox, Safari, or Edge).'
        });
      }
    });

    // Check browser version
    const userAgent = navigator.userAgent;
    const isIE = /MSIE|Trident/.test(userAgent);
    
    if (isIE) {
      this.addError({
        category: 'browser-compatibility',
        message: 'Internet Explorer is not supported',
        suggestion: 'Please use a modern browser for the best experience.'
      });
    }
  }

  /**
   * Check storage availability and quotas
   */
  private async checkStorageAvailability(): Promise<void> {
    // Check localStorage
    try {
      const testKey = '__clockwork_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (error) {
      this.addError({
        category: 'storage',
        message: 'localStorage is not available',
        suggestion: 'Check if cookies are enabled or if running in private/incognito mode.'
      });
    }

    // Check IndexedDB
    try {
      const request = indexedDB.open('__clockwork_test__', 1);
      request.onsuccess = () => {
        const db = request.result;
        db.close();
        indexedDB.deleteDatabase('__clockwork_test__');
      };
    } catch (error) {
      this.addError({
        category: 'storage',
        message: 'IndexedDB is not available',
        suggestion: 'Check browser settings or storage permissions.'
      });
    }

    // Check storage quota
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const percentUsed = estimate.usage && estimate.quota 
          ? (estimate.usage / estimate.quota) * 100 
          : 0;

        if (percentUsed > 90) {
          this.addWarning({
            category: 'storage',
            message: `Storage is ${percentUsed.toFixed(1)}% full`,
            suggestion: 'Consider clearing browser data to free up space.'
          });
        }
      } catch (error) {
        // Storage estimate not available
      }
    }
  }

  /**
   * Check security headers and HTTPS
   */
  private async checkSecurityHeaders(): Promise<void> {
    // Check HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      this.addWarning({
        category: 'security',
        message: 'Application not served over HTTPS',
        suggestion: 'HTTPS is recommended for security and PWA features.'
      });
    }

    // Check for mixed content
    if (window.location.protocol === 'https:') {
      const insecureElements = document.querySelectorAll(
        'img[src^="http:"], script[src^="http:"], link[href^="http:"]'
      );
      
      if (insecureElements.length > 0) {
        this.addError({
          category: 'security',
          message: 'Mixed content detected (HTTP resources on HTTPS page)',
          suggestion: 'Update all resource URLs to use HTTPS.'
        });
      }
    }
  }

  /**
   * Check network connectivity
   */
  private async checkNetworkConnectivity(): Promise<void> {
    if (!navigator.onLine) {
      this.addWarning({
        category: 'network',
        message: 'No internet connection detected',
        suggestion: 'The application works offline but some features may be limited.'
      });
    }

    // Check service worker registration
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration && import.meta.env.PROD) {
          this.addWarning({
            category: 'network',
            message: 'Service Worker not registered',
            suggestion: 'Offline functionality may be limited.'
          });
        }
      } catch (error) {
        // Service worker check failed
      }
    }
  }

  /**
   * Add a warning to the validation results
   */
  private addWarning(issue: Omit<ValidationIssue, 'type'>): void {
    this.validationResults.warnings.push({
      ...issue,
      type: 'warning'
    });
  }

  /**
   * Add an error to the validation results
   */
  private addError(issue: Omit<ValidationIssue, 'type'>): void {
    this.validationResults.errors.push({
      ...issue,
      type: 'error'
    });
  }
}

// Create singleton instance
export const startupValidator = new StartupValidator();

/**
 * Display validation results to user
 */
export function displayValidationResults(results: ValidationResult): void {
  if (!results.passed || results.warnings.length > 0) {
    console.group('🔍 Clockwork Elite Startup Validation');
    
    if (results.errors.length > 0) {
      console.error('❌ Errors found:');
      results.errors.forEach(error => {
        console.error(`  • ${error.message}`);
        if (error.suggestion) {
          console.error(`    💡 ${error.suggestion}`);
        }
      });
    }
    
    if (results.warnings.length > 0) {
      console.warn('⚠️ Warnings:');
      results.warnings.forEach(warning => {
        console.warn(`  • ${warning.message}`);
        if (warning.suggestion) {
          console.warn(`    💡 ${warning.suggestion}`);
        }
      });
    }
    
    console.groupEnd();
  } else {
    console.info('✅ Clockwork Elite startup validation passed');
  }
}

/**
 * Create a user-friendly error display
 */
export function createValidationUI(results: ValidationResult): HTMLElement | null {
  if (results.passed && results.warnings.length === 0) {
    return null;
  }

  const container = document.createElement('div');
  container.className = 'startup-validation-banner';
  container.innerHTML = `
    <style>
      .startup-validation-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: ${results.errors.length > 0 ? '#fee' : '#ffeaa7'};
        border-bottom: 2px solid ${results.errors.length > 0 ? '#e74c3c' : '#fdcb6e'};
        padding: 12px 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        z-index: 9999;
        animation: slideDown 0.3s ease;
      }
      
      @keyframes slideDown {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
      }
      
      .validation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      
      .validation-title {
        font-weight: 600;
        color: ${results.errors.length > 0 ? '#c0392b' : '#f39c12'};
      }
      
      .validation-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        opacity: 0.5;
        transition: opacity 0.2s;
      }
      
      .validation-close:hover {
        opacity: 1;
      }
      
      .validation-issues {
        margin: 0;
        padding-left: 20px;
      }
      
      .validation-issue {
        margin: 4px 0;
        color: #2c3e50;
      }
      
      .validation-suggestion {
        font-size: 12px;
        color: #7f8c8d;
        margin-left: 20px;
      }
    </style>
    
    <div class="validation-header">
      <div class="validation-title">
        ${results.errors.length > 0 ? '⚠️ Startup Issues Detected' : 'ℹ️ Startup Warnings'}
      </div>
      <button class="validation-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
    
    <ul class="validation-issues">
      ${results.errors.map(error => `
        <li class="validation-issue">
          ${error.message}
          ${error.suggestion ? `<div class="validation-suggestion">💡 ${error.suggestion}</div>` : ''}
        </li>
      `).join('')}
      ${results.warnings.slice(0, 3).map(warning => `
        <li class="validation-issue">
          ${warning.message}
          ${warning.suggestion ? `<div class="validation-suggestion">💡 ${warning.suggestion}</div>` : ''}
        </li>
      `).join('')}
    </ul>
  `;

  return container;
}