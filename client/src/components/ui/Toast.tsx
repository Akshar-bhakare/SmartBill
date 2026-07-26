import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-brand-green',
    error: 'bg-brand-coral',
    info: 'bg-brand-cyan',
  };

  return (
    <div
      className={clsx(
        'flex items-center justify-between gap-3 px-5 py-3 border-2 border-black shadow-brutal-sm font-bold text-sm text-foreground animate-slide-in',
        colors[toast.type]
      )}
      style={{ animation: 'slideIn 200ms ease-out' }}
    >
      <span>{toast.message}</span>
      <button onClick={onClose} className="shrink-0 hover:opacity-60 transition-opacity cursor-pointer">
        <X size={16} strokeWidth={3} />
      </button>
    </div>
  );
};
