import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <Loader2 size={40} className="animate-spin text-brand-purple" strokeWidth={2.5} />
    <span className="text-sm font-bold uppercase tracking-widest text-neutral-500">{message}</span>
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`border-2 border-black bg-white p-6 animate-pulse ${className || ''}`}>
    <div className="h-3 bg-neutral-200 rounded w-1/3 mb-4" />
    <div className="h-8 bg-neutral-200 rounded w-2/3 mb-2" />
    <div className="h-3 bg-neutral-200 rounded w-1/2" />
  </div>
);
