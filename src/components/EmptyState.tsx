import { ClipboardList, SearchX } from 'lucide-react';
import { FilterTab } from '../types/task';

interface EmptyStateProps {
  hasAnyTasks: boolean;
  activeFilter: FilterTab;
  searchQuery: string;
  onResetFilters: () => void;
  onFocusNewTask: () => void;
}

export function EmptyState({
  hasAnyTasks,
  activeFilter,
  searchQuery,
  onResetFilters,
  onFocusNewTask,
}: EmptyStateProps) {
  if (!hasAnyTasks) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl py-12 px-6 text-center">
        <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3.5">
          <ClipboardList className="w-5 h-5" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-slate-900">
          Your task list is empty
        </h2>
        <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
          Add your first task above with a priority level and due date to start organizing your day.
        </p>
        <button
          type="button"
          onClick={onFocusNewTask}
          className="mt-5 min-h-[40px] px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Create First Task
        </button>
      </div>
    );
  }

  const filterLabel =
    activeFilter === FilterTab.Active
      ? 'active'
      : activeFilter === FilterTab.Completed
        ? 'completed'
        : '';

  return (
    <div className="bg-white border border-slate-200 rounded-xl py-12 px-6 text-center">
      <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3.5">
        <SearchX className="w-5 h-5" aria-hidden="true" />
      </div>
      <h2 className="text-base font-semibold text-slate-900">
        No matching tasks found
      </h2>
      <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
        {searchQuery
          ? `No ${filterLabel ? `${filterLabel} ` : ''}tasks match "${searchQuery}".`
          : `You don't have any ${filterLabel} tasks right now.`}
      </p>
      <button
        type="button"
        onClick={onResetFilters}
        className="mt-5 min-h-[40px] px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        Reset Filters
      </button>
    </div>
  );
}
