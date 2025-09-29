import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { cn } from '@/utils';

const SelectContext = createContext(null);

function useSelectContext(componentName) {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error(`${componentName} must be used inside <Select>.`);
  }
  return context;
}

export function Select({ value, onValueChange, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [labels, setLabels] = useState(new Map());

  useEffect(
    () => {
    setLabels((prev) => new Map(prev)
  );
  }, [value]);

  const contextValue = useMemo(
    () => ({
      value,
      isOpen,
      setIsOpen,
      registerLabel: (optionValue, label) => {
        setLabels((prev) => {
          if (prev.get(optionValue) === label) return prev;
          const updated = new Map(prev);
          updated.set(optionValue, label);
          return updated;
        });
      },
      selectValue: (optionValue) => {
        if (typeof onValueChange === 'function') {
          onValueChange(optionValue);
        }
        setIsOpen(false);
      },
      getLabel: (optionValue) => labels.get(optionValue),
    }),
    [isOpen, labels, onValueChange, value],
  );

  return <SelectContext.Provider value={contextValue}>{children}</SelectContext.Provider>;
}

export function SelectTrigger({ className = '', children, ...props }) {
  const { setIsOpen, isOpen } = useSelectContext('SelectTrigger');
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        'flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SelectValue({ placeholder = 'Selecione...', className = '' }) {
  const { value, getLabel } = useSelectContext('SelectValue');
  const label = value != null ? getLabel(value) : null;
  return <span className={cn('text-left flex-1 truncate text-sm', className)}>{label ?? placeholder}</span>;
}

export function SelectContent({ className = '', ...props }) {
  const { isOpen } = useSelectContext('SelectContent');
  if (!isOpen) return null;
  return (
    <div
      className={cn(
        'relative z-50 mt-2 w-full rounded-lg border border-slate-200 bg-white p-2 shadow-lg',
        className,
      )}
      {...props}
    />
  );
}

export function SelectItem({ className = '', value, children, ...props }) {
  const { value: selected, selectValue, registerLabel } = useSelectContext('SelectItem');

  useEffect(() => {
    if (value != null) {
      const label = typeof children === 'string' ? children : React.Children.toArray(children).join('');
      registerLabel(value, label);
    }
  }, [children, registerLabel, value]);

  const isActive = selected === value;

  return (
    <button
      type="button"
      onClick={() => selectValue(value)}
      className={cn(
        'flex w-full items-center rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100',
        { 'bg-blue-50 text-blue-700': isActive },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
