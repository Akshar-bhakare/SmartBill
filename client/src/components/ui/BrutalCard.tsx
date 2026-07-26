import React from 'react';
import { clsx } from 'clsx';

interface BrutalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  accent?: 'purple' | 'green' | 'yellow' | 'coral' | 'cyan' | 'white' | 'dark';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  thickBorder?: boolean;
}

export const BrutalCard: React.FC<BrutalCardProps> = ({
  children,
  accent = 'white',
  shadow = 'md',
  thickBorder = false,
  className,
  ...props
}) => {
  const accentClasses = {
    white: 'bg-white text-foreground',
    dark: 'bg-brand-dark text-white',
    purple: 'bg-brand-purple text-white',
    green: 'bg-brand-green text-foreground',
    yellow: 'bg-brand-yellow text-foreground',
    coral: 'bg-brand-coral text-foreground',
    cyan: 'bg-brand-cyan text-foreground',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-brutal-sm',
    md: 'shadow-brutal-md',
    lg: 'shadow-brutal-lg',
    xl: 'shadow-brutal-xl',
  };

  return (
    <div
      className={clsx(
        'rounded-none',
        thickBorder ? 'border-3 border-black' : 'border-2 border-black',
        accentClasses[accent],
        shadowClasses[shadow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
