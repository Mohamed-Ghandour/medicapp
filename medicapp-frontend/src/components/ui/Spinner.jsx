import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Spinner = ({ className, size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'animate-spin rounded-full border-t-primary-600 border-r-primary-600 border-b-primary-200 border-l-primary-200',
          sizes[size],
          className
        )
      )}
    />
  );
};
