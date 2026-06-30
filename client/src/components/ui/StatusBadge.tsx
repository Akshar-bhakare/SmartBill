import React from 'react';
import { clsx } from 'clsx';
import { InvoiceStatus } from '../../types/invoice';

interface StatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const styles = {
    PAID: 'bg-brand-green text-foreground border-black',
    UNPAID: 'bg-brand-yellow text-foreground border-black',
    OVERDUE: 'bg-brand-coral text-foreground border-black',
    DRAFT: 'bg-neutral-200 text-neutral-800 border-black',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 border-2 text-xs font-black tracking-widest uppercase rounded-none shadow-brutal-sm',
        styles[status],
        className
      )}
    >
      ● {status}
    </span>
  );
};
