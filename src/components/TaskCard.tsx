import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Check, Pencil, Trash2, X } from 'lucide-react';
import { Priority, Task } from '../types/task';
import { formatDueDate, PRIORITY_CONFIG } from '../utils/taskUtils';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: { title: string; priority: Priority; dueDate: string }) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_OPTIONS: Priority[] = [Priority.Low, Priority.Medium, Priority.High];

export function TaskCard({ task, onToggle, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editDueDate, setEditDueDate] = useState(task.dueDate);
  const [editError, setEditError] = useState('');

  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate);
    setEditError('');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditError('');
  };

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = editTitle.trim();
    if (!trimmed) {
      setEditError('Task title cannot be empty.');
      editInputRef.current?.focus();
      return;
    }

    onUpdate(task.id, {
      title: trimmed,
      priority: editPriority,
      dueDate: editDueDate,
    });
    setIsEditing(false);
    setEditError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const priorityMeta = PRIORITY_CONFIG[task.priority];
  const dueDisplay = formatDueDate(task.dueDate, task.completed);

  if (isEditing) {
    return (
      <li className="bg-white border border-indigo-300 rounded-xl p-4 sm:p-5 shadow-[0_2px_10px_rgba(79,70,229,0.08)] transition-all duration-150">
        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label htmlFor={`edit-title-${task.id}`} className="sr-only">
              Edit task title
            </label>
            <input
              ref={editInputRef}
              id={`edit-title-${task.id}`}
              type="text"
              value={editTitle}
              onChange={(e) => {
                setEditTitle(e.target.value);
                if (editError) setEditError('');
              }}
              onKeyDown={handleKeyDown}
              className="w-full min-h-[42px] px-3 py-2 text-[15px] font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500"
            />
            {editError && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
                {editError}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label
                  htmlFor={`edit-date-${task.id}`}
                  className="text-xs font-medium text-slate-500 whitespace-nowrap"
                >
                  Due date
                </label>
                <div className="flex items-center gap-1">
                  <input
                    id={`edit-date-${task.id}`}
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="min-h-[36px] px-2.5 py-1 text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500"
                  />
                  {editDueDate && (
                    <button
                      type="button"
                      onClick={() => setEditDueDate('')}
                      aria-label="Clear due date"
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg" role="group" aria-label="Edit priority">
                {PRIORITY_OPTIONS.map((option) => {
                  const cfg = PRIORITY_CONFIG[option];
                  const selected = editPriority === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setEditPriority(option)}
                      aria-pressed={selected}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        selected
                          ? cfg.activeButtonClass
                          : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={cancelEditing}
                className="min-h-[36px] px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[36px] px-4 py-1.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li
      className={`group bg-white border border-slate-200 rounded-xl px-4 py-3.5 sm:px-5 sm:py-4 transition-all duration-150 hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(15,23,42,0.05)] ${
        task.completed ? 'bg-white/80' : ''
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-3.5">
        <button
          type="button"
          role="checkbox"
          aria-checked={task.completed}
          aria-label={task.completed ? `Mark "${task.title}" as active` : `Mark "${task.title}" as completed`}
          onClick={() => onToggle(task.id)}
          className="min-w-[44px] min-h-[44px] -ml-2.5 -mt-2 flex items-center justify-center shrink-0 rounded-lg cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <span
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150 ${
              task.completed
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-white border-slate-300 group-hover:border-indigo-400'
            }`}
          >
            {task.completed && <Check className="w-3.5 h-3.5 stroke-[2.75]" aria-hidden="true" />}
          </span>
        </button>

        <div className="flex-1 min-w-0 pt-0.5">
          <p
            onDoubleClick={startEditing}
            className={`text-[15px] leading-snug font-medium break-words transition-colors duration-150 ${
              task.completed ? 'text-slate-400 line-through' : 'text-slate-900'
            }`}
          >
            {task.title}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium whitespace-nowrap ${
                task.completed
                  ? 'bg-slate-100 text-slate-500 border border-slate-200'
                  : priorityMeta.badgeClass
              }`}
            >
              {priorityMeta.label} Priority
            </span>

            {dueDisplay.status !== 'none' && (
              <>
                <span className="text-slate-300" aria-hidden="true">
                  ·
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 font-mono tabular-nums whitespace-nowrap ${
                    task.completed
                      ? 'text-slate-400'
                      : dueDisplay.status === 'overdue'
                        ? 'text-rose-600 font-medium'
                        : dueDisplay.status === 'today'
                          ? 'text-amber-700 font-medium'
                          : 'text-slate-500'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{dueDisplay.label}</span>
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 -mr-1.5">
          <button
            type="button"
            onClick={startEditing}
            aria-label={`Edit "${task.title}"`}
            title="Edit task"
            className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            aria-label={`Delete "${task.title}"`}
            title="Delete task"
            className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </li>
  );
}
