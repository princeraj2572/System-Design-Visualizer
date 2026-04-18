/**
 * ServiceNode - Rectangle shape for microservices, API gateway, web servers
 */

'use client';
import { NodeProps } from '@xyflow/react';
import { NodeDataExtended } from '@/types/architecture';
import { BaseNode } from './BaseNode';

export function ServiceNode({ id, data, selected }: NodeProps<NodeDataExtended>) {
  const nodeData = data?.data ?? data;

  return (
    <div className="group w-full h-full">
      <BaseNode id={id} data={data} selected={selected} minWidth={100} minHeight={50}>
        <div className="flex flex-col items-start px-2.5 py-2 w-full h-full">
          <span className="text-base leading-none mb-1">{nodeData?.icon ?? '⚙️'}</span>
          <span className="text-[11px] font-medium text-gray-900 dark:text-gray-100 leading-tight truncate w-full">
            {nodeData?.label ?? 'Service'}
          </span>
          {nodeData?.sublabel && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight truncate w-full">
              {nodeData.sublabel}
            </span>
          )}
          {nodeData?.targetRps && (
            <span className="text-[9px] text-gray-300 dark:text-gray-600 mt-0.5">
              {nodeData.targetRps}
            </span>
          )}
        </div>
      </BaseNode>
    </div>
  );
}
