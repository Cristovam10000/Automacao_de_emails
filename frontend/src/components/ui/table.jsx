import React from 'react';
import { cn } from '@/utils';

export function Table({ className = '', ...props }) {
  return <table className={cn('w-full caption-bottom text-sm', className)} {...props} />;
}

export function TableHeader({ className = '', ...props }) {
  return <thead className={cn('[&_tr]:border-b border-slate-200', className)} {...props} />;
}

export function TableBody({ className = '', ...props }) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export function TableRow({ className = '', ...props }) {
  return <tr className={cn('border-b border-slate-200/80 transition-colors', className)} {...props} />;
}

export function TableHead({ className = '', ...props }) {
  return (
    <th
      className={cn(
        'h-12 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-slate-500',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className = '', ...props }) {
  return <td className={cn('p-4 align-middle text-sm text-slate-600', className)} {...props} />;
}

export function TableCaption({ className = '', ...props }) {
  return <caption className={cn('mt-4 text-sm text-slate-500', className)} {...props} />;
}
