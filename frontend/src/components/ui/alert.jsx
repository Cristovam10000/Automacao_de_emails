import React from 'react';
import { cn } from '@/utils';

const variantStyles = {
  default: 'border-slate-200 bg-white text-slate-700',
  destructive: 'border-red-200 bg-red-50 text-red-700',
};

export function Alert({ className = '', variant = 'default', ...props }) {
  return (
    <div
      role="alert"
      className={cn(
        'w-full rounded-xl border p-4 shadow-sm',
        variantStyles[variant] ?? variantStyles.default,
        className,
      )}
      {...props}
    />
  );
}

export function AlertDescription({ className = '', ...props }) {
  return <div className={cn('text-sm leading-relaxed', className)} {...props} />;
}
