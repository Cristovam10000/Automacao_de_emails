import React, { createContext, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils';

const DialogContext = createContext(null);

function useDialogContext(component) {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error(`${component} must be used within <Dialog>.`);
  }
  return context;
}

export function Dialog({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(() => ({ isOpen, setIsOpen }), [isOpen]);

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ asChild = false, children, ...props }) {
  const { setIsOpen } = useDialogContext('DialogTrigger');

  const handleClick = (event) => {
    if (typeof props.onClick === 'function') {
      props.onClick(event);
    }
    setIsOpen(true);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
    });
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

export function DialogContent({ className = '', children, ...props }) {
  const { isOpen, setIsOpen } = useDialogContext('DialogContent');
  if (!isOpen) return null;

  const portalTarget = document.body;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/50" onClick={() => setIsOpen(false)} />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>,
    portalTarget,
  );
}

export function DialogHeader({ className = '', ...props }) {
  return <div className={cn('mb-4 space-y-1', className)} {...props} />;
}

export function DialogTitle({ className = '', ...props }) {
  return <h3 className={cn('text-lg font-semibold text-slate-800', className)} {...props} />;
}

export function DialogClose({ asChild = false, children, ...props }) {
  const { setIsOpen } = useDialogContext('DialogClose');
  const handleClick = (event) => {
    if (typeof props.onClick === 'function') {
      props.onClick(event);
    }
    setIsOpen(false);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
    });
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
