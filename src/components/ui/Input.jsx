import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    type = 'text',
    leftIcon,
    rightIcon,
    prefix,
    suffix,
    className = '',
    containerClassName = '',
    id,
    required,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={twMerge('w-full flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}

        {prefix && (
          <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 text-sm font-medium select-none">
            {prefix}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={twMerge(
            clsx(
              'w-full text-sm bg-white dark:bg-dark-input text-slate-900 dark:text-slate-100 border rounded-xl transition-colors duration-150',
              'placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500',
              error
                ? 'border-rose-500 dark:border-rose-500/80 focus:ring-rose-500/20 focus:border-rose-500'
                : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600',
              leftIcon || prefix ? 'pl-10' : 'pl-3.5',
              rightIcon || suffix ? 'pr-10' : 'pr-3.5',
              'py-2.5',
              className
            )
          )}
          {...props}
        />

        {suffix && (
          <span className="absolute right-3.5 text-slate-400 dark:text-slate-500 text-sm font-medium select-none">
            {suffix}
          </span>
        )}

        {rightIcon && (
          <div className="absolute right-3.5 text-slate-400 dark:text-slate-500 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-rose-500 dark:text-rose-400 font-medium flex items-center gap-1">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
});
