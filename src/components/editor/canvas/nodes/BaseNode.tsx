/**
 * BaseNode - Shared node chrome (ports, resize handle, selection, lock button)
 * All node shape types extend this component
 */

'use client';
import { NodeProps, NodeResizer, Handle, Position } from '@xyflow/react';
import { Lock, Maximize2, Minimize2 } from 'lucide-react';
import { NodeDataExtended } from '@/types/architecture';
import { useEditorStore } from '@/store/architecture-store';

interface BaseNodeProps extends NodeProps<NodeDataExtended> {
  children: React.ReactNode;
  minWidth?: number;
  minHeight?: number;
}

export function BaseNode({
  id,
  data,
  selected,
  children,
  minWidth = 100,
  minHeight = 50,
}: BaseNodeProps) {
  // These functions would need to be added to your store
  // For now this is the interface - you'll connect to store
  const colorBorderMap: Record<string, string> = {
    blue: 'border-blue-400',
    green: 'border-emerald-400',
    amber: 'border-amber-400',
    purple: 'border-violet-400',
    coral: 'border-orange-400',
    teal: 'border-teal-400',
    gray: 'border-gray-400',
  };

  const nodeData = data?.data ?? data;
  const color = (nodeData?.color as string) ?? 'blue';
  const isLocked = nodeData?.isLocked ?? false;
  const isCollapsed = nodeData?.isCollapsed ?? false;

  return (
    <>
      {/* Resize handle - only show when selected and not locked */}
      <NodeResizer
        isVisible={selected && !isLocked}
        minWidth={minWidth}
        minHeight={minHeight}
        lineClassName="!border-blue-400"
        handleClassName="!w-2 !h-2 !rounded-full !border-blue-400 !bg-white"
      />

      {/* Connection ports - 4 cardinal directions */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!w-2 !h-2 !bg-blue-400 !border-0 !rounded-full"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2 !h-2 !bg-blue-400 !border-0 !rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2 !h-2 !bg-blue-400 !border-0 !rounded-full"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-2 !h-2 !bg-blue-400 !border-0 !rounded-full"
      />

      {/* Node chrome */}
      <div
        className={`
          relative w-full h-full rounded-lg bg-white dark:bg-zinc-900
          border transition-all duration-100
          ${
            selected
              ? `${colorBorderMap[color] ?? 'border-blue-400'} border-[1.5px] shadow-sm`
              : 'border-gray-200 dark:border-zinc-700 border-[0.5px]'
          }
          ${isLocked ? 'cursor-not-allowed opacity-90' : 'cursor-move'}
        `}
      >
        {/* Toolbar: lock + collapse - visible on hover */}
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400"
            onClick={e => {
              e.stopPropagation();
              // Call store to toggle lock
            }}
            title={isLocked ? 'Unlock node' : 'Lock node'}
          >
            <Lock size={10} />
          </button>
          <button
            className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400"
            onClick={e => {
              e.stopPropagation();
              // Call store to toggle collapse
            }}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <Maximize2 size={10} /> : <Minimize2 size={10} />}
          </button>
        </div>

        {/* Shape-specific content */}
        {isCollapsed ? (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            {nodeData?.icon ?? '◯'}
          </div>
        ) : (
          children
        )}
      </div>
    </>
  );
}
