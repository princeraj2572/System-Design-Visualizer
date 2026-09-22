'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, type DragEvent } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import NodePalette from '@/components/palette/NodePalette';
import PropertiesPanel from '@/components/panel/PropertiesPanel';
import Toolbar from '@/components/toolbar/Toolbar';
import type { NodeType } from '@/types';

// React Flow requires browser APIs — disable SSR for the canvas
const ArchitectureCanvas = dynamic(
  () => import('@/components/canvas/ArchitectureCanvas'),
  { ssr: false, loading: () => <div className="flex-1 bg-slate-100 dark:bg-zinc-950" /> }
);

function StatusBar() {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  return (
    <div className="h-6 flex-shrink-0 bg-slate-50 dark:bg-zinc-900/80 border-t border-slate-200 dark:border-zinc-800 flex items-center px-4 gap-4 select-none">
      <div className="flex items-center gap-3">
        <span className="text-[9px] font-medium text-slate-400 dark:text-zinc-500">
          <span className="text-slate-600 dark:text-zinc-400">{nodes.length}</span> nodes
        </span>
        <span className="text-slate-300 dark:text-zinc-700">·</span>
        <span className="text-[9px] font-medium text-slate-400 dark:text-zinc-500">
          <span className="text-slate-600 dark:text-zinc-400">{edges.length}</span> connections
        </span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-3 text-[9px] font-medium text-slate-400 dark:text-zinc-600">
        <span><kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-500 text-[8px]">Del</kbd> delete</span>
        <span><kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-500 text-[8px]">Ctrl Z</kbd> undo</span>
        <span><kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-500 text-[8px]">Ctrl D</kbd> duplicate</span>
        <span><kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-500 text-[8px]">arrows</kbd> nudge</span>
        <span>drag handles to connect</span>
      </div>
    </div>
  );
}

export default function Page() {
  const theme = useCanvasStore((s) => s.theme);
  const setTheme = useCanvasStore((s) => s.setTheme);

  // On mount, adopt whatever theme the blocking init script (in <head>) already
  // applied to <html>, so the store stays in sync with what's on screen.
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync Tailwind dark mode class with store theme on every *subsequent* change.
  // The initial class is already set by the blocking init script, so skip the
  // first run here to avoid a one-frame flash while the effect above catches up.
  const isFirstThemeSync = useRef(true);
  useEffect(() => {
    if (isFirstThemeSync.current) { isFirstThemeSync.current = false; return; }
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const onDragStart = useCallback((event: DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-zinc-950">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <NodePalette onDragStart={onDragStart} />
        <ArchitectureCanvas />
        <PropertiesPanel />
      </div>
      <StatusBar />
    </div>
  );
}
