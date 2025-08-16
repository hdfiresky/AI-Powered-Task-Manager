
export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Done = 'Done',
}

export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO string for date part, e.g., "YYYY-MM-DD"
  priority?: TaskPriority;
  status: TaskStatus;
  createdAt: string; // ISO string for datetime
}

export interface AISubTaskSuggestion {
  title: string;
  description?: string;
}
