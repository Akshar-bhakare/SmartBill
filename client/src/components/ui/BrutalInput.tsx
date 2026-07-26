import React from 'react';
import { clsx } from 'clsx';

interface BrutalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const BrutalInput = React.forwardRef<HTMLInputElement, BrutalInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-extrabold uppercase tracking-wider text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full px-3.5 py-2.5 bg-white text-foreground font-sans font-medium text-sm border-2 border-black focus:outline-none focus:ring-2 focus:ring-brand-purple rounded-none transition-all',
            error && 'border-brand-coral ring-2 ring-brand-coral',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs font-bold text-red-600 tracking-tight">{error}</span>}
      </div>
    );
  }
);

BrutalInput.displayName = 'BrutalInput';

interface BrutalTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const BrutalTextarea = React.forwardRef<HTMLTextAreaElement, BrutalTextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-extrabold uppercase tracking-wider text-foreground">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={clsx(
            'w-full px-3.5 py-2.5 bg-white text-foreground font-sans font-medium text-sm border-2 border-black focus:outline-none focus:ring-2 focus:ring-brand-purple rounded-none transition-all min-h-[90px]',
            error && 'border-brand-coral ring-2 ring-brand-coral',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs font-bold text-red-600 tracking-tight">{error}</span>}
      </div>
    );
  }
);

BrutalTextarea.displayName = 'BrutalTextarea';

interface BrutalSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const BrutalSelect = React.forwardRef<HTMLSelectElement, BrutalSelectProps>(
  ({ label, error, children, className, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-extrabold uppercase tracking-wider text-foreground">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={clsx(
            'w-full px-3.5 py-2.5 bg-white text-foreground font-sans font-bold text-sm border-2 border-black focus:outline-none focus:ring-2 focus:ring-brand-purple rounded-none transition-all cursor-pointer',
            error && 'border-brand-coral ring-2 ring-brand-coral',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs font-bold text-red-600 tracking-tight">{error}</span>}
      </div>
    );
  }
);

BrutalSelect.displayName = 'BrutalSelect';
