import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Badge = ({ className, variant = 'default', children, ...props }) => {
  const baseStyles = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  
  const variants = {
    default: 'border-transparent bg-slate-100 text-slate-900',
    primary: 'border-transparent bg-primary-100 text-primary-900',
    success: 'border-transparent bg-green-100 text-green-900',
    warning: 'border-transparent bg-yellow-100 text-yellow-900',
    danger: 'border-transparent bg-red-100 text-red-900',
    outline: 'text-slate-950',
  };

  return (
    <div className={twMerge(clsx(baseStyles, variants[variant], className))} {...props}>
      {children}
    </div>
  );
};
