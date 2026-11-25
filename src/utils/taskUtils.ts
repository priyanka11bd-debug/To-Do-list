import { Priority, SortOption, Task } from '../types/task';

const STORAGE_KEY = 'taskflow_tasks_v1';

export interface PriorityMeta {
  label: string;
  badgeClass: string;
  activeButtonClass: string;
  weight: number;
}

export const PRIORITY_CONFIG: Record<Priority, PriorityMeta> = {
  [Priority.High]: {
    label: 'High',
    badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    activeButtonClass: 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs',
    weight: 3,
  },
  [Priority.Medium]: {
    label: 'Medium',
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    activeButtonClass: 'bg-amber-50 text-amber-700 border-amber-300 shadow-xs',
    weight: 2,
  },
  [Priority.Low]: {
    label: 'Low',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    activeButtonClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs',
    weight: 1,
  },
};

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysIsoDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface DueDateDisplay {
  label: string;
  status: 'overdue' | 'today' | 'upcoming' | 'none';
}

export function formatDueDate(dateStr: string, completed: boolean): DueDateDisplay {
  if (!dateStr) {
    return { label: '', status: 'none' };
  }

  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return { label: dateStr, status: 'upcoming' };
  }

  const [year, month, day] = parts;
  const target = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const formatted = target.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: target.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });

  if (completed) {
    return { label: formatted, status: 'upcoming' };
  }

  if (diffDays < 0) {
    return { label: `Overdue (${formatted})`, status: 'overdue' };
  }
  if (diffDays === 0) {
    return { label: `Today (${formatted})`, status: 'today' };
  }
  if (diffDays === 1) {
    return { label: `Tomorrow (${formatted})`, status: 'upcoming' };
  }

  return { label: formatted, status: 'upcoming' };
}

export function createStarterTasks(): Task[] {
  const now = Date.now();
  return [
    {
      id: 'starter-1',
      title: 'Finalize Q4 product roadmap and engineering milestones',
      completed: false,
      priority: Priority.High,
      dueDate: getTodayIsoDate(),
      createdAt: now - 300000,
    },
    {
      id: 'starter-2',
      title: 'Review design system typography and spacing pull request',
      completed: false,
      priority: Priority.Medium,
      dueDate: addDaysIsoDate(2),
      createdAt: now - 200000,
    },
    {
      id: 'starter-3',
      title: 'Update API documentation for client onboarding webhook',
      completed: false,
      priority: Priority.Low,
      dueDate: addDaysIsoDate(5),
      createdAt: now - 100000,
    },
    {
      id: 'starter-4',
      title: 'Send weekly customer feedback digest to product leads',
      completed: true,
      priority: Priority.Medium,
      dueDate: addDaysIsoDate(-1),
      createdAt: now - 400000,
    },
  ];
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      const starters = createStarterTasks();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(starters));
      return starters;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function sortTasks(tasks: Task[], sortBy: SortOption): Task[] {
  const copy = [...tasks];
  switch (sortBy) {
    case SortOption.Priority:
      return copy.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        const diff = PRIORITY_CONFIG[b.priority].weight - PRIORITY_CONFIG[a.priority].weight;
        return diff !== 0 ? diff : b.createdAt - a.createdAt;
      });
    case SortOption.DueDate:
      return copy.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        if (a.dueDate && b.dueDate) {
          const cmp = a.dueDate.localeCompare(b.dueDate);
          return cmp !== 0 ? cmp : b.createdAt - a.createdAt;
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return b.createdAt - a.createdAt;
      });
    case SortOption.Newest:
    default:
      return copy.sort((a, b) => b.createdAt - a.createdAt);
  }
}
