import React, { createContext, useContext, useMemo, useState } from 'react';
import { cn } from '@/utils';

const SidebarContext = createContext(null);

function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('Sidebar components must be used within <SidebarProvider>.');
  }
  return context;
}

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      toggle: () => setIsOpen((prev) => !prev),
    }),
    [isOpen],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function Sidebar({ className = '', children }) {
  const { isOpen } = useSidebarContext();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-white shadow-lg transition-transform duration-300 md:static md:h-auto md:translate-x-0 md:shadow-none',
        {
          '-translate-x-full md:translate-x-0': !isOpen,
          'translate-x-0': isOpen,
        },
        className,
      )}
    >
      {children}
    </aside>
  );
}

export function SidebarHeader({ className = '', ...props }) {
  return <div className={cn('p-4', className)} {...props} />;
}

export function SidebarFooter({ className = '', ...props }) {
  return <div className={cn('p-4 mt-auto', className)} {...props} />;
}

export function SidebarContent({ className = '', ...props }) {
  return <div className={cn('flex-1 overflow-y-auto', className)} {...props} />;
}

export function SidebarGroup({ className = '', ...props }) {
  return <div className={cn('space-y-2', className)} {...props} />;
}

export function SidebarGroupLabel({ className = '', ...props }) {
  return <div className={cn('text-xs uppercase text-slate-400 font-semibold px-2', className)} {...props} />;
}

export function SidebarGroupContent({ className = '', ...props }) {
  return <div className={cn('space-y-1', className)} {...props} />;
}

export function SidebarMenu({ className = '', ...props }) {
  return <nav className={cn('space-y-1', className)} {...props} />;
}

export function SidebarMenuItem({ className = '', ...props }) {
  return <div className={cn('w-full', className)} {...props} />;
}

export function SidebarMenuButton({
  className = '',
  children,
  asChild = false,
  onClick,
  ...props
}) {
  const { setIsOpen } = useSidebarContext();

  const handleClick = (event) => {
    if (typeof onClick === 'function') {
      onClick(event);
    }
    setIsOpen(false);
  };

  const baseClass = cn(
    'group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
    className,
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(children.props.className, baseClass),
      onClick: (event) => {
        if (typeof children.props.onClick === 'function') {
          children.props.onClick(event);
        }
        handleClick(event);
      },
      ...props,
    });
  }

  return (
    <button type="button" className={baseClass} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

export function SidebarTrigger({ className = '', children, ...props }) {
  const { toggle } = useSidebarContext();
  return (
    <button
      type="button"
      onClick={toggle}
      className={cn('inline-flex items-center justify-center rounded-lg border border-slate-200/60 p-2', className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function SidebarOverlay() {
  const { isOpen, setIsOpen } = useSidebarContext();
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
      onClick={() => setIsOpen(false)}
    />
  );
}
