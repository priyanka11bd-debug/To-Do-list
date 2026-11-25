import { Trash2 } from 'lucide-react';

interface TaskFooterProps {
  pendingCount: number;
  completedCount: number;
  onClearCompleted: () => void;
}

export function TaskFooter({
  pendingCount,
  completedCount,
  onClearCompleted,
}: TaskFooterProps) {
  return (
    <footer className="pt-2 pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200/80 text-sm">
      <p className="text-slate-500 text-xs sm:text-sm tabular-nums">
        <span className="font-medium text-slate-700">{pendingCount}</span>{' '}
        {pendingCount === 1 ? 'task' : 'tasks'} remaining
        <span className="mx-2 text-slate-300" aria-hidden="true">
          ·
        </span>
        <span className="font-medium text-slate-700">{completedCount}</span> completed
      </p>

      <button
        type="button"
        onClick={onClearCompleted}
        disabled={completedCount === 0}
        className={`min-h-[40px] px-4 py-2 rounded-lg text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-2 border transition-all duration-150 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
          completedCount > 0
            ? 'bg-white border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/70 shadow-2xs cursor-pointer'
            : 'bg-slate-100/60 border-slate-200/60 text-slate-400 cursor-not-allowed'
        }`}
      >
        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        <span>
          Clear Completed{completedCount > 0 ? ` (${completedCount})` : ''}
        </span>
      </button>
    </footer>
  );
}
