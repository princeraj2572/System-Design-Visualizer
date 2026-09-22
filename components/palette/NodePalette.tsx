'use client';

import { useEffect, useRef, useState, type DragEvent } from 'react';
import { Search, ChevronDown, Clock, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import type { NodeProvider, NodeType } from '@/types';
import { NODE_CONFIG, PROVIDER_CATEGORIES, PROVIDER_LABELS } from '@/components/nodes/nodeConfig';
import { useCanvasStore } from '@/store/useCanvasStore';

interface NodePaletteProps {
  onDragStart: (event: DragEvent, nodeType: NodeType) => void;
}

const PROVIDERS: NodeProvider[] = ['generic', 'aws', 'azure', 'gcp'];

const MIN_WIDTH = 180;
const MAX_WIDTH = 420;
const DEFAULT_WIDTH = 224;
const RAIL_WIDTH = 40;
const WIDTH_KEY = 'sysvis-palette-width';
const COLLAPSED_KEY = 'sysvis-palette-collapsed';

export default function NodePalette({ onDragStart }: NodePaletteProps) {
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState<NodeProvider>('generic');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const widthRef = useRef(width);
  const addNode = useCanvasStore((s) => s.addNode);
  const recentTypes = useCanvasStore((s) => s.recentTypes);
  // Click-to-add cascades new nodes diagonally so they don't stack exactly on top of each other.
  const clickAddCount = useRef(0);

  useEffect(() => { widthRef.current = width; }, [width]);

  // Restore saved width/collapsed state on mount (SSR has no localStorage, so
  // this can't be the initial useState value without a hydration mismatch).
  useEffect(() => {
    try {
      const savedWidth = localStorage.getItem(WIDTH_KEY);
      if (savedWidth) setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, parseInt(savedWidth, 10))));
      setPanelCollapsed(localStorage.getItem(COLLAPSED_KEY) === 'true');
    } catch {}
  }, []);

  const togglePanelCollapsed = () => {
    setPanelCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(COLLAPSED_KEY, String(next)); } catch {}
      return next;
    });
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = widthRef.current;
    const onMove = (ev: MouseEvent) => {
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + (ev.clientX - startX)));
      // Update the ref synchronously — mouseup can fire before React flushes
      // the effect that would otherwise keep it in sync with state.
      widthRef.current = next;
      setWidth(next);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      try { localStorage.setItem(WIDTH_KEY, String(widthRef.current)); } catch {}
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const toggleCategory = (id: string) => setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleAdd = (type: NodeType) => {
    const step = (clickAddCount.current++ % 8) * 28;
    addNode(type, { x: 280 + step, y: 160 + step });
  };

  const categories = PROVIDER_CATEGORIES[provider];
  const recentInProvider = recentTypes.filter((t) => NODE_CONFIG[t].provider === provider);

  const filtered = query.trim()
    ? (Object.entries(NODE_CONFIG) as [NodeType, typeof NODE_CONFIG[NodeType]][])
        .filter(([, c]) => {
          if (c.provider !== provider) return false;
          const q = query.toLowerCase();
          return c.label.toLowerCase().includes(q) || c.defaultTechnology.toLowerCase().includes(q);
        })
        .map(([type]) => type)
    : null;

  if (panelCollapsed) {
    return (
      <aside
        style={{ width: RAIL_WIDTH }}
        className="flex-shrink-0 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col items-center pt-3"
      >
        <button
          onClick={togglePanelCollapsed}
          title="Show components panel"
          className="p-1.5 rounded-md text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200
            hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <PanelLeftOpen size={15}/>
        </button>
      </aside>
    );
  }

  return (
    <aside
      style={{ width }}
      className="relative flex-shrink-0 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden"
    >
      {/* Resize handle — wider invisible hit area than the visible 1px line.
          Kept fully inside the aside's own box: the aside has overflow-hidden
          (to clip the accent strip inside PaletteItems), which would clip any
          part of this handle positioned outside it, the same way it clipped
          node connection handles elsewhere in the app. */}
      <div
        onMouseDown={startResize}
        className="absolute top-0 right-0 h-full w-3 cursor-col-resize z-10 group"
      >
        <div className="w-px h-full ml-auto bg-transparent group-hover:bg-indigo-400/50 group-active:bg-indigo-400/70 transition-colors"/>
      </div>

      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
            Components
          </h2>
          <button
            onClick={togglePanelCollapsed}
            title="Hide components panel"
            className="p-0.5 rounded text-slate-300 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-zinc-300
              hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <PanelLeftClose size={13}/>
          </button>
        </div>

        {/* Provider tabs */}
        <div className="flex items-center gap-0.5 p-0.5 mb-2 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
          {PROVIDERS.map((p) => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              className={`flex-1 px-1.5 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                provider === p
                  ? 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-sm'
                  : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
              }`}
            >
              {PROVIDER_LABELS[p]}
            </button>
          ))}
        </div>

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
            {recentInProvider.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 px-1 mb-1">
                  <Clock size={10} className="text-slate-400 dark:text-zinc-600"/>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest whitespace-nowrap">
                    Recent
                  </p>
                  <div className="flex-1 h-px bg-slate-100 dark:bg-zinc-800"/>
                </div>
                <div className="space-y-0.5">
                  {recentInProvider.map((type) => <PaletteItem key={`recent-${type}`} type={type} onDragStart={onDragStart} onClick={handleAdd}/>)}
                </div>
              </div>
            )}

            {categories.map((category) => {
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
