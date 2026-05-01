
import { Loader2, X, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      bg: 'bg-primary/10',
      icon: 'text-primary',
      button: 'bg-primary hover:shadow-primary/30',
      tag: 'text-primary'
    },
    warning: {
      bg: 'bg-amber-100',
      icon: 'text-amber-600',
      button: 'bg-amber-600 hover:shadow-amber-600/30',
      tag: 'text-amber-600'
    },
    info: {
      bg: 'bg-sky-100',
      icon: 'text-sky-600',
      button: 'bg-sky-600 hover:shadow-sky-600/30',
      tag: 'text-sky-600'
    }
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => {
          if (!loading) onCancel();
        }}
      ></div>

      {/* Dialog Container */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-outline/30 p-8 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className={`p-4 rounded-full ${style.bg} mb-2`}>
            <AlertTriangle className={`w-8 h-8 ${style.icon}`} />
          </div>
          
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${style.tag}`}>System Confirmation</p>
            <h4 className="text-2xl font-black tracking-tighter text-on-surface mt-2">{title}</h4>
            <p className="text-sm text-on-surface-variant mt-3 leading-relaxed font-medium">{message}</p>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-outline text-on-surface-variant py-4 rounded-xl font-bold uppercase tracking-[0.15em] text-[10px] hover:bg-surface transition-all active:scale-95"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 ${style.button} text-white py-4 rounded-xl font-bold uppercase tracking-[0.15em] text-[10px] hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95`}
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            {confirmText}
          </button>
        </div>
        
        <button
          onClick={() => {
            if (!loading) onCancel();
          }}
          className="absolute top-4 right-4 p-2 hover:bg-surface rounded-full transition-colors text-on-surface-variant"
          disabled={loading}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
