/**
 * @file TaskItem.tsx
 * @description This component displays a single task card. It is draggable and includes
 * controls for editing, deleting, updating status, and triggering AI breakdown.
 */

import React from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { PencilIcon, TrashIcon, SparklesIcon, CalendarDaysIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { PRIORITY_BADGE_CLASSES, TASK_STATUSES } from '../constants';

/**
 * @interface TaskItemProps
 * @description Defines the props for the TaskItem component.
 */
interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onTriggerAIBreakdown: (title: string, description?: string, dueDate?: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete, onUpdateStatus, onTriggerAIBreakdown }) => {
  // Determine the CSS classes for the priority badge based on the task's priority.
  const priorityClasses = task.priority ? PRIORITY_BADGE_CLASSES[task.priority] : 'bg-slate-100 text-slate-700 border border-slate-200';

  /**
   * Sets the data to be transferred during a drag operation.
   * @param {React.DragEvent<HTMLDivElement>} e - The drag event.
   * @param {string} taskId - The ID of the task being dragged.
   * @param {TaskStatus} taskStatus - The current status of the task being dragged.
   */
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string, taskStatus: TaskStatus) => {
    // `dataTransfer` is used to hold the data that is being dragged.
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("taskStatus", taskStatus);
    // Add visual feedback to the dragged item.
    e.currentTarget.classList.add('opacity-50', 'shadow-2xl');
  };

  /**
   * Cleans up visual feedback when the drag operation ends.
   * @param {React.DragEvent<HTMLDivElement>} e - The drag event.
   */
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'shadow-2xl');
  };
  
  /**
   * Formats a date string (e.g., "YYYY-MM-DD") into a more readable format.
   * @param {string} [dateString] - The date string to format.
   * @returns {string} The formatted date string.
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    // Handles both YYYY-MM-DD and full ISO strings by splitting at 'T'.
    const datePart = dateString.split('T')[0];
    // Parsing this way avoids timezone issues that `new Date('YYYY-MM-DD')` can have.
    const [year, month, day] = datePart.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };


  return (
    <div 
      draggable // Makes the element draggable.
      onDragStart={(e) => handleDragStart(e, task.id, task.status)}
      onDragEnd={handleDragEnd}
      className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-grab border border-slate-200"
    >
      {/* Task Header: Title and Priority Badge */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-slate-800 break-words pr-2">{task.title}</h3>
        {task.priority && (
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${priorityClasses}`}>
            {task.priority}
          </span>
        )}
      </div>
      
      {/* Task Description (if it exists) */}
      {task.description && <p className="text-sm text-slate-600 mb-3 break-words whitespace-pre-wrap">{task.description}</p>}
      
      {/* Due Date (if it exists) */}
      {task.dueDate && (
        <div className="flex items-center text-xs text-slate-500 mb-3">
          <CalendarDaysIcon className="h-4 w-4 mr-1.5 text-slate-400" />
          Due: {formatDate(task.dueDate)}
        </div>
      )}

      {/* Footer: Status Dropdown and Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-3 pt-3 border-t border-slate-200 space-y-2 sm:space-y-0">
        <div className="relative group w-full sm:w-auto">
          {/* Status Changer Dropdown */}
          <select
            value={task.status}
            onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
            className="text-xs appearance-none w-full sm:w-auto bg-slate-100 border border-slate-300 text-slate-700 py-1.5 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 cursor-pointer transition-colors"
          >
            {TASK_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
            <ChevronDownIcon className="h-4 w-4" />
          </div>
        </div>

        <div className="flex space-x-1.5">
          {/* --- UNCOMMENT FOR BACKEND INTEGRATION: START --- */}
          {/* This version of the button is always visible when using the backend. */}
          {/*
          <button
            onClick={() => onTriggerAIBreakdown(task.title, task.description, task.dueDate)}
            className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
            title="Break down task with AI"
          >
            <SparklesIcon className="h-5 w-5" />
          </button>
          */}
          {/* --- UNCOMMENT FOR BACKEND INTEGRATION: END --- */}
          
          {/* --- REMOVE FOR BACKEND INTEGRATION: START --- */}
          {/* This version is for the frontend-only demo and only shows if the API key is present. */}
          {process.env.API_KEY && process.env.API_KEY !== "" && (
            <button
              onClick={() => onTriggerAIBreakdown(task.title, task.description, task.dueDate)}
              className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
              title="Break down task with AI"
            >
              <SparklesIcon className="h-5 w-5" />
            </button>
          )}
          {/* --- REMOVE FOR BACKEND INTEGRATION: END --- */}
          
          {/* Edit Button */}
          <button 
            onClick={() => onEdit(task)} 
            className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300"
            title="Edit task"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          
          {/* Delete Button */}
          <button 
            onClick={() => onDelete(task.id)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
            title="Delete task"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
