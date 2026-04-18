/**
 * QueueNode - Parallelogram shape for message queues
 */

'use client';
import { NodeProps } from '@xyflow/react';
import { NodeDataExtended } from '@/types/architecture';
import { BaseNode } from './BaseNode';

export function QueueNode({ id, data, selected }: NodeProps<NodeDataExtended>) {
  const nodeData = data?.data ?? data;
  const color = (nodeData?.color as string) ?? 'amber';

  const colorMap: Record<string, string> = {
    amber: '#FEF3C7',
    blue: '#DBEAFE',
    green: '#DCFCE7',
    purple: '#EDE9FE',
    coral: '#FEE2E2',
    teal: '#CCFBF1',
    gray: '#F3F4F6',
  };
  const strokeMap: Record<string, string> = {
    amber: '#F59E0B',
    blue: '#3B82F6',
    green: '#22C55E',
    purple: '#8B5CF6',
    coral: '#F97316',
    teal: '#14B8A6',
    gray: '#9CA3AF',
  };
  const fill = colorMap[color] ?? colorMap.amber;
  const stroke = strokeMap[color] ?? strokeMap.amber;

  return (
    <div className="group w-full h-full">
      <BaseNode id={id} data={data} selected={selected} minWidth={100} minHeight={60}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 60"
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          {/* Parallelogram */}
          <path d="M 20 10 L 90 10 L 80 50 L 10 50 Z" fill={fill} stroke={stroke} strokeWidth="1" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-1">
          <span className="text-sm">{nodeData?.icon ?? '📨'}</span>
          <span className="text-[11px] font-medium text-center leading-tight text-gray-900 dark:text-gray-100">
            {nodeData?.label ?? 'Queue'}
          </span>
        </div>
      </BaseNode>
    </div>
  );
}
