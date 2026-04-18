/**
 * DatabaseNode - Cylinder shape for SQL/NoSQL databases
 */

'use client';
import { NodeProps } from '@xyflow/react';
import { NodeDataExtended } from '@/types/architecture';
import { BaseNode } from './BaseNode';

export function DatabaseNode({ id, data, selected }: NodeProps<NodeDataExtended>) {
  const nodeData = data?.data ?? data;
  const color = (nodeData?.color as string) ?? 'green';

  const fillMap: Record<string, string> = {
    green: '#DCFCE7',
    blue: '#DBEAFE',
    amber: '#FEF3C7',
    purple: '#EDE9FE',
    coral: '#FEE2E2',
    teal: '#CCFBF1',
    gray: '#F3F4F6',
  };
  const strokeMap: Record<string, string> = {
    green: '#22C55E',
    blue: '#3B82F6',
    amber: '#F59E0B',
    purple: '#8B5CF6',
    coral: '#F97316',
    teal: '#14B8A6',
    gray: '#9CA3AF',
  };
  const fill = fillMap[color] ?? fillMap.green;
  const stroke = strokeMap[color] ?? strokeMap.green;

  return (
    <div className="group w-full h-full">
      <BaseNode id={id} data={data} selected={selected} minWidth={100} minHeight={60}>
        {/* SVG cylinder */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 80"
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          {/* Cylinder body */}
          <rect x="5" y="12" width="90" height="60" fill={fill} stroke={stroke} strokeWidth="1" />
          {/* Bottom ellipse */}
          <ellipse cx="50" cy="72" rx="45" ry="10" fill={fill} stroke={stroke} strokeWidth="1" />
          {/* Top ellipse */}
          <ellipse cx="50" cy="12" rx="45" ry="10" fill={fill} stroke={stroke} strokeWidth="1" />
        </svg>
        {/* Label on top of SVG */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-1">
          <span className="text-sm mb-0.5">{nodeData?.icon ?? '🗄️'}</span>
          <span className="text-[11px] font-medium text-center leading-tight text-gray-900 dark:text-gray-100">
            {nodeData?.label ?? 'Database'}
          </span>
          {nodeData?.sublabel && (
            <span className="text-[9px] text-gray-500 text-center">{nodeData.sublabel}</span>
          )}
        </div>
      </BaseNode>
    </div>
  );
}
