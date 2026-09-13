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
      className="relative flex flex-col items-center justify-center w-32 h-24 rounded-xl cursor-pointer transition-all duration-150 bg-white dark:bg-gray-800 shadow-md hover:shadow-xl"
      style={{
        border: `2px solid ${selected ? config.accent : `${config.accent}55`}`,
        transform: selected ? 'scale(1.04)' : 'scale(1)',
      }}
    >
      {/* Accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ backgroundColor: config.accent }}
      />

      {/* Icon */}
      <span className="text-2xl mb-1 select-none" role="img" aria-label={config.label}>
        {config.icon}
      </span>

      {/* Name */}
      <span className="text-[11px] font-semibold text-center px-2 leading-tight text-gray-800 dark:text-gray-100 max-w-full truncate">
        {data.name || config.defaultName}
      </span>

      {/* Technology badge */}
      {data.technology && (
        <span
          className="text-[9px] mt-1 px-1.5 py-0.5 rounded-full font-medium max-w-[90%] truncate"
          style={{
            backgroundColor: `${config.accent}22`,
            color: config.accent,
          }}
        >
          {data.technology}
        </span>
      )}

      {/* Handles — all four sides */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-gray-500 dark:!bg-gray-400 !border-2 !border-white dark:!border-gray-800 !-top-[5px] opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ opacity: selected ? 1 : undefined }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-gray-500 dark:!bg-gray-400 !border-2 !border-white dark:!border-gray-800 !-bottom-[5px]"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2.5 !h-2.5 !bg-gray-500 dark:!bg-gray-400 !border-2 !border-white dark:!border-gray-800 !-left-[5px]"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2.5 !h-2.5 !bg-gray-500 dark:!bg-gray-400 !border-2 !border-white dark:!border-gray-800 !-right-[5px]"
      />
    </div>
  );
}

export default memo(CustomNode);
