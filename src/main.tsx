import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppWrapper from './App.tsx'

// Get the root element
const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    
    root.render(
      <StrictMode>
        <AppWrapper /> 
      </StrictMode>,
    );
  } catch (error) {
    console.error('Error during rendering:', error);
  }
} else {
  console.error('Root element not found');
}
