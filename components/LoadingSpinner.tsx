/**
 * @file LoadingSpinner.tsx
 * @description A simple, reusable loading spinner component for indicating asynchronous operations.
 */

import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      {/* This div creates the spinner effect using Tailwind CSS animation and border utilities. */}
      {/* `animate-spin` provides the rotation. */}
      {/* `border-t-4` and `border-b-4` create the visible parts of the spinner. */}
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-500"></div>
    </div>
  );
};

export default LoadingSpinner;
