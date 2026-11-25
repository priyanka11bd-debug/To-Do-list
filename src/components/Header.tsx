import { CheckSquare } from 'lucide-react';

interface HeaderProps {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
}

export function Header({ totalCount, completedCount, pendingCount }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs"
            aria-hidden="true"
          >
            <CheckSquare className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
            Taskflow
          </h1>
        </div>

        <div
          className="flex items-center gap-4 sm:gap-6 text-sm"
          aria-label="Task summary counters"
        >
          <div className="flex items-baseline gap-1.5 whitespace-nowrap shrink-0">
            <span className="font-mono font-semibold text-base text-slate-900 tabular-nums">
              {totalCount}
            </span>
            <span className="text-slate-500 text-xs sm:text-sm">Total</span>
          </div>

          <span className="h-4 w-px bg-slate-200" aria-hidden="true" />

          <div className="flex items-baseline gap-1.5 whitespace-nowrap shrink-0">
            <span className="font-mono font-semibold text-base text-emerald-700 tabular-nums">
              {completedCount}
            </span>
            <span className="text-slate-500 text-xs sm:text-sm">Completed</span>
          </div>

          <span className="h-4 w-px bg-slate-200" aria-hidden="true" />

          <div className="flex items-baseline gap-1.5 whitespace-nowrap shrink-0">
            <span className="font-mono font-semibold text-base text-indigo-600 tabular-nums">
              {pendingCount}
            </span>
            <span className="text-slate-500 text-xs sm:text-sm">Pending</span>
          </div>
        </div>
      </div>
    </header>
  );
}
