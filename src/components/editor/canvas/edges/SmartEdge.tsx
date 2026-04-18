/**
 * SmartEdge - Custom edge with protocol badge, animated async edges
 */

'use client';
import {
  EdgeProps,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from '@xyflow/react';
import { EdgeDataExtended } from '@/types/architecture';
import './SmartEdge.css';

export function SmartEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<EdgeDataExtended>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeData = data?.data ?? data;
  const protocol = edgeData?.protocol ?? 'REST';
  const syncType = edgeData?.syncType ?? 'sync';
  const isAsync = syncType === 'async';

  // Protocol colors
  const protoColors: Record<string, string> = {
    REST: '#3B82F6',
    gRPC: '#8B5CF6',
    GraphQL: '#F97316',
    WebSocket: '#14B8A6',
    AMQP: '#F59E0B',
    Kafka: '#EF4444',
    SQL: '#22C55E',
    TCP: '#6B7280',
    UDP: '#9CA3AF',
    HTTPS: '#2563EB',
    custom: '#999999',
  };
  const edgeColor = protoColors[protocol] ?? '#3B82F6';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: edgeColor,
          strokeWidth: selected ? 2.5 : 1.5,
          strokeDasharray: isAsync ? '6 3' : undefined,
          strokeOpacity: 0.8,
          animation: isAsync ? 'dashFlow 20s linear infinite' : undefined,
        }}
        markerEnd={`url(#arrow-${id})`}
      />

      {/* Custom arrowhead */}
      <defs>
        <marker
          id={`arrow-${id}`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path
            d="M2 1L8 5L2 9"
            fill="none"
            stroke={edgeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>

      {/* Protocol label badge */}
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className="absolute pointer-events-all nodrag nopan"
        >
          <div
            className="px-1.5 py-0.5 rounded text-[9px] font-medium border cursor-pointer
                        bg-white dark:bg-zinc-900 shadow-sm select-none transition-all
                        hover:shadow-md hover:scale-105"
            style={{ color: edgeColor, borderColor: edgeColor + '44' }}
            onClick={e => e.stopPropagation()}
          >
            {protocol}
            {isAsync && ' ⟳'}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
