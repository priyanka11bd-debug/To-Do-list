import { ArrowUpDown, Search, X } from 'lucide-react';
import { FilterTab, SortOption } from '../types/task';

interface TaskToolbarProps {
  activeFilter: FilterTab;
  onFilterChange: (filter: FilterTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
  };
}

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: FilterTab.All, label: 'All' },
  { id: FilterTab.Active, label: 'Active' },
  { id: FilterTab.Completed, label: 'Completed' },
];

export function TaskToolbar({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  counts,
}: TaskToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div
        role="tablist"
        aria-label="Filter tasks"
        className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start"
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.id;
          const count = counts[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onFilterChange(tab.id)}
              className={`min-h-[36px] px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md inline-flex items-center gap-2 transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`font-mono text-xs tabular-nums ${
                  isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 md:max-w-md justify-end">
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <label htmlFor="task-search" className="sr-only">
            Search tasks
          </label>
          <input
            id="task-search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="w-full min-h-[40px] pl-9 pr-8 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="relative shrink-0">
          <ArrowUpDown
            className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <label htmlFor="task-sort" className="sr-only">
            Sort tasks
          </label>
          <select
            id="task-sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full sm:w-auto min-h-[40px] pl-8 pr-7 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg transition-colors duration-150 hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 cursor-pointer"
          >
            <option value={SortOption.Newest}>Sort: Newest</option>
            <option value={SortOption.DueDate}>Sort: Due Date</option>
            <option value={SortOption.Priority}>Sort: Priority</option>
          </select>
        </div>
      </div>
    </div>
  );
}
