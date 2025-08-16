
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
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isAISuggestionsModalOpen, setIsAISuggestionsModalOpen] = useState(false);
  const [aiSubTaskSuggestions, setAiSubTaskSuggestions] = useState<AISubTaskSuggestion[]>([]);
  const [currentTaskForAI, setCurrentTaskForAI] = useState<{ title: string; description?: string; dueDate?: string; } | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  // --- REMOVE FOR BACKEND INTEGRATION: START ---
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  useEffect(() => {
    if (!process.env.API_KEY || process.env.API_KEY === "") {
      setIsApiKeyMissing(true);
    }
  }, []);
  // --- REMOVE FOR BACKEND INTEGRATION: END ---

  const handleOpenTaskForm = (task?: Task) => {
    setEditingTask(task || null);
    setIsTaskFormOpen(true);
  };

  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'status'>, newStatusForTask?: TaskStatus) => {
    if (editingTask) {
      setTasks(prevTasks => prevTasks.map(t => t.id === editingTask.id ? { ...editingTask, ...taskData, status: newStatusForTask ?? editingTask.status } : t));
    } else {
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        status: newStatusForTask || TaskStatus.ToDo,
      };
      setTasks(prevTasks => [newTask, ...prevTasks]);
    }
    handleCloseTaskForm();
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };
  
  const handleTriggerAIBreakdown = async (title: string, description?: string, dueDate?: string) => {
    // --- REMOVE FOR BACKEND INTEGRATION: START ---
    if (isApiKeyMissing) {
        setAiError("Gemini API key is not configured. AI features are unavailable. Please set the API_KEY environment variable (e.g. in index.html for this demo).");
        setAiSubTaskSuggestions([]);
        setIsAISuggestionsModalOpen(true);
        return;
    }
    // --- REMOVE FOR BACKEND INTEGRATION: END ---
    setCurrentTaskForAI({ title, description, dueDate });
    setIsLoadingAI(true);
    setAiError(null);
    setAiSubTaskSuggestions([]);
    setIsAISuggestionsModalOpen(true); // Open modal immediately to show loading state
    try {
      const suggestions = await breakDownTaskWithAI(title, description);
      setAiSubTaskSuggestions(suggestions);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "An unknown AI error occurred.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleAddSuggestedTasks = (suggestions: AISubTaskSuggestion[]) => {
    const newTasks: Task[] = suggestions.map(suggestion => ({
      id: crypto.randomUUID(),
      title: suggestion.title,
      description: suggestion.description,
      dueDate: currentTaskForAI?.dueDate, // Inherit due date from parent
      priority: TaskPriority.Medium, // Default priority for sub-tasks
      status: TaskStatus.ToDo,
      createdAt: new Date().toISOString(),
    }));
    setTasks(prevTasks => [...newTasks, ...prevTasks]);
    setIsAISuggestionsModalOpen(false);
    setCurrentTaskForAI(null); // Clear current task for AI
    setAiError(null); // Clear any previous AI errors
  };

  const closeAiSuggestionsModal = () => {
    setIsAISuggestionsModalOpen(false);
    setCurrentTaskForAI(null);
    setAiError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col">
      <Header appName={APP_NAME} onAddTask={() => handleOpenTaskForm()} />
      
      <main className="flex-grow p-4 md:p-6 lg:p-8">
        {/* --- REMOVE FOR BACKEND INTEGRATION: START --- */}
        {isApiKeyMissing && (
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
        )}
        {/* --- REMOVE FOR BACKEND INTEGRATION: END --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TASK_STATUSES.map(status => (
            <TaskColumn
              key={status}
              status={status}
              tasks={tasks.filter(task => task.status === status).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
              onEditTask={handleOpenTaskForm}
              onDeleteTask={handleDeleteTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onTriggerAIBreakdown={handleTriggerAIBreakdown} 
            />
          ))}
        </div>
      </main>

      {isTaskFormOpen && (
        <TaskFormModal
          isOpen={isTaskFormOpen}
          onClose={handleCloseTaskForm}
          onSave={handleSaveTask}
          task={editingTask}
          onTriggerAIBreakdown={handleTriggerAIBreakdown}
          // --- REMOVE FOR BACKEND INTEGRATION: START ---
          isApiKeyMissing={isApiKeyMissing}
          // --- REMOVE FOR BACKEND INTEGRATION: END ---
        />
      )}

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