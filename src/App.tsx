import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import AppErrorBoundary from './shared/errors/AppErrorBoundary';
import MainPage from './presentation/pages/MainPage';
import { KeyboardShortcutsHelp } from './presentation/components/KeyboardShortcutsHelp';
import { ResilientApp } from './shared/components/ResilientApp';
import './modules/keyboard-navigation';
import './modules/error-prevention'; // Auto-initializes
import './App.css';

function App() {
  console.log('🎯 App component rendering...');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  useEffect(() => {
    // Global keyboard shortcut for help
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        setShowKeyboardHelp(true);
      } else if (e.key === 'Escape' && showKeyboardHelp) {
        setShowKeyboardHelp(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showKeyboardHelp]);

  // Temporarily simplified render for debugging
  return (
    <div style={{ padding: '20px', background: '#667eea', color: 'white', minHeight: '100vh' }}>
      <h1>Clockwork Elite - Debug Mode</h1>
      <p>If you can see this, React is working!</p>
      <ResilientApp>
        <ErrorBoundary FallbackComponent={AppErrorBoundary}>
          <div className="app-container">
            <MainPage />
            <KeyboardShortcutsHelp 
              isOpen={showKeyboardHelp}
              onClose={() => setShowKeyboardHelp(false)}
            />
          </div>
        </ErrorBoundary>
      </ResilientApp>
    </div>
  );
}

export default App;