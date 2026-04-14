/**
 * Node palette - component library for dragging onto canvas
 */

'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { NODE_TYPES } from '@/utils/design-system';
import type { NodeType } from '@/types/architecture';

interface NodePaletteProps {
  onNodeDragStart?: (nodeType: NodeType) => void;
}

export const NodePalette: React.FC<NodePaletteProps> = ({ onNodeDragStart }) => {
  const nodeEntries = Object.entries(NODE_TYPES) as Array<[NodeType, typeof NODE_TYPES[NodeType]]>;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify({ type: nodeType }));
    onNodeDragStart?.(nodeType);
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 overflow-y-auto">
      <div className="p-4 border-b border-slate-200 sticky top-0 bg-white">
        <h2 className="text-lg font-bold text-slate-900">Components</h2>
        <p className="text-sm text-slate-500 mt-1">Drag to canvas to add</p>
      </div>

      <div className="p-3 space-y-2">
        {nodeEntries.map(([type, config]) => (
          <Card
            key={type}
            variant="outlined"
            padding="sm"
            draggable
            onDragStart={(e) => handleDragStart(e as React.DragEvent<HTMLDivElement>, type)}
            className="cursor-move hover:bg-slate-50 hover:border-cyan-400 transition-colors"
          >
            <div className="flex items-start gap-2">
              <span className="text-2xl">{config.icon}</span>
              <div className="flex-1">
                <div className="font-semibold text-slate-900">{config.label}</div>
                <p className="text-xs text-slate-600">{config.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NodePalette;
