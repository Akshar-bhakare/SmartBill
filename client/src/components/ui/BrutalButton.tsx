import React from 'react';
import { clsx } from 'clsx';

interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'green' | 'yellow' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const BrutalButton: React.FC<BrutalButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-brand-purple text-white hover:bg-purple-700',
    secondary: 'bg-white text-foreground hover:bg-neutral-100',
    green: 'bg-brand-green text-foreground hover:bg-lime-400',
    yellow: 'bg-brand-yellow text-foreground hover:bg-amber-300',
    danger: 'bg-brand-coral text-foreground hover:bg-red-400',
    ghost: 'bg-transparent text-foreground border-transparent shadow-none hover:underline',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-bold tracking-wide uppercase',
    md: 'px-5 py-2.5 text-sm font-bold tracking-wider uppercase',
    lg: 'px-7 py-3.5 text-base font-extrabold tracking-wider uppercase',
  };

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 cursor-pointer font-sans transition-all duration-150',
        variant !== 'ghost' && 'brutal-btn rounded-none font-bold',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
