import { TaskStatus, TaskPriority } from './types';

export const APP_NAME = "AI-Powered Task Manager";
export const GEMINI_MODEL_TEXT = "gemini-2.5-flash";

export const TASK_STATUSES: TaskStatus[] = [TaskStatus.ToDo, TaskStatus.InProgress, TaskStatus.Done];
export const TASK_PRIORITIES: TaskPriority[] = [TaskPriority.Low, TaskPriority.Medium, TaskPriority.High];

export const PRIORITY_BADGE_CLASSES: { [key in TaskPriority]: string } = {
  [TaskPriority.Low]: 'bg-green-100 text-green-700 border border-green-200',
  [TaskPriority.Medium]: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  [TaskPriority.High]: 'bg-red-100 text-red-700 border border-red-200',
};

export const STATUS_COLUMN_CLASSES: { [key in TaskStatus]: { header: string, background: string, border: string } } = {
  [TaskStatus.ToDo]: { header: 'text-sky-700 border-sky-300', background: 'bg-sky-50', border: 'border-sky-200' },
  [TaskStatus.InProgress]: { header: 'text-amber-700 border-amber-300', background: 'bg-amber-50', border: 'border-amber-200' },
  [TaskStatus.Done]: { header: 'text-emerald-700 border-emerald-300', background: 'bg-emerald-50', border: 'border-emerald-200' },
};