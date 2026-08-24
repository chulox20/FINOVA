import React from 'react';
import { clsx } from 'clsx';

export function Toggle({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  id,
}) {
  const toggleId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label
      htmlFor={toggleId}
      className={clsx(
        'flex items-center justify-between gap-4 select-none cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {description}
            </span>
          )}
        </div>
      )}

      <div className="relative inline-flex items-center shrink-0">
        <input
          id={toggleId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only"
        />
        <div
          className={clsx(
            'w-11 h-6 rounded-full transition-colors duration-200 ease-in-out',
            checked ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
          )}
        />
        <div
          className={clsx(
            'absolute left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out shadow-sm',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </div>
    </label>
  );
}
