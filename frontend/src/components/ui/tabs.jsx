import React, { createContext, useContext, useMemo, useState } from 'react';
import { cn } from '@/utils';

const TabsContext = createContext(null);

function useTabsContext(component) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`${component} must be used inside <Tabs>.`);
  }
  return context;
}

export function Tabs({ defaultValue, value: controlledValue, onValueChange, children, className = '' }) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);

  const value = isControlled ? controlledValue : internalValue;

  const contextValue = useMemo(
    () => ({
      value,
      setValue: (next) => {
        if (!isControlled) {
          setInternalValue(next);
        }
        if (typeof onValueChange === 'function') {
          onValueChange(next);
        }
      },
    }),
    [isControlled, onValueChange, value],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = '', ...props }) {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-600',
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ value, className = '', children, ...props }) {
  const { value: activeValue, setValue } = useTabsContext('TabsTrigger');
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      onClick={() => setValue(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
        {
          'bg-white text-blue-600 shadow': isActive,
          'text-slate-500 hover:text-slate-700': !isActive,
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = '', children, ...props }) {
  const { value: activeValue } = useTabsContext('TabsContent');
  if (value !== activeValue) {
    return null;
  }

  return (
    <div className={cn('mt-4', className)} {...props}>
      {children}
    </div>
  );
}
