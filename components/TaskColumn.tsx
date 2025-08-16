/**
 * @file TaskColumn.tsx
 * @description This component represents a single column on the task board (e.g., "To Do", "In Progress").
 * It is responsible for displaying the tasks belonging to its status and handling drag-and-drop events.
 */

import React from 'react';
import { Task, TaskStatus } from '../types';
import TaskItem from './TaskItem';
import { STATUS_COLUMN_CLASSES } from '../constants';

/**
 * @interface TaskColumnProps
 * @description Defines the props for the TaskColumn component.
 */
interface TaskColumnProps {
  status: TaskStatus; // The status this column represents.
  tasks: Task[];      // An array of tasks that belong to this column.
  onEditTask: (task: Task) => void; // Callback to open the edit modal for a task.
  onDeleteTask: (taskId: string) => void; // Callback to delete a task.
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void; // Callback to update a task's status.
  onTriggerAIBreakdown: (title: string, description?: string, dueDate?: string) => void; // Callback to trigger AI breakdown.
}

const TaskColumn: React.FC<TaskColumnProps> = ({ status, tasks, onEditTask, onDeleteTask, onUpdateTaskStatus, onTriggerAIBreakdown }) => {
  // Retrieve the specific CSS classes for this column's status from the constants file.
  const columnClasses = STATUS_COLUMN_CLASSES[status] || { header: 'text-gray-700 border-gray-300', background: 'bg-gray-100', border: 'border-gray-200' };

  /**
   * Handles the drag-over event. `preventDefault` is necessary to allow a drop event.
   * @param {React.DragEvent<HTMLDivElement>} e - The drag event.
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    // Add visual feedback to indicate a valid drop target.
    e.currentTarget.classList.add('border-sky-400', 'border-dashed');
  };

  /**
   * Handles the drag-leave event to remove the visual feedback.
   * @param {React.DragEvent<HTMLDivElement>} e - The drag event.
   */
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('border-sky-400', 'border-dashed');
  };

  /**
   * Handles the drop event to update the task's status.
   * @param {React.DragEvent<HTMLDivElement>} e - The drop event.
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-sky-400', 'border-dashed');
    
    // Retrieve the task ID and original status from the dataTransfer object.
    const taskId = e.dataTransfer.getData("taskId");
    const taskCurrentStatus = e.dataTransfer.getData("taskStatus") as TaskStatus;

    // Only call the update function if the task is being dropped into a different column.
    if (taskId && taskCurrentStatus !== status) {
      onUpdateTaskStatus(taskId, status);
    }
  };

  return (
    <div 
      className={`p-4 rounded-xl shadow-lg min-h-[400px] flex flex-col border-2 ${columnClasses.border} ${columnClasses.background} transition-all duration-150`}
      // Register the drag-and-drop event handlers.
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <h2 className={`text-xl font-semibold mb-4 pb-2 border-b-2 ${columnClasses.header} flex justify-between items-center`}>
        <span>{status}</span>
        {/* Task Count Badge */}
        <span className={`text-sm font-normal px-2 py-0.5 rounded-full ${columnClasses.background === 'bg-gray-100' ? 'bg-gray-200 text-gray-600' : columnClasses.header.replace('text-', 'bg-').replace('-700', '-100').replace('border-', 'text-')}`}>{tasks.length}</span>
      </h2>
      
      {/* Task List */}
      <div className="space-y-4 overflow-y-auto flex-grow pr-1 custom-scrollbar">
        {tasks.length === 0 && (
          // Display a message if there are no tasks in this column.
          <p className="text-slate-500 italic text-center py-10">No tasks here yet.</p>
        )}
        {/* Map over the tasks and render a TaskItem component for each one. */}
        {tasks.map(task => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onEdit={onEditTask} 
            onDelete={onDeleteTask}
            onUpdateStatus={onUpdateTaskStatus}
            onTriggerAIBreakdown={onTriggerAIBreakdown} 
          />
        ))}
      </div>
    </div>
  );
};

export default TaskColumn;
