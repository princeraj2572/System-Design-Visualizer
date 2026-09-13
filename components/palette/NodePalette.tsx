'use client';

import type { DragEvent } from 'react';
import type { NodeType } from '@/types';
import { NODE_CONFIG, NODE_CATEGORIES } from '@/components/nodes/nodeConfig';

interface NodePaletteProps {
  onDragStart: (event: DragEvent, nodeType: NodeType) => void;
}

export default function NodePalette({ onDragStart }: NodePaletteProps) {
  return (
    <aside className="w-52 flex-shrink-0 bg-gray-900 border-r border-gray-700/50 flex flex-col overflow-hidden">
      <div className="px-3 py-2.5 border-b border-gray-700/50">
        <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
          Components
        </h2>
        <p className="text-[10px] text-gray-600 mt-0.5">Drag onto canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {NODE_CATEGORIES.map((category) => (
          <div key={category.id}>
            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-1 mb-1.5">
              {category.label}
            </p>
            <div className="space-y-1">
              {category.types.map((type) => {
                const config = NODE_CONFIG[type];
                return (
                  <div
                    key={type}
                    draggable
                    onDragStart={(e) => onDragStart(e, type)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg
                      bg-gray-800/60 hover:bg-gray-800 border border-gray-700/40 hover:border-gray-600/60
                      cursor-grab active:cursor-grabbing select-none
                      transition-all duration-150 group"
                  >
                    <span
                      className="w-7 h-7 flex items-center justify-center rounded-md text-sm flex-shrink-0"
                      style={{ backgroundColor: `${config.accent}22` }}
                    >
                      {config.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-gray-300 truncate">
                        {config.label}
                      </p>
                      <p className="text-[9px] text-gray-600 truncate">
                        {config.defaultTechnology}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="px-3 py-2 border-t border-gray-700/50">
        <p className="text-[9px] text-gray-700 text-center">
          Connect nodes by dragging between handles
        </p>
      </div>
    </aside>
  );
}
