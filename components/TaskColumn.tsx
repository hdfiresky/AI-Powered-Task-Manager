
import React from 'react';
import { Task, TaskStatus } from '../types';
import TaskItem from './TaskItem';
import { STATUS_COLUMN_CLASSES } from '../constants';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onTriggerAIBreakdown: (title: string, description?: string, dueDate?: string) => void; 
}

const TaskColumn: React.FC<TaskColumnProps> = ({ status, tasks, onEditTask, onDeleteTask, onUpdateTaskStatus, onTriggerAIBreakdown }) => {
  const columnClasses = STATUS_COLUMN_CLASSES[status] || { header: 'text-gray-700 border-gray-300', background: 'bg-gray-100', border: 'border-gray-200' };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    e.currentTarget.classList.add('border-sky-400', 'border-dashed'); // Visual feedback
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('border-sky-400', 'border-dashed');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-sky-400', 'border-dashed');
    const taskId = e.dataTransfer.getData("taskId");
    const taskCurrentStatus = e.dataTransfer.getData("taskStatus") as TaskStatus;
    if (taskId && taskCurrentStatus !== status) { // Only update if status is different
      onUpdateTaskStatus(taskId, status);
    }
  };

  return (
    <div 
      className={`p-4 rounded-xl shadow-lg min-h-[400px] flex flex-col border-2 ${columnClasses.border} ${columnClasses.background} transition-all duration-150`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h2 className={`text-xl font-semibold mb-4 pb-2 border-b-2 ${columnClasses.header} flex justify-between items-center`}>
        <span>{status}</span>
        <span className={`text-sm font-normal px-2 py-0.5 rounded-full ${columnClasses.background === 'bg-gray-100' ? 'bg-gray-200 text-gray-600' : columnClasses.header.replace('text-', 'bg-').replace('-700', '-100').replace('border-', 'text-')}`}>{tasks.length}</span>
      </h2>
      <div className="space-y-4 overflow-y-auto flex-grow pr-1 custom-scrollbar">
        {tasks.length === 0 && (
          <p className="text-slate-500 italic text-center py-10">No tasks here yet.</p>
        )}
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
