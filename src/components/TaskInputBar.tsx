import React, { useState } from 'react';
import { Calendar, Flag, Plus } from 'lucide-react';
import { Priority } from '../types/task';
import { PRIORITY_CONFIG } from '../utils/taskUtils';

interface TaskInputBarProps {
  onAddTask: (title: string, dueDate: string, priority: Priority) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const PRIORITY_OPTIONS: Priority[] = [Priority.Low, Priority.Medium, Priority.High];

export function TaskInputBar({ onAddTask, inputRef }: TaskInputBarProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Please enter a task title.');
      inputRef?.current?.focus();
      return;
    }

    onAddTask(trimmed, dueDate, priority);
    setTitle('');
    setDueDate('');
    setPriority(Priority.Medium);
    setError('');
  };

  return (
    <section aria-label="Create new task" className="bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-4 sm:p-5">
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="new-task-title" className="sr-only">
              Task title
            </label>
            <input
              ref={inputRef}
              id="new-task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="What needs to get done?"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'new-task-error' : undefined}
              className="w-full min-h-[44px] px-3.5 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 bg-slate-50/70 border border-slate-200 rounded-lg transition-colors duration-150 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="min-h-[44px] px-5 py-2.5 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.4]" aria-hidden="true" />
            <span>Add Task</span>
          </button>
        </div>

        {error && (
          <p id="new-task-error" role="alert" className="text-xs font-medium text-rose-600">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <label
                htmlFor="new-task-date"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 whitespace-nowrap"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>Due date</span>
              </label>
              <input
                id="new-task-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="min-h-[36px] px-2.5 py-1 text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-md transition-colors duration-150 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2" role="group" aria-label="Priority level">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 whitespace-nowrap">
                <Flag className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>Priority</span>
              </span>
              <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {PRIORITY_OPTIONS.map((option) => {
                  const config = PRIORITY_CONFIG[option];
                  const isSelected = priority === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPriority(option)}
                      aria-pressed={isSelected}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        isSelected
                          ? config.activeButtonClass
                          : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
