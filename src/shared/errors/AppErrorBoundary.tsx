import React from 'react';
import { FallbackProps } from 'react-error-boundary';

const AppErrorBoundary: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="error-boundary">
      <div className="error-content">
        <h2>Oops! Something went wrong</h2>
        <p>We're sorry for the inconvenience. The application encountered an error.</p>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="error-details">
            <summary>Error Details</summary>
            <pre>{error.message}</pre>
            <pre>{error.stack}</pre>
          </details>
        )}
        
        <div className="error-actions">
          <button onClick={resetErrorBoundary} className="btn-primary">
            Try Again
          </button>
          <button onClick={() => window.location.reload()} className="btn-secondary">
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppErrorBoundary;

const styles = `
  .error-boundary {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;
  }

  .error-content {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .error-content h2 {
    color: #e53e3e;
    margin-bottom: 1rem;
  }

  .error-content p {
    color: #4a5568;
    margin-bottom: 1.5rem;
  }

  .error-details {
    background: #f7fafc;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    text-align: left;
  }

  .error-details summary {
    cursor: pointer;
    color: #667eea;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .error-details pre {
    margin: 0.5rem 0;
    padding: 0.5rem;
    background: #edf2f7;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.875rem;
  }

  .error-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .error-actions button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .error-actions .btn-primary {
    background: #667eea;
    color: white;
  }

  .error-actions .btn-primary:hover {
    background: #5a67d8;
  }

  .error-actions .btn-secondary {
    background: #e2e8f0;
    color: #4a5568;
  }

  .error-actions .btn-secondary:hover {
    background: #cbd5e0;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}