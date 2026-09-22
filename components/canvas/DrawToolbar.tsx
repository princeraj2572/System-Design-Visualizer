'use client';

import { MousePointer2, Square, Circle, MoveUpRight, Slash, Pencil, Type } from 'lucide-react';
import type { ToolId } from '@/types';
import { useCanvasStore } from '@/store/useCanvasStore';

const TOOLS: { id: ToolId; label: string; Icon: typeof Square }[] = [
  { id: 'select', label: 'Select (V)', Icon: MousePointer2 },
  { id: 'rectangle', label: 'Rectangle (R)', Icon: Square },
  { id: 'ellipse', label: 'Ellipse (O)', Icon: Circle },
  { id: 'arrow', label: 'Arrow (A)', Icon: MoveUpRight },
  { id: 'line', label: 'Line (L)', Icon: Slash },
  { id: 'pencil', label: 'Pencil (D)', Icon: Pencil },
  { id: 'text', label: 'Text (T)', Icon: Type },
];

export default function DrawToolbar() {
  const activeTool = useCanvasStore((s) => s.activeTool);
  const setActiveTool = useCanvasStore((s) => s.setActiveTool);

  return (
    <div className="absolute top-3 left-3 z-20 flex flex-col gap-0.5 p-1 rounded-xl
      bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-700
      shadow-lg backdrop-blur-sm">
      {TOOLS.map(({ id, label, Icon }) => (
        <button
          key={id}
          title={label}
          onClick={() => setActiveTool(id)}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
            activeTool === id
              ? 'bg-indigo-500 text-white'
              : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-zinc-100'
          }`}
        >
          <Icon size={15} strokeWidth={2}/>
        </button>
      ))}
    </div>
  );
}
