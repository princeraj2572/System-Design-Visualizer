/**
 * GroupNode - Dashed boundary box for zones, regions, VPCs
 */

'use client';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { NodeDataExtended } from '@/types/architecture';

export function GroupNode({ id, data, selected }: NodeProps<NodeDataExtended>) {
  const { getNode } = useReactFlow();
  const nodeData = data?.data ?? data;

  return (
    <div
      className={`
        w-full h-full rounded-lg border-2 border-dashed transition-all
        ${selected
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-950 shadow-md'
          : 'border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-900 opacity-80'
        }
      `}
    >
      <div className="p-3">
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
          {nodeData?.icon ?? '🗂️'} {nodeData?.label ?? 'Zone'}
        </div>
        {nodeData?.sublabel && (
          <div className="text-[10px] text-gray-500 dark:text-gray-400">
            {nodeData.sublabel}
          </div>
        )}
        {nodeData?.description && (
          <div className="text-[9px] text-gray-400 dark:text-gray-500 mt-1">
            {nodeData.description}
          </div>
        )}
      </div>
    </div>
  );
}
