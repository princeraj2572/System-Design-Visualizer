/**
 * Node component for React Flow
 */

import React from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { NODE_TYPES } from '@/utils/design-system';

interface ArchitectureNodeData {
  type: string;
  name: string;
  description: string;
  technology: string;
  isSelected?: boolean;
}

export const ArchitectureNode: React.FC<NodeProps<ArchitectureNodeData>> = ({
  data,
  selected,
}) => {
  const config = NODE_TYPES[data.type as keyof typeof NODE_TYPES];
  const bgColor = config?.color || '#3b82f6';

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 transition-all duration-200
        ${
          selected
            ? 'border-cyan-500 shadow-lg scale-105'
            : 'border-slate-300 shadow-md hover:shadow-lg'
        }
        bg-white
      `}
      style={{
        minWidth: '140px',
        borderTopColor: bgColor,
        borderTopWidth: '4px',
      }}
    >
      <Handle type="target" position={Position.Top} />

      <div className="text-center">
        <div className="text-2xl mb-1">{config?.icon || '🔧'}</div>
        <div className="font-semibold text-sm text-slate-900 truncate">{data.name}</div>
        {data.technology && (
          <div className="text-xs text-slate-500 truncate">{data.technology}</div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default ArchitectureNode;
