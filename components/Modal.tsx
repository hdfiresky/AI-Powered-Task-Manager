/**
 * @file Modal.tsx
 * @description A generic, reusable modal component. It provides the basic structure for a modal dialog,
 * including an overlay, a close button, and a title. The content is passed as children.
 */

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

/**
 * @interface ModalProps
 * @description Defines the props for the generic Modal component.
 */
interface ModalProps {
  isOpen: boolean;        // Controls whether the modal is visible.
  onClose: () => void;      // Callback function to close the modal.
  title: string;          // The title to be displayed in the modal header.
  children: React.ReactNode; // The content to be rendered inside the modal body.
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'; // Optional size prop to control the modal width.
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  // If the modal is not open, render nothing.
  if (!isOpen) return null;

  // A mapping of size props to Tailwind CSS max-width classes.
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    // Modal Overlay: A fixed-position div that covers the entire screen.
    // Clicking the overlay will trigger the `onClose` callback.
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4 transition-opacity duration-300 ease-in-out" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
    >
      {/* Modal Container: The main modal window. */}
      {/* `e.stopPropagation()` prevents a click inside the modal from bubbling up to the overlay and closing it. */}
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} transform transition-all duration-300 ease-out animate-modalShow flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-200">
          <h2 id="modal-title" className="text-xl font-semibold text-slate-800">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Modal Body: This is where the `children` prop is rendered. */}
        {/* It's scrollable if the content exceeds the available height. */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
