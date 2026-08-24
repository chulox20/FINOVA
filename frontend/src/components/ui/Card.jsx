import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({
  children,
  className = '',
  hoverEffect = false,
  glass = false,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx(
          'rounded-2xl border transition-all duration-200',
          glass
            ? 'bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-white/20 dark:border-slate-800/80 shadow-glass'
            : 'bg-white dark:bg-dark-card border-slate-200/80 dark:border-dark-border shadow-sm',
          hoverEffect && 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 cursor-pointer',
          'p-5 sm:p-6',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={twMerge('flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={twMerge('text-base font-bold text-slate-900 dark:text-slate-100', className)} {...props}>
      {children}
    </h3>
  );
}
