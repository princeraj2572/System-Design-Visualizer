'use client';

import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  widthClass?: string;
}

export function Modal({ onClose, children, widthClass = 'w-96' }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`${widthClass} max-w-[90vw] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700
          rounded-xl shadow-2xl overflow-hidden`}
      >
        {children}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal onClose={onCancel}>
      <div className="px-5 pt-4 pb-3">
        <h2 className="text-[13px] font-semibold text-slate-800 dark:text-zinc-100">{title}</h2>
        <p className="text-[12px] text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">{message}</p>
      </div>
      <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 dark:border-zinc-800">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-md text-[11px] font-medium text-slate-500 dark:text-zinc-400
            hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${
            danger
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
