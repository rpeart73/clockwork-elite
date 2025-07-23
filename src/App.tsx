import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import AppErrorBoundary from './shared/errors/AppErrorBoundary';
import MainPage from './presentation/pages/MainPage';
import { KeyboardShortcutsHelp } from './presentation/components/KeyboardShortcutsHelp';
import './modules/keyboard-navigation';
import './App.css';

function App() {
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

  return (
    <ErrorBoundary FallbackComponent={AppErrorBoundary}>
      <div className="app-container">
        <MainPage />
        <KeyboardShortcutsHelp 
          isOpen={showKeyboardHelp}
          onClose={() => setShowKeyboardHelp(false)}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;