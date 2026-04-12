'use client';

import { Loader2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
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
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
        onClick={() => {
          if (!loading) onCancel();
        }}
      ></div>
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-outline/30 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Confirm Action</p>
            <h4 className="text-xl font-black tracking-tight text-on-surface mt-2">{title}</h4>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={() => {
              if (!loading) onCancel();
            }}
            className="p-2 hover:bg-surface rounded-full transition-colors"
            disabled={loading}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-outline text-on-surface-variant py-3 rounded-lg font-bold uppercase tracking-[0.15em] text-[10px] hover:bg-surface transition-all"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-primary text-white py-3 rounded-lg font-bold uppercase tracking-[0.15em] text-[10px] hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
