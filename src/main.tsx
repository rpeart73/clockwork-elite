import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { startupValidator, displayValidationResults, createValidationUI } from './modules/startup-validation';
import { errorPrevention } from './modules/error-prevention';
import './index.css';

/**
 * Safe application initialization with multiple fallbacks
 */
async function initializeApp(): Promise<void> {
  console.log('🚀 Initializing Clockwork Elite...');
  
  try {
    // Initialize error prevention first
    errorPrevention.initialize();
    
    // Run startup validation (temporarily simplified)
    console.log('🔍 Running startup validation...');
    try {
      const validationResults = await startupValidator.validateEnvironment();
      displayValidationResults(validationResults);
      
      // Show validation UI if there are issues
      const validationUI = createValidationUI(validationResults);
      if (validationUI) {
        document.body.appendChild(validationUI);
      }
    } catch (validationError) {
      console.error('Validation error (non-blocking):', validationError);
      // Continue anyway - validation should not block app startup
    }
    
    // Get root element with fallback
    let rootElement = document.getElementById('root');
    if (!rootElement) {
      console.warn('Root element not found, creating one');
      rootElement = document.createElement('div');
      rootElement.id = 'root';
      document.body.appendChild(rootElement);
    }
    
    // Create React root with error handling
    try {
      console.log('📦 Creating React root...');
      const root = ReactDOM.createRoot(rootElement);
      console.log('🎨 Rendering React app...');
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      console.log('✅ React app rendered successfully!');
    } catch (renderError) {
      console.error('React render failed, attempting fallback:', renderError);
      
      // Fallback: render a simple error message
      rootElement.innerHTML = `
        <div style="
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          text-align: center;
          padding: 20px;
        ">
          <div style="
            background: rgba(255, 255, 255, 0.95);
            color: #333;
            padding: 40px;
            border-radius: 12px;
            max-width: 500px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          ">
            <h1 style="margin: 0 0 20px 0;">Loading Error</h1>
            <p style="margin: 0 0 20px 0;">
              The application failed to load properly. 
              Please refresh the page or try a different browser.
            </p>
            <button onclick="window.location.reload()" style="
              padding: 12px 24px;
              background: #667eea;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 16px;
              cursor: pointer;
            ">
              Refresh Page
            </button>
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Fatal initialization error:', error);
    
    // Last resort fallback
    document.body.innerHTML = `
      <div style="padding: 20px; font-family: monospace;">
        <h1>Critical Error</h1>
        <p>The application could not start. Error: ${error}</p>
        <p>Please contact support if this persists.</p>
        <button onclick="window.location.reload()">Try Again</button>
      </div>
    `;
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Prevent the app from completely crashing on any error
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection caught:', event.reason);
  event.preventDefault();
});