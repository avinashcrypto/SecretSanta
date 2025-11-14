// Import polyfills first for Node.js modules compatibility
import './polyfills';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Web3Provider } from './providers/Web3Provider';
import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Web3Provider>
        <App />
      </Web3Provider>
    </ErrorBoundary>
  </StrictMode>
);
