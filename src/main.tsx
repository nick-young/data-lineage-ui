import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { ReactFlowProvider } from 'reactflow';
import AppWrapper from './App';
import './index.css';

// Use ReactDOM.createRoot correctly
ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReactFlowProvider> 
      <AppWrapper />
    </ReactFlowProvider>
  </StrictMode>,
);
