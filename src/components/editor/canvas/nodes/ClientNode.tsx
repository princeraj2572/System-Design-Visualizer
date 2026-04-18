/**
 * ClientNode - Pill/rounded shape for browsers, mobile apps
 */

'use client';
import { NodeProps } from '@xyflow/react';
import { NodeDataExtended } from '@/types/architecture';
import { BaseNode } from './BaseNode';

export function ClientNode({ id, data, selected }: NodeProps<NodeDataExtended>) {
  const nodeData = data?.data ?? data;

  return (
    <div className="group w-full h-full">
      <BaseNode id={id} data={data} selected={selected} minWidth={80} minHeight={40}>
        <div className="w-full h-full rounded-full flex flex-col items-center justify-center">
          <span className="text-base">{nodeData?.icon ?? '💻'}</span>
          <span className="text-[10px] font-medium text-gray-900 dark:text-gray-100 text-center">
            {nodeData?.label ?? 'Client'}
          </span>
        </div>
      </BaseNode>
    </div>
  );
}
