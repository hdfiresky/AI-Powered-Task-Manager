/**
 * @file index.tsx
 * @description The entry point for the React application.
 * This file is responsible for finding the root HTML element and rendering the main <App /> component into it.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Find the root element in the public/index.html file where the React app will be mounted.
const rootElement = document.getElementById('root');

// Ensure the root element exists before trying to render the app. This is a safeguard.
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create a React root, which is the modern way to render a React application.
const root = ReactDOM.createRoot(rootElement);

// Render the main App component wrapped in StrictMode.
// React.StrictMode is a tool for highlighting potential problems in an application.
// It activates additional checks and warnings for its descendants.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
