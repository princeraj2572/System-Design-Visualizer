'use client';

import { useRef, useState, type DragEvent } from 'react';
import { Search, ChevronDown, Clock } from 'lucide-react';
import type { NodeType } from '@/types';
import { NODE_CONFIG, NODE_CATEGORIES } from '@/components/nodes/nodeConfig';
import { useCanvasStore } from '@/store/useCanvasStore';

interface NodePaletteProps {
  onDragStart: (event: DragEvent, nodeType: NodeType) => void;
}

export default function NodePalette({ onDragStart }: NodePaletteProps) {
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const addNode = useCanvasStore((s) => s.addNode);
  const recentTypes = useCanvasStore((s) => s.recentTypes);
  // Click-to-add cascades new nodes diagonally so they don't stack exactly on top of each other.
  const clickAddCount = useRef(0);

  const handleAdd = (type: NodeType) => {
    const step = (clickAddCount.current++ % 8) * 28;
    addNode(type, { x: 280 + step, y: 160 + step });
  };

  const toggleCategory = (id: string) => setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const filtered = query.trim()
    ? (Object.entries(NODE_CONFIG) as [NodeType, typeof NODE_CONFIG[NodeType]][])
        .filter(([, c]) => {
          const q = query.toLowerCase();
          return c.label.toLowerCase().includes(q) || c.defaultTechnology.toLowerCase().includes(q);
        })
        .map(([type]) => type)
    : null;

  return (
    <aside className="w-56 flex-shrink-0 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b border-slate-100 dark:border-zinc-800">
        <h2 className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-2">
          Components
        </h2>
        {/* Search */}
        <div className="relative">
          <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-600 pointer-events-none"/>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full pl-6 pr-2 py-1.5 text-[11px] rounded-md
              bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800
              text-slate-700 dark:text-zinc-300 placeholder-slate-400 dark:placeholder-zinc-600
              focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-600
              transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
        {filtered ? (
          filtered.length === 0 ? (
            <p className="text-[10px] text-slate-400 dark:text-zinc-600 text-center py-4">No results</p>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((type) => <PaletteItem key={type} type={type} onDragStart={onDragStart} onClick={handleAdd}/>)}
            </div>
          )
        ) : (
          <>
            {recentTypes.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 px-1 mb-1">
                  <Clock size={10} className="text-slate-400 dark:text-zinc-600"/>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest whitespace-nowrap">
                    Recent
                  </p>
                  <div className="flex-1 h-px bg-slate-100 dark:bg-zinc-800"/>
                </div>
                <div className="space-y-0.5">
                  {recentTypes.map((type) => <PaletteItem key={`recent-${type}`} type={type} onDragStart={onDragStart} onClick={handleAdd}/>)}
                </div>
              </div>
            )}

            {NODE_CATEGORIES.map((category) => {
              const isCollapsed = collapsed[category.id];
              return (
                <div key={category.id}>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center gap-2 px-1 mb-1 group"
                  >
                    <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest whitespace-nowrap
                      group-hover:text-slate-600 dark:group-hover:text-zinc-400 transition-colors">
                      {category.label}
                    </p>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-zinc-800"/>
                    <ChevronDown size={11}
                      className={`text-slate-400 dark:text-zinc-600 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}/>
                  </button>
                  {!isCollapsed && (
                    <div className="space-y-0.5">
                      {category.types.map((type) => (
                        <PaletteItem key={type} type={type} onDragStart={onDragStart} onClick={handleAdd}/>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-slate-100 dark:border-zinc-800">
        <p className="text-[9px] text-slate-400 dark:text-zinc-600 text-center">
          Drag or click to add · connect handles
        </p>
      </div>
    </aside>
  );
}

function PaletteItem({ type, onDragStart, onClick }: {
  type: NodeType;
  onDragStart: (e: DragEvent, t: NodeType) => void;
  onClick: (t: NodeType) => void;
}) {
  const config = NODE_CONFIG[type];
  const { Icon } = config;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, type)}
      onClick={() => onClick(type)}
      title={config.description}
      className="group flex items-center gap-2.5 px-2 py-1.5 rounded-lg select-none cursor-grab
        active:cursor-grabbing transition-colors duration-100
        hover:bg-slate-50 dark:hover:bg-zinc-800 border border-transparent
        hover:border-slate-200 dark:hover:border-zinc-800"
    >
      {/* Accent bar */}
      <div className="w-0.5 h-6 rounded-full flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: config.accent }}/>

      {/* Icon */}
      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${config.accent}15` }}>
        <Icon size={13} style={{ color: config.accent }} strokeWidth={2}/>
      </div>

      {/* Labels */}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold truncate text-slate-600 dark:text-zinc-400
          group-hover:text-slate-900 dark:group-hover:text-zinc-100 transition-colors">
          {config.label}
        </p>
        <p className="text-[9px] truncate text-slate-400 dark:text-zinc-600 transition-colors">
          {config.defaultTechnology}
        </p>
      </div>
    </div>
  );
}
