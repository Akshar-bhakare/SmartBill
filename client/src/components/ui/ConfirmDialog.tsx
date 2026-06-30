import React from 'react';
import { BrutalButton } from './BrutalButton';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'primary';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  variant = 'danger',
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40">
      <div
        className="relative bg-white border-3 border-black shadow-brutal-lg p-8 max-w-md w-full mx-4"
        style={{ animation: 'scaleIn 150ms ease-out' }}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 hover:opacity-60 transition-opacity cursor-pointer"
        >
          <X size={20} strokeWidth={3} />
        </button>
        <h3 className="text-xl font-extrabold uppercase tracking-tight mb-2">{title}</h3>
        <p className="text-sm text-neutral-600 font-medium mb-8">{message}</p>
        <div className="flex gap-3 justify-end">
          <BrutalButton variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </BrutalButton>
          <BrutalButton variant={variant === 'danger' ? 'danger' : 'primary'} size="sm" onClick={onConfirm}>
            {confirmLabel}
          </BrutalButton>
        </div>
      </div>
    </div>
  );
};
