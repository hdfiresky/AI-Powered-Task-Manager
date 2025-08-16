
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4 transition-opacity duration-300 ease-in-out" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} transform transition-all duration-300 ease-out animate-modalShow flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()} 
      >
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
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
