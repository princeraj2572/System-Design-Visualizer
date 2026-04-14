/**
 * Node Palette - Component library for dragging onto canvas
 * Shows all available component types organized by category
 */

'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useArchitectureStore } from '@/store/architecture-store';
import { NODE_TYPES_CONFIG } from '@/types/nodeTypes';
import type { NodeType } from '@/types/architecture';

interface NodePaletteProps {
  onNodeDragStart?: (nodeType: NodeType) => void;
}

// Map icon names to lucide components
function getIconComponent(iconName: string) {
  return (LucideIcons as any)[iconName] || (LucideIcons as any)['Box'];
}

const CATEGORY_LABELS: Record<string, string> = {
  frontend: '🎨 Frontend',
  api: '🔌 API & Services',
  compute: '⚙️ Compute',
  data: '🗄️ Data',
  cache: '⚡ Cache & CDN',
  messaging: '📨 Messaging',
  storage: '💾 Storage',
  other: '📦 Other',
};

const CATEGORY_ORDER = ['frontend', 'api', 'compute', 'data', 'cache', 'messaging', 'storage', 'other'];

export function NodePalette({ onNodeDragStart }: NodePaletteProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['frontend', 'api', 'compute', 'data'])
  );

  const addNode = useArchitectureStore((state) => state.addNode);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify({ type: nodeType }));
    onNodeDragStart?.(nodeType);
  };

  const handleNodeClick = (nodeType: NodeType) => {
    // Add node at default position
    const config = NODE_TYPES_CONFIG[nodeType];
    addNode({
      type: nodeType,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      metadata: {
        name: config.name,
        description: '',
        technology: '',
      },
    });
  };

  // Group nodes by category
  const grouped: Record<string, typeof NODE_TYPES_CONFIG[keyof typeof NODE_TYPES_CONFIG][]> = {};
  Object.entries(NODE_TYPES_CONFIG).forEach(([_key, config]) => {
    if (!grouped[config.category]) {
      grouped[config.category] = [];
    }
    grouped[config.category].push(config);
  });

  return (
    <div className="w-72 bg-white border-r border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex-shrink-0">
        <h2 className="text-lg font-bold text-slate-900">Components</h2>
        <p className="text-xs text-slate-500 mt-1">Drag to canvas or click to add</p>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {CATEGORY_ORDER.map((category) => {
          if (!grouped[category] || grouped[category].length === 0) return null;

          const isExpanded = expandedCategories.has(category);
          const nodes = grouped[category].sort((a, b) => a.name.localeCompare(b.name));

          return (
            <div key={category} className="space-y-2">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-150 transition-all border border-slate-200"
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-semibold text-sm text-slate-900">
                    {CATEGORY_LABELS[category]}
                  </span>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                    {nodes.length}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp size={16} className="text-slate-600 flex-shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-slate-600 flex-shrink-0" />
                )}
              </button>

              {/* Category Items */}
              {isExpanded && (
                <div className="space-y-1 ml-1">
                  {nodes.map((config) => {
                    const IconComponent = getIconComponent(config.icon);
                    return (
                      <div
                        key={config.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, config.id)}
                        onClick={() => handleNodeClick(config.id)}
                        className="group flex items-center gap-2 p-2 rounded-md bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-move"
                      >
                        {/* Icon */}
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-white group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: config.color }}
                        >
                          <IconComponent size={16} />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {config.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {config.description}
                          </p>
                        </div>

                        {/* Action indicator */}
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-slate-500">⋯</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer - Search hint */}
      <div className="p-3 border-t border-slate-200 flex-shrink-0 text-xs text-slate-500 bg-slate-50">
        <p>💡 Tip: Click to add, or drag to position</p>
      </div>
    </div>
  );
}

export default NodePalette;
