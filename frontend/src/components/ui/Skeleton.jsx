import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Skeleton({ className = '', variant = 'rectangular', ...props }) {
  const base = 'animate-pulse bg-slate-200 dark:bg-slate-800/80';
  const variants = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-md h-4',
  };

  return (
    <div
      className={twMerge(clsx(base, variants[variant], className))}
      {...props}
    />
  );
}
