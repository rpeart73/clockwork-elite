import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import AppErrorBoundary from './shared/errors/AppErrorBoundary';
import MainPage from './presentation/pages/MainPage';
import './App.css';

function App() {
  return (
    <ErrorBoundary FallbackComponent={AppErrorBoundary}>
      <div className="app-container">
        <MainPage />
      </div>
    </ErrorBoundary>
  );
}

export default App;