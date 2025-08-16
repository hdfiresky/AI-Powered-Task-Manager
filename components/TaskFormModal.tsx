/**
 * @file TaskFormModal.tsx
 * @description A modal component containing a form to either add a new task or edit an existing one.
 */

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Task, TaskPriority, TaskStatus } from '../types';
import { TASK_PRIORITIES, TASK_STATUSES } from '../constants';
import { SparklesIcon } from '@heroicons/react/24/outline';

/**
 * @interface TaskFormModalProps
 * @description Defines the props for the TaskFormModal.
 */
interface TaskFormModalProps {
  isOpen: boolean;    // Controls the visibility of the modal.
  onClose: () => void;  // Callback to close the modal.
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'status'>, currentStatus?: TaskStatus) => void; // Callback to save the task.
  task: Task | null;  // The task object to edit. If null, the form is for a new task.
  onTriggerAIBreakdown: (title: string, description?: string, dueDate?: string) => void; // Callback to initiate AI breakdown.
  // --- REMOVE FOR BACKEND INTEGRATION: START ---
  isApiKeyMissing: boolean; // Prop for the frontend-only demo to control UI elements.
  // --- REMOVE FOR BACKEND INTEGRATION: END ---
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSave, task, onTriggerAIBreakdown, /* --- REMOVE FOR BACKEND INTEGRATION --- */ isApiKeyMissing }) => {
  // State for each form field.
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority | undefined>(undefined);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.ToDo);
  const [formError, setFormError] = useState<string | null>(null);

  // `useEffect` hook to populate the form fields when the modal opens for editing a task,
  // or to reset them when opening for a new task.
  useEffect(() => {
    // Only update form state when the modal becomes visible or the task prop changes.
    if (isOpen) {
      if (task) { // If a task is passed, we are in "edit" mode.
        setTitle(task.title);
        setDescription(task.description || '');
        setDueDate(task.dueDate ? task.dueDate.split('T')[0] : ''); // Format date for <input type="date">.
        setPriority(task.priority);
        setStatus(task.status);
      } else { // If no task is passed, we are in "add" mode.
        setTitle('');
        setDescription('');
        setDueDate('');
        setPriority(undefined);
        setStatus(TaskStatus.ToDo);
      }
      // Clear any previous form errors when the modal opens.
      setFormError(null);
    }
  }, [task, isOpen]);

  /**
   * Handles the form submission. Validates the title and calls the onSave prop.
   * @param {React.FormEvent} e - The form event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation: ensure the title is not empty.
    if (!title.trim()) {
        setFormError("Title is required.");
        return;
    }
    setFormError(null);
    // Call the onSave callback with the form data.
    onSave({ 
        title: title.trim(), 
        description: description.trim() || undefined, 
        dueDate: dueDate || undefined, 
        priority 
    }, status);
  };

  /**
   * Handles the click event for the "AI Breakdown" button.
   */
  const handleAIBreakdownClick = () => {
    // Also validate the title before triggering AI.
    if (!title.trim()) {
        setFormError("Please enter a title for the task before using AI breakdown.");
        return;
    }
    setFormError(null);
    // Call the AI trigger callback with the current form data.
    onTriggerAIBreakdown(title.trim(), description.trim(), dueDate.trim() || undefined);
    // Close this form modal; the AI suggestions will appear in a separate modal.
    onClose(); 
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Add New Task'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
            required
          />
        </div>
        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
            placeholder="Add more details about your task..."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
            {/* Due Date Field */}
            <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input
                    type="date"
                    id="dueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                />
            </div>
            {/* Priority Field */}
            <div>
                <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select
                    id="priority"
                    value={priority || ''}
                    onChange={(e) => setPriority(e.target.value as TaskPriority || undefined)}
                    className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow bg-white"
                >
                    <option value="">Select Priority</option>
                    {TASK_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
        </div>
        {/* Status Field */}
         <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow bg-white"
            >
                {TASK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>

        {/* Display form errors if any */}
        {formError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">{formError}</p>}
        
        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end items-center space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
          >
            Cancel
          </button>
          
          {/* --- UNCOMMENT FOR BACKEND INTEGRATION: START --- */}
          {/* This version of the button is always available when using the backend. */}
          {/*
          <button
              type="button"
              onClick={handleAIBreakdownClick}
              disabled={!title.trim()}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={!title.trim() ? "Enter a title first" : "Break down this task using AI"}
          >
              <SparklesIcon className="h-5 w-5 mr-2" />
              AI Breakdown
          </button>
          */}
          {/* --- UNCOMMENT FOR BACKEND INTEGRATION: END --- */}

          {/* --- REMOVE FOR BACKEND INTEGRATION: START --- */}
          {/* This version is for the frontend-only demo and is hidden if the API key is missing. */}
          {!isApiKeyMissing && (
            <button
                type="button"
                onClick={handleAIBreakdownClick}
                disabled={!title.trim()}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={!title.trim() ? "Enter a title first" : "Break down this task using AI"}
            >
                <SparklesIcon className="h-5 w-5 mr-2" />
                AI Breakdown
            </button>
          )}
          {/* --- REMOVE FOR BACKEND INTEGRATION: END --- */}

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
          >
            {task ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskFormModal;
