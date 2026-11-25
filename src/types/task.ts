export enum Priority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export enum FilterTab {
  All = 'all',
  Active = 'active',
  Completed = 'completed',
}

export enum SortOption {
  Newest = 'newest',
  DueDate = 'dueDate',
  Priority = 'priority',
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  dueDate: string;
  createdAt: number;
}
