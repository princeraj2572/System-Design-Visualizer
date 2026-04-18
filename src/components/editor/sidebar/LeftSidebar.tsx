/**
 * LeftSidebar - Component library with categories and search
 */

'use client';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import {
  getComponentsByCategory,
  searchComponents,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  ComponentDefinition,
} from '@/lib/componentLibrary';
import { NodeCategory } from '@/types/architecture';

interface LeftSidebarProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export default function LeftSidebar({ onSearch, searchQuery = '' }: LeftSidebarProps) {
  const [collapsed, setCollapsed] = useState<Set<NodeCategory>>(new Set());

  const grouped = getComponentsByCategory();
  const searchResults = searchQuery.trim() ? searchComponents(searchQuery) : null;

  const toggleCategory = (cat: NodeCategory) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  return (
    <aside className="w-56 flex flex-col border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-full overflow-hidden flex-shrink-0">
      {/* Search */}
      <div className="p-2 border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700">
          <Search size={12} className="text-gray-400 flex-shrink-0" />
          <input
            className="flex-1 text-xs bg-transparent outline-none placeholder:text-gray-400 text-gray-900 dark:text-gray-100"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => onSearch?.(e.target.value)}
          />
        </div>
      </div>

      {/* Components */}
      <div className="flex-1 overflow-y-auto py-1 scrollbar-thin">
        {searchResults ? (
          // Search results
          searchResults.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No results</p>
          ) : (
            searchResults.map(comp => (
              <DraggableChip key={comp.id} comp={comp} />
            ))
          )
        ) : (
          // Grouped by category
          CATEGORY_ORDER.map(cat => (
            <div key={cat}>
              <button
                className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => toggleCategory(cat)}
              >
                {CATEGORY_LABELS[cat]}
                {collapsed.has(cat) ? (
                  <ChevronRight size={12} />
                ) : (
                  <ChevronDown size={12} />
                )}
              </button>
              {!collapsed.has(cat) &&
                grouped[cat]?.map(comp => (
                  <DraggableChip key={comp.id} comp={comp} />
                ))}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

function DraggableChip({ comp }: { comp: ComponentDefinition }) {
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/reactflow-component', comp.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const categoryBg: Record<string, string> = {
    compute: '#DBEAFE',
    storage: '#DCFCE7',
    messaging: '#FEF3C7',
    network: '#FCE7F3',
    client: '#F3F4F6',
    infrastructure: '#EDE9FE',
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-center gap-2 mx-1 px-1.5 py-1 rounded-md cursor-grab active:cursor-grabbing hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
      title={comp.defaultData.description}
    >
      <div
        className="w-6 h-6 rounded-sm flex items-center justify-center text-xs flex-shrink-0 border border-gray-100 dark:border-zinc-800"
        style={{ background: categoryBg[comp.category] }}
      >
        {comp.icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-normal text-gray-900 dark:text-gray-100 truncate leading-tight">
          {comp.label}
        </div>
        <div className="text-[10px] text-gray-400 truncate leading-tight">{comp.sublabel}</div>
      </div>
    </div>
  );
}
