
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Task, TaskPriority, TaskStatus } from '../types';
import { TASK_PRIORITIES, TASK_STATUSES } from '../constants';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'status'>, currentStatus?: TaskStatus) => void;
  task: Task | null;
  onTriggerAIBreakdown: (title: string, description?: string, dueDate?: string) => void;
  isApiKeyMissing: boolean;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSave, task, onTriggerAIBreakdown, isApiKeyMissing }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority | undefined>(undefined);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.ToDo);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) { // Reset form only when modal opens or task changes
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setDueDate(task.dueDate ? task.dueDate.split('T')[0] : ''); // Handles YYYY-MM-DD
        setPriority(task.priority);
        setStatus(task.status);
      } else {
        setTitle('');
        setDescription('');
        setDueDate('');
        setPriority(undefined);
        setStatus(TaskStatus.ToDo);
      }
      setFormError(null);
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
        setFormError("Title is required.");
        return;
    }
    setFormError(null);
    onSave({ 
        title: title.trim(), 
        description: description.trim() || undefined, 
        dueDate: dueDate || undefined, 
        priority 
    }, status);
  };

  const handleAIBreakdownClick = () => {
    if (!title.trim()) {
        setFormError("Please enter a title for the task before using AI breakdown.");
        return;
    }
    setFormError(null);
    onTriggerAIBreakdown(title.trim(), description.trim(), dueDate.trim() || undefined);
    onClose(); // Close this form, AI suggestions will open in its own modal
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Add New Task'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
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

        {formError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">{formError}</p>}
        
        <div className="flex flex-col-reverse sm:flex-row justify-end items-center space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
          >
            Cancel
          </button>
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
