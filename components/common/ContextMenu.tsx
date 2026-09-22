'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface ContextMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });

  useEffect(() => {
    // Keep the menu on-screen if it was opened near an edge.
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const clampedX = Math.min(x, window.innerWidth - rect.width - 8);
    const clampedY = Math.min(y, window.innerHeight - rect.height - 8);
    setPos({ x: Math.max(8, clampedX), y: Math.max(8, clampedY) });
  }, [x, y]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    document.addEventListener('contextmenu', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('contextmenu', onDown);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{ left: pos.x, top: pos.y }}
      className="fixed z-[200] min-w-[170px] py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700
        rounded-lg shadow-xl overflow-hidden"
    >
      {items.map((item, i) => (
        <button
          key={i}
          disabled={item.disabled}
          onClick={() => { item.onClick(); onClose(); }}
          className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-left transition-colors
            disabled:opacity-30 disabled:cursor-not-allowed
            ${item.danger
              ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40'
              : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
