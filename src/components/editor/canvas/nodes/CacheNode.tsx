/**
 * CacheNode - Hexagon shape for in-memory caches
 */

'use client';
import { NodeProps } from '@xyflow/react';
import { NodeDataExtended } from '@/types/architecture';
import { BaseNode } from './BaseNode';

export function CacheNode({ id, data, selected }: NodeProps<NodeDataExtended>) {
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

  // Hexagon path
  const hexPath = 'M50 10 L90 30 L90 70 L50 90 L10 70 L10 30 Z';

  return (
    <div className="group w-full h-full">
      <BaseNode id={id} data={data} selected={selected} minWidth={100} minHeight={60}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          <path d={hexPath} fill={fill} stroke={stroke} strokeWidth="1" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-1">
          <span className="text-sm mb-0.5">{nodeData?.icon ?? '⚡'}</span>
          <span className="text-[11px] font-medium text-center leading-tight text-gray-900 dark:text-gray-100">
            {nodeData?.label ?? 'Cache'}
          </span>
          {nodeData?.sublabel && (
            <span className="text-[9px] text-gray-500 text-center">{nodeData.sublabel}</span>
          )}
        </div>
      </BaseNode>
    </div>
  );
}
