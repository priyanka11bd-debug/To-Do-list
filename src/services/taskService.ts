import { supabase } from '../lib/supabase';
import { Priority, Task } from '../types/task';
import { loadTasks, saveTasks } from '../utils/taskUtils';

interface SupabaseTaskRow {
  id: string;
  title: string;
  completed: boolean;
  priority: string;
  due_date: string | null;
  created_at: number | string;
}

const VALID_PRIORITIES = new Set<string>([
  Priority.Low,
  Priority.Medium,
  Priority.High,
]);

function normalizePriority(value: string): Priority {
  return VALID_PRIORITIES.has(value) ? (value as Priority) : Priority.Medium;
}

function normalizeDueDate(value: string | null | undefined): string {
  if (!value || typeof value !== 'string') return '';
  const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
}

function parseCreatedAt(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed !== '') {
      const asNum = Number(trimmed);
      if (Number.isFinite(asNum)) {
        return asNum;
      }
      const parsed = Date.parse(trimmed);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return Date.now();
}

function mapRowToTask(row: SupabaseTaskRow): Task {
  return {
    id: String(row.id),
    title: String(row.title ?? '').trim(),
    completed: Boolean(row.completed),
    priority: normalizePriority(row.priority),
    dueDate: normalizeDueDate(row.due_date),
    createdAt: parseCreatedAt(row.created_at),
  };
}

function createLocalTaskId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function fetchTasks(): Promise<Task[]> {
  if (!supabase) {
    return loadTasks();
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, completed, priority, due_date, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || 'Failed to load tasks from Supabase.');
  }

  return (data ?? []).map((row) => mapRowToTask(row as SupabaseTaskRow));
}

export async function createTask(input: {
  title: string;
  dueDate: string;
  priority: Priority;
}): Promise<Task> {
  const cleanTitle = input.title.trim();
  if (!cleanTitle) {
    throw new Error('Task title is required.');
  }

  const cleanPriority = normalizePriority(input.priority);
  const cleanDueDate = normalizeDueDate(input.dueDate);
  const createdAt = Date.now();

  if (!supabase) {
    const localTask: Task = {
      id: createLocalTaskId(),
      title: cleanTitle,
      completed: false,
      priority: cleanPriority,
      dueDate: cleanDueDate,
      createdAt,
    };
    const current = loadTasks();
    saveTasks([localTask, ...current]);
    return localTask;
  }

  const basePayload: {
    title: string;
    completed: boolean;
    priority: Priority;
    due_date?: string;
    created_at: string | number;
  } = {
    title: cleanTitle,
    completed: false,
    priority: cleanPriority,
    created_at: new Date(createdAt).toISOString(),
  };

  if (cleanDueDate) {
    basePayload.due_date = cleanDueDate;
  }

  let { data, error } = await supabase
    .from('tasks')
    .insert(basePayload)
    .select('id, title, completed, priority, due_date, created_at')
    .single();

  if (error && error.code === '22P02' && error.message.toLowerCase().includes('bigint')) {
    const retryResult = await supabase
      .from('tasks')
      .insert({
        ...basePayload,
        created_at: createdAt,
      })
      .select('id, title, completed, priority, due_date, created_at')
      .single();
    data = retryResult.data;
    error = retryResult.error;
  }

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create task.');
  }

  return mapRowToTask(data as SupabaseTaskRow);
}

export async function updateTask(
  id: string,
  updates: Partial<Pick<Task, 'title' | 'completed' | 'priority' | 'dueDate'>>
): Promise<Task> {
  if (!supabase) {
    const current = loadTasks();
    let updatedTask: Task | null = null;
    const next = current.map((task) => {
      if (task.id !== id) return task;
      updatedTask = {
        ...task,
        ...(updates.title !== undefined ? { title: updates.title.trim() } : {}),
        ...(updates.completed !== undefined ? { completed: updates.completed } : {}),
        ...(updates.priority !== undefined
          ? { priority: normalizePriority(updates.priority) }
          : {}),
        ...(updates.dueDate !== undefined
          ? { dueDate: normalizeDueDate(updates.dueDate) }
          : {}),
      };
      return updatedTask;
    });
    saveTasks(next);
    if (!updatedTask) {
      throw new Error('Task not found.');
    }
    return updatedTask;
  }

  const payload: Record<string, string | boolean | null> = {};
  if (updates.title !== undefined) {
    const trimmed = updates.title.trim();
    if (!trimmed) {
      throw new Error('Task title cannot be empty.');
    }
    payload.title = trimmed;
  }
  if (updates.completed !== undefined) {
    payload.completed = Boolean(updates.completed);
  }
  if (updates.priority !== undefined) {
    payload.priority = normalizePriority(updates.priority);
  }
  if (updates.dueDate !== undefined) {
    const cleanDueDate = normalizeDueDate(updates.dueDate);
    payload.due_date = cleanDueDate || null;
  }

  let { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', id)
    .select('id, title, completed, priority, due_date, created_at')
    .single();

  if (error && error.code === '23502' && updates.dueDate !== undefined && payload.due_date === null) {
    const retryResult = await supabase
      .from('tasks')
      .update({ ...payload, due_date: '' })
      .eq('id', id)
      .select('id, title, completed, priority, due_date, created_at')
      .single();
    data = retryResult.data;
    error = retryResult.error;
  }

  if (error || !data) {
    throw new Error(error?.message || 'Failed to update task.');
  }

  return mapRowToTask(data as SupabaseTaskRow);
}

export async function deleteTask(id: string): Promise<void> {
  if (!supabase) {
    const current = loadTasks();
    saveTasks(current.filter((task) => task.id !== id));
    return;
  }

  const { error } = await supabase.from('tasks').delete().eq('id', id);

  if (error) {
    throw new Error(error.message || 'Failed to delete task.');
  }
}

export async function clearCompletedTasks(): Promise<void> {
  if (!supabase) {
    const current = loadTasks();
    saveTasks(current.filter((task) => !task.completed));
    return;
  }

  const { error } = await supabase.from('tasks').delete().eq('completed', true);

  if (error) {
    throw new Error(error.message || 'Failed to clear completed tasks.');
  }
}
