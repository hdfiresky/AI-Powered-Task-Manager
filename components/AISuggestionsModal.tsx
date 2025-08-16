
import React from 'react';
import Modal from './Modal';
import { AISubTaskSuggestion } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { CheckCircleIcon, ExclamationTriangleIcon, LightBulbIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface AISuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: AISubTaskSuggestion[];
  originalTaskTitle?: string;
  isLoading: boolean;
  error: string | null;
  onAddSuggestedTasks: (suggestions: AISubTaskSuggestion[]) => void;
}

const AISuggestionsModal: React.FC<AISuggestionsModalProps> = ({
  isOpen,
  onClose,
  suggestions,
  originalTaskTitle,
  isLoading,
  error,
  onAddSuggestedTasks,
}) => {
  const handleAddTasks = () => {
    onAddSuggestedTasks(suggestions);
  };

  const modalTitle = error && !isLoading ? "AI Error" : (isLoading ? "AI Thinking..." : "AI Sub-task Suggestions");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg">
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
          <LoadingSpinner />
          <p className="mt-4 text-slate-600 text-center">AI is generating sub-tasks for: <br/> <strong className="font-medium">"{originalTaskTitle}"</strong></p>
        </div>
      )}
      {error && !isLoading && (
        <div className="p-4 text-center min-h-[200px] flex flex-col justify-center items-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Oops! AI ran into an issue.</h3>
          <p className="text-sm text-slate-600 bg-red-50 p-3 rounded-md border border-red-200 shadow-sm">{error}</p>
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Close
          </button>
        </div>
      )}
      {!isLoading && !error && suggestions.length > 0 && (
        <div className="space-y-4">
           <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg shadow-sm">
            <div className="flex items-start">
              <LightBulbIcon className="h-6 w-6 text-sky-600 mr-2.5 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-sky-800">
                AI has suggested the following sub-tasks for: <strong className="font-medium">{originalTaskTitle || "your task"}</strong>. Review and add them to your list.
              </p>
            </div>
          </div>
          <ul className="max-h-[50vh] overflow-y-auto space-y-3 p-1 custom-scrollbar">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <p className="font-semibold text-slate-800">{suggestion.title}</p>
                {suggestion.description && <p className="text-sm text-slate-600 mt-1.5 whitespace-pre-wrap">{suggestion.description}</p>}
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-slate-200 mt-4">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTasks}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 transition-colors"
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Add These Sub-tasks
            </button>
          </div>
        </div>
      )}
       {!isLoading && !error && suggestions.length === 0 && (originalTaskTitle || !originalTaskTitle && !error) && ( // Show "no suggestions" if not loading, no error, and 0 suggestions
         <div className="p-6 text-center min-h-[200px] flex flex-col justify-center items-center">
            <InformationCircleIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Sub-tasks Suggested</h3>
            <p className="text-sm text-slate-600">The AI couldn't find specific sub-tasks to suggest for "{originalTaskTitle || 'this task'}". You can try rephrasing or adding more details to the main task if you attempt AI breakdown again.</p>
            <button
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
                OK
            </button>
        </div>
      )}
    </Modal>
  );
};

export default AISuggestionsModal;
