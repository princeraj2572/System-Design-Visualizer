'use client';

import { memo, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { NodeData } from '@/types';
import { NODE_CONFIG } from './nodeConfig';
import { useCanvasStore } from '@/store/useCanvasStore';

function CustomNode({ id, data, selected }: NodeProps<NodeData>) {
  const config = NODE_CONFIG[data.nodeType];
  const setSelectedNode = useCanvasStore((s) => s.setSelectedNode);

  const handleClick = useCallback(() => {
    setSelectedNode(id);
  }, [id, setSelectedNode]);

  return (
    <div
      onClick={handleClick}
      className="relative flex flex-col w-36 rounded-xl cursor-pointer select-none overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #1e2433 0%, #151a27 100%)',
        border: `1.5px solid ${selected ? config.accent : 'rgba(55,65,81,0.8)'}`,
        boxShadow: selected
          ? `0 0 0 3px ${config.accent}28, 0 8px 32px rgba(0,0,0,0.5)`
          : '0 2px 12px rgba(0,0,0,0.4)',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {/* Accent strip */}
      <div
        className="h-[3px] w-full flex-shrink-0"
        style={{ background: `linear-gradient(90deg, ${config.accent} 0%, ${config.accent}88 100%)` }}
      />

      {/* Content */}
      <div className="flex flex-col items-center px-3 pt-3 pb-3 gap-2">
        {/* Icon box */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
          style={{
            background: `${config.accent}18`,
            boxShadow: `inset 0 1px 0 ${config.accent}20`,
          }}
        >
          <span role="img" aria-label={config.label} className="leading-none">
            {config.icon}
          </span>
        </div>

        {/* Name */}
        <span
          className="text-[11px] font-semibold text-center leading-tight max-w-full truncate px-0.5"
          style={{ color: selected ? '#f1f5f9' : '#cbd5e1' }}
        >
          {data.name || config.defaultName}
        </span>

        {/* Technology badge */}
        {data.technology && (
          <span
            className="text-[9px] font-medium px-2 py-0.5 rounded-full max-w-[90%] truncate"
            style={{
              background: `${config.accent}1a`,
              color: config.accent,
              border: `1px solid ${config.accent}30`,
            }}
          >
            {data.technology}
          </span>
        )}
      </div>

      {/* Handles — all four sides */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !border !top-[-4px]"
        style={{ background: config.accent, borderColor: '#0f1219', opacity: selected ? 1 : undefined }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !border !bottom-[-4px]"
        style={{ background: config.accent, borderColor: '#0f1219' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2 !h-2 !border !left-[-4px]"
        style={{ background: config.accent, borderColor: '#0f1219' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2 !h-2 !border !right-[-4px]"
        style={{ background: config.accent, borderColor: '#0f1219' }}
      />
    </div>
  );
}

export default memo(CustomNode);
