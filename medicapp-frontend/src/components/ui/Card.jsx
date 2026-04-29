import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={twMerge(clsx('rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm', className))}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, ...props }) => (
  <div className={twMerge(clsx('flex flex-col space-y-1.5 p-6', className))} {...props} />
);

export const CardTitle = ({ className, ...props }) => (
  <h3 className={twMerge(clsx('text-lg font-semibold leading-none tracking-tight', className))} {...props} />
);

export const CardDescription = ({ className, ...props }) => (
  <p className={twMerge(clsx('text-sm text-slate-500', className))} {...props} />
);

export const CardContent = ({ className, ...props }) => (
  <div className={twMerge(clsx('p-6 pt-0', className))} {...props} />
);

export const CardFooter = ({ className, ...props }) => (
  <div className={twMerge(clsx('flex items-center p-6 pt-0', className))} {...props} />
);
