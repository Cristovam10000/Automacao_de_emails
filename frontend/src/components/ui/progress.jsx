import React from 'react';
import { cn } from '@/utils';

export function Progress({ value = 0, className = '' }) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-200/70', className)}>
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
