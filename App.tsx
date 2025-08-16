/**
 * @file App.tsx
 * @description The main component of the application. It serves as the root of the component tree
 * and manages the global state, including the list of tasks and the visibility of modals.
 */

import React, { useState, useEffect } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { Task, TaskStatus, TaskPriority, AISubTaskSuggestion } from './types';
import { APP_NAME, TASK_STATUSES } from './constants';
import Header from './components/Header';
import TaskColumn from './components/TaskColumn';
import TaskFormModal from './components/TaskFormModal';
import AISuggestionsModal from './components/AISuggestionsModal';
import { breakDownTaskWithAI } from './services/geminiService';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---

  // `tasks` state: The primary data of the application. Persisted to localStorage via a custom hook.
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);

  // `isTaskFormOpen` state: Controls the visibility of the Add/Edit Task modal.
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  
  // `editingTask` state: Holds the task object being edited. Null when adding a new task.
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // `isAISuggestionsModalOpen` state: Controls the visibility of the AI suggestions modal.
  const [isAISuggestionsModalOpen, setIsAISuggestionsModalOpen] = useState(false);
  
  // `aiSubTaskSuggestions` state: Stores the list of sub-tasks fetched from the AI.
  const [aiSubTaskSuggestions, setAiSubTaskSuggestions] = useState<AISubTaskSuggestion[]>([]);
  
  // `currentTaskForAI` state: Stores the details of the task being sent to the AI.
  // Used to pass context (like dueDate) to the newly created sub-tasks.
  const [currentTaskForAI, setCurrentTaskForAI] = useState<{ title: string; description?: string; dueDate?: string; } | null>(null);
  
  // `isLoadingAI` state: Tracks the loading state of the AI API call.
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  // `aiError` state: Stores any error messages from the AI service.
  const [aiError, setAiError] = useState<string | null>(null);
  
  // --- REMOVE FOR BACKEND INTEGRATION: START ---
  // `isApiKeyMissing` state: Specific to the frontend-only demo. Tracks if the API key is missing.
  // const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  // // Effect to check for the API key on component mount.
  // useEffect(() => {
  //   // In the demo setup, process.env is a shim in index.html.
  //   if (!process.env.API_KEY || process.env.API_KEY === "") {
  //     setIsApiKeyMissing(true);
  //   }
  // }, []);
  // --- REMOVE FOR BACKEND INTEGRATION: END ---

  // --- EVENT HANDLERS ---

  /**
   * Opens the task form modal. If a task is provided, it sets the form up for editing that task.
   * @param {Task} [task] - The task to be edited. If undefined, the form is for a new task.
   */
  const handleOpenTaskForm = (task?: Task) => {
    setEditingTask(task || null);
    setIsTaskFormOpen(true);
  };

  /**
   * Closes the task form modal and resets the editing state.
   */
  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false);
    setEditingTask(null);
  };

  /**
   * Saves a new task or updates an existing one.
   * @param {Omit<Task, 'id' | 'createdAt' | 'status'>} taskData - The core data of the task from the form.
   * @param {TaskStatus} [newStatusForTask] - The status selected in the form.
   */
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'status'>, newStatusForTask?: TaskStatus) => {
    if (editingTask) {
      // If editing, map over existing tasks and update the one with the matching ID.
      setTasks(prevTasks => prevTasks.map(t => t.id === editingTask.id ? { ...editingTask, ...taskData, status: newStatusForTask ?? editingTask.status } : t));
    } else {
      // If adding, create a new task object with a unique ID and timestamp.
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        status: newStatusForTask || TaskStatus.ToDo,
      };
      // Add the new task to the beginning of the tasks array.
      setTasks(prevTasks => [newTask, ...prevTasks]);
    }
    handleCloseTaskForm();
  };

  /**
   * Deletes a task by its ID.
   * @param {string} taskId - The ID of the task to delete.
   */
  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
  };

  /**
   * Updates the status of a task, typically via drag-and-drop.
   * @param {string} taskId - The ID of the task to update.
   * @param {TaskStatus} newStatus - The new status for the task.
   */
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };
  
  /**
   * Triggers the AI task breakdown process.
   * @param {string} title - The title of the task.
   * @param {string} [description] - The optional description.
   * @param {string} [dueDate] - The optional due date.
   */
  const handleTriggerAIBreakdown = async (title: string, description?: string, dueDate?: string) => {
    // --- REMOVE FOR BACKEND INTEGRATION: START ---
    // In frontend-only mode, first check if the API key is available.
    // if (isApiKeyMissing) {
    //     setAiError("Gemini API key is not configured. AI features are unavailable. Please set the API_KEY environment variable (e.g. in index.html for this demo).");
    //     setAiSubTaskSuggestions([]);
    //     setIsAISuggestionsModalOpen(true);
    //     return;
    // }
    // --- REMOVE FOR BACKEND INTEGRATION: END ---

    // Set up state for the AI modal (loading, context, etc.).
    setCurrentTaskForAI({ title, description, dueDate });
    setIsLoadingAI(true);
    setAiError(null);
    setAiSubTaskSuggestions([]);
    setIsAISuggestionsModalOpen(true); // Open modal immediately to show loading state.

    try {
      // Call the AI service.
      const suggestions = await breakDownTaskWithAI(title, description);
      setAiSubTaskSuggestions(suggestions);
    } catch (error) {
      // Handle any errors from the service.
      setAiError(error instanceof Error ? error.message : "An unknown AI error occurred.");
    } finally {
      // Always stop loading, regardless of success or failure.
      setIsLoadingAI(false);
    }
  };

  /**
   * Adds the AI-suggested sub-tasks as new tasks in the "To Do" column.
   * @param {AISubTaskSuggestion[]} suggestions - The list of suggestions from the AI.
   */
  const handleAddSuggestedTasks = (suggestions: AISubTaskSuggestion[]) => {
    const newTasks: Task[] = suggestions.map(suggestion => ({
      id: crypto.randomUUID(),
      title: suggestion.title,
      description: suggestion.description,
      dueDate: currentTaskForAI?.dueDate, // Inherit due date from parent task.
      priority: TaskPriority.Medium, // Default priority for sub-tasks.
      status: TaskStatus.ToDo,
      createdAt: new Date().toISOString(),
    }));
    // Add the new tasks to the existing task list.
    setTasks(prevTasks => [...newTasks, ...prevTasks]);
    closeAiSuggestionsModal();
  };

  /**
   * Closes the AI suggestions modal and resets related state.
   */
  const closeAiSuggestionsModal = () => {
    setIsAISuggestionsModalOpen(false);
    setCurrentTaskForAI(null);
    setAiError(null);
  };

  // --- RENDER ---

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col">
      <Header appName={APP_NAME} onAddTask={() => handleOpenTaskForm()} />
      
      <main className="flex-grow p-4 md:p-6 lg:p-8">
        {/* --- REMOVE FOR BACKEND INTEGRATION: START --- */}
        {/* Display a warning banner if the API key is missing in frontend-only mode. */}
        {/*{isApiKeyMissing && (
             <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md flex items-start shadow">
                <ExclamationTriangleIcon className="h-6 w-6 mr-3 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                    <strong className="font-semibold">Warning: Gemini API Key Not Found</strong>
                    <p className="text-sm">
                        AI-powered features (like task breakdown) are currently disabled. 
                        To enable them, please ensure the <code>API_KEY</code> environment variable is set with your Gemini API key.
                        For this demo, you might need to edit <code>index.html</code>.
                    </p>
                </div>
            </div>
        )}*/}
        {/* --- REMOVE FOR BACKEND INTEGRATION: END --- */}

        {/* Render the main task board with a column for each status. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TASK_STATUSES.map(status => (
            <TaskColumn
              key={status}
              status={status}
              // Filter and sort tasks for the current column.
              tasks={tasks.filter(task => task.status === status).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
              // Pass down all necessary event handlers as props.
              onEditTask={handleOpenTaskForm}
              onDeleteTask={handleDeleteTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onTriggerAIBreakdown={handleTriggerAIBreakdown} 
            />
          ))}
        </div>
      </main>

      {/* Conditionally render the TaskFormModal based on `isTaskFormOpen` state. */}
      {isTaskFormOpen && (
        <TaskFormModal
          isOpen={isTaskFormOpen}
          onClose={handleCloseTaskForm}
          onSave={handleSaveTask}
          task={editingTask}
          onTriggerAIBreakdown={handleTriggerAIBreakdown}
          // --- REMOVE FOR BACKEND INTEGRATION: START ---
          // isApiKeyMissing={isApiKeyMissing}
          // --- REMOVE FOR BACKEND INTEGRATION: END ---
        />
      )}

      {/* Conditionally render the AISuggestionsModal. */}
      {isAISuggestionsModalOpen && (
        <AISuggestionsModal
          isOpen={isAISuggestionsModalOpen}
          onClose={closeAiSuggestionsModal}
          suggestions={aiSubTaskSuggestions}
          originalTaskTitle={currentTaskForAI?.title}
          isLoading={isLoadingAI}
          error={aiError}
          onAddSuggestedTasks={handleAddSuggestedTasks}
        />
      )}

      <footer className="text-center p-4 text-sm text-slate-500 border-t border-slate-200 bg-white">
        &copy; {new Date().getFullYear()} {APP_NAME}. Powered by React, Tailwind CSS, and Gemini AI.
      </footer>
    </div>
  );
};
export default App;