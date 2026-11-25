import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { EmptyState } from './components/EmptyState';
import { Header } from './components/Header';
import { TaskCard } from './components/TaskCard';
import { TaskFooter } from './components/TaskFooter';
import { TaskInputBar } from './components/TaskInputBar';
import { TaskToolbar } from './components/TaskToolbar';
import { isSupabaseConfigured } from './lib/supabase';
import {
  clearCompletedTasks,
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from './services/taskService';
import { FilterTab, Priority, SortOption, Task } from './types/task';
import { sortTasks } from './utils/taskUtils';

function TaskListSkeleton() {
  return (
    <ul className="space-y-2.5" aria-label="Loading tasks">
      {[1, 2, 3].map((item) => (
        <li
          key={item}
          className="bg-white border border-slate-200 rounded-xl px-4 py-4 sm:px-5 animate-pulse"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-5 h-5 rounded-md bg-slate-200 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2.5">
              <div className="h-4 bg-slate-200 rounded w-3/4 max-w-md" />
              <div className="flex items-center gap-2.5">
                <div className="h-5 w-24 bg-slate-100 rounded-md" />
                <div className="h-4 w-28 bg-slate-100 rounded" />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLocalNotice, setShowLocalNotice] = useState(!isSupabaseConfigured);
  const [activeFilter, setActiveFilter] = useState<FilterTab>(FilterTab.All);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>(SortOption.Newest);

  const newTaskInputRef = useRef<HTMLInputElement>(null);

  const loadAllTasks = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to connect to Supabase. Please verify your table and RLS policies.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAllTasks();
  }, [loadAllTasks]);

  const counts = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [tasks]);

  const filteredAndSortedTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = tasks.filter((task) => {
      if (activeFilter === FilterTab.Active && task.completed) return false;
      if (activeFilter === FilterTab.Completed && !task.completed) return false;
      if (query && !task.title.toLowerCase().includes(query)) return false;
      return true;
    });

    return sortTasks(filtered, sortBy);
  }, [tasks, activeFilter, searchQuery, sortBy]);

  const handleAddTask = async (
    title: string,
    dueDate: string,
    priority: Priority
  ) => {
    setErrorMessage(null);
    try {
      const created = await createTask({ title, dueDate, priority });
      setTasks((prev) => [created, ...prev]);
      if (activeFilter === FilterTab.Completed) {
        setActiveFilter(FilterTab.All);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to create task.'
      );
    }
  };

  const handleToggleTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const nextCompleted = !target.completed;
    setErrorMessage(null);
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: nextCompleted } : task
      )
    );

    try {
      const updated = await updateTask(id, { completed: nextCompleted });
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updated : task))
      );
    } catch (err) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, completed: target.completed } : task
        )
      );
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to update task.'
      );
    }
  };

  const handleUpdateTask = async (
    id: string,
    updates: { title: string; priority: Priority; dueDate: string }
  ) => {
    const previous = tasks.find((t) => t.id === id);
    if (!previous) return;

    setErrorMessage(null);
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              title: updates.title,
              priority: updates.priority,
              dueDate: updates.dueDate,
            }
          : task
      )
    );

    try {
      const updated = await updateTask(id, updates);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updated : task))
      );
    } catch (err) {
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? previous : task))
      );
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to save task changes.'
      );
    }
  };

  const handleDeleteTask = async (id: string) => {
    const previousTasks = tasks;
    setErrorMessage(null);
    setTasks((prev) => prev.filter((task) => task.id !== id));

    try {
      await deleteTask(id);
    } catch (err) {
      setTasks(previousTasks);
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to delete task.'
      );
    }
  };

  const handleClearCompleted = async () => {
    const previousTasks = tasks;
    setErrorMessage(null);
    setTasks((prev) => prev.filter((task) => !task.completed));

    try {
      await clearCompletedTasks();
    } catch (err) {
      setTasks(previousTasks);
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to clear completed tasks.'
      );
    }
  };

  const handleResetFilters = () => {
    setActiveFilter(FilterTab.All);
    setSearchQuery('');
  };

  const handleFocusNewTask = () => {
    newTaskInputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        totalCount={counts.total}
        completedCount={counts.completed}
        pendingCount={counts.pending}
      />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {showLocalNotice && (
          <div className="bg-white border border-amber-200 rounded-xl px-4 py-3 flex items-start justify-between gap-3 text-xs sm:text-sm text-slate-700">
            <p className="leading-relaxed">
              Supabase environment variables (<span className="font-mono text-slate-900">VITE_SUPABASE_URL</span> and{' '}
              <span className="font-mono text-slate-900">VITE_SUPABASE_ANON_KEY</span>) are not set yet. Running in browser storage mode until configured in Secrets.
            </p>
            <button
              type="button"
              onClick={() => setShowLocalNotice(false)}
              aria-label="Dismiss notice"
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm text-rose-800"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
              <span className="truncate">{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => void loadAllTasks()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-white border border-rose-200 hover:bg-rose-100/60 rounded-lg shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Retry</span>
            </button>
          </div>
        )}

        <TaskInputBar onAddTask={handleAddTask} inputRef={newTaskInputRef} />

        <div className="space-y-4">
          <TaskToolbar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            counts={{
              all: counts.total,
              active: counts.pending,
              completed: counts.completed,
            }}
          />

          {isLoading ? (
            <TaskListSkeleton />
          ) : filteredAndSortedTasks.length > 0 ? (
            <ul className="space-y-2.5" aria-label="Task list">
              {filteredAndSortedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </ul>
          ) : (
            <EmptyState
              hasAnyTasks={tasks.length > 0}
              activeFilter={activeFilter}
              searchQuery={searchQuery}
              onResetFilters={handleResetFilters}
              onFocusNewTask={handleFocusNewTask}
            />
          )}
        </div>

        <TaskFooter
          pendingCount={counts.pending}
          completedCount={counts.completed}
          onClearCompleted={handleClearCompleted}
        />
      </main>
    </div>
  );
}
