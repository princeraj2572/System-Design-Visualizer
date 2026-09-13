'use client';

import type { DragEvent } from 'react';
import type { NodeType } from '@/types';
import { NODE_CONFIG, NODE_CATEGORIES } from '@/components/nodes/nodeConfig';

interface NodePaletteProps {
  onDragStart: (event: DragEvent, nodeType: NodeType) => void;
}

export default function NodePalette({ onDragStart }: NodePaletteProps) {
  return (
    <aside
      className="w-52 flex-shrink-0 border-r border-gray-800 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0c1120 0%, #080d18 100%)' }}
    >
      {/* Header */}
      <div className="px-4 pt-3.5 pb-2.5 border-b border-gray-800">
        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          Components
        </h2>
        <p className="text-[10px] text-gray-700 mt-0.5 font-medium">
          Drag onto canvas
        </p>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-2 py-2.5 space-y-3.5">
        {NODE_CATEGORIES.map((category) => (
          <div key={category.id}>
            {/* Category label */}
            <div className="flex items-center gap-2 px-1.5 mb-1.5">
              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                {category.label}
              </p>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            {/* Items */}
            <div className="space-y-0.5">
              {category.types.map((type) => {
                const config = NODE_CONFIG[type];
                return (
                  <div
                    key={type}
                    draggable
                    onDragStart={(e) => onDragStart(e, type)}
                    className="group flex items-center gap-2.5 px-2 py-1.5 rounded-lg
                      border border-transparent
                      hover:bg-gray-800/70 hover:border-gray-700/60
                      cursor-grab active:cursor-grabbing select-none
                      transition-all duration-100"
                  >
                    {/* Accent dot */}
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: config.accent }}
                    />

                    {/* Icon */}
                    <span
                      className="w-6 h-6 flex items-center justify-center rounded-md text-sm flex-shrink-0 transition-all"
                      style={{ background: `${config.accent}16` }}
                    >
                      {config.icon}
                    </span>

                    {/* Labels */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-gray-400 group-hover:text-gray-200 truncate transition-colors">
                        {config.label}
                      </p>
                      <p className="text-[9px] text-gray-700 group-hover:text-gray-600 truncate transition-colors">
                        {config.defaultTechnology}
                      </p>
                    </div>

                    {/* Drag indicator */}
                    <svg
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-2.5 h-2.5 text-gray-700 group-hover:text-gray-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <circle cx="5" cy="4" r="1.2" />
                      <circle cx="5" cy="8" r="1.2" />
                      <circle cx="5" cy="12" r="1.2" />
                      <circle cx="11" cy="4" r="1.2" />
                      <circle cx="11" cy="8" r="1.2" />
                      <circle cx="11" cy="12" r="1.2" />
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-800">
        <p className="text-[9px] text-gray-700 font-medium text-center leading-relaxed">
          Connect nodes by dragging between handles
        </p>
      </div>
    </aside>
  );
}
