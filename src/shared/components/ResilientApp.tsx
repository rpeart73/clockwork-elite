import React, { Component, ReactNode } from 'react';
import './ResilientApp.css';

interface ResilientAppProps {
  children: ReactNode;
}

interface ResilientAppState {
  hasError: boolean;
  errorCount: number;
  lastError: Error | null;
  isRecovering: boolean;
}

/**
 * Ultimate error boundary that ensures the app never fully crashes
 */
export class ResilientApp extends Component<ResilientAppProps, ResilientAppState> {
  private retryTimeout: NodeJS.Timeout | null = null;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 2000;

  constructor(props: ResilientAppProps) {
    super(props);
    this.state = {
      hasError: false,
      errorCount: 0,
      lastError: null,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ResilientAppState> {
    return {
      hasError: true,
      lastError: error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ResilientApp caught error:', error);
    console.error('Error info:', errorInfo);
    
    // Log to monitoring
    this.logErrorToMonitoring(error, errorInfo);
    
    // Increment error count
    this.setState(prevState => ({
      errorCount: prevState.errorCount + 1
    }));
    
    // Auto-recover after a delay
    this.scheduleRecovery();
  }

  componentWillUnmount(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private scheduleRecovery(): void {
    if (this.state.errorCount < this.MAX_RETRIES) {
      this.setState({ isRecovering: true });
      
      this.retryTimeout = setTimeout(() => {
        console.log('Attempting automatic recovery...');
        this.setState({
          hasError: false,
          isRecovering: false
        });
      }, this.RETRY_DELAY);
    }
  }

  private logErrorToMonitoring(error: Error, errorInfo: React.ErrorInfo): void {
    // Send to Sentry if available
    if (typeof (window as any).Sentry !== 'undefined') {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    }
    
    // Store in session storage for debugging
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      };
      
      const existingLogs = sessionStorage.getItem('clockwork_errors');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(errorLog);
      
      // Keep only last 10 errors
      if (logs.length > 10) {
        logs.shift();
      }
      
      sessionStorage.setItem('clockwork_errors', JSON.stringify(logs));
    } catch (e) {
      // Even error logging failed, but we continue
    }
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      errorCount: 0,
      lastError: null,
      isRecovering: false
    });
    
    // Clear any cached state that might be corrupted
    this.clearCorruptedState();
  };

  private clearCorruptedState(): void {
    try {
      // Clear specific app state while preserving user data
      const keysToPreserve = ['user_preferences', 'auth_token'];
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (key.startsWith('clockwork_') && !keysToPreserve.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      // Reload the page for a fresh start
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear state:', error);
    }
  }

  private renderErrorFallback(): ReactNode {
    const { errorCount, lastError, isRecovering } = this.state;
    
    return (
      <div className="resilient-app-error">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          
          <h1>Oops! Something went wrong</h1>
          
          {isRecovering ? (
            <div className="recovering">
              <div className="spinner"></div>
              <p>Attempting automatic recovery...</p>
            </div>
          ) : (
            <>
              <p className="error-message">
                {errorCount >= this.MAX_RETRIES
                  ? "We've tried to recover automatically but the issue persists."
                  : "Don't worry, we're working on fixing this."}
              </p>
              
              {lastError && (
                <details className="error-details">
                  <summary>Technical Details</summary>
                  <pre>{lastError.message}</pre>
                </details>
              )}
              
              <div className="error-actions">
                <button onClick={this.handleReset} className="btn-primary">
                  Reset Application
                </button>
                
                <button 
                  onClick={() => window.location.href = '/'}
                  className="btn-secondary"
                >
                  Go to Home
                </button>
              </div>
              
              <div className="error-suggestions">
                <h3>Suggestions:</h3>
                <ul>
                  <li>Try refreshing the page</li>
                  <li>Clear your browser cache</li>
                  <li>Disable browser extensions</li>
                  <li>Try a different browser</li>
                </ul>
              </div>
            </>
          )}
        </div>
        
        <div className="error-footer">
          <p>Error ID: {this.generateErrorId()}</p>
          <p>If the problem persists, please contact support.</p>
        </div>
      </div>
    );
  }

  private generateErrorId(): string {
    return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.renderErrorFallback();
    }
    
    return this.props.children;
  }
}

/**
 * Higher-order component to wrap any component with resilience
 */
export function withResilience<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return (props: P) => (
    <ResilientApp>
      <Component {...props} />
    </ResilientApp>
  );
}