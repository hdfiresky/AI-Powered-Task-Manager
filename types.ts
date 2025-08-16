/**
 * @file types.ts
 * @description This file contains all the TypeScript type definitions and enumerations used throughout the application.
 * It serves as a single source of truth for the data structures, ensuring type safety and consistency.
 */

/**
 * @enum {string} TaskStatus
 * @description Represents the possible states a task can be in. Used for column organization.
 */
export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Done = 'Done',
}

/**
 * @enum {string} TaskPriority
 * @description Represents the priority levels for a task. Used for visual cues and sorting.
 */
export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

/**
 * @interface Task
 * @description Defines the core structure of a task object.
 */
export interface Task {
  id: string;          // Unique identifier for the task, generated via crypto.randomUUID()
  title: string;       // The main title of the task.
  description?: string; // An optional, more detailed description of the task.
  dueDate?: string;     // Optional due date in ISO string format (YYYY-MM-DD).
  priority?: TaskPriority; // Optional priority level.
  status: TaskStatus;  // The current status of the task.
  createdAt: string;   // The creation timestamp in ISO string format. Used for sorting.
}

/**
 * @interface AISubTaskSuggestion
 * @description Defines the structure for a sub-task suggestion received from the Gemini API.
 * This is the expected format for the AI-generated content.
 */
export interface AISubTaskSuggestion {
  title: string;       // The title of the suggested sub-task.
  description?: string; // An optional description for the sub-task.
}
