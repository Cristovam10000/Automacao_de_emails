import React from 'react';
import { cn } from '@/utils';

const variants = {
  default: 'bg-primary text-primary-foreground hover:opacity-90 shadow-corporate',
  outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600',
  link: 'bg-transparent underline-offset-4 hover:underline p-0 h-auto text-blue-600',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
};

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10 p-0',
};

export function Button({
  as: Comp = 'button',
  className = '',
  variant = 'default',
  size = 'md',
  type,
  ...props
}) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/70 focus-visible:ring-offset-2',
    variants[variant] ?? variants.default,
    sizes[size] ?? sizes.md,
    className,
  );

  const resolvedType = Comp === 'button' && !type ? 'button' : type;

  return <Comp className={classes} type={resolvedType} {...props} />;
}
