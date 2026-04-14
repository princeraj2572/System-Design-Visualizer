/**
 * Edge component for React Flow
 */

import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { EDGE_TYPES } from '@/utils/design-system';

interface ArchitectureEdgeData {
  type?: keyof typeof EDGE_TYPES;
  label?: string;
}

export const ArchitectureEdge: React.FC<EdgeProps<ArchitectureEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeColor = data?.type ? EDGE_TYPES[data.type]?.color : '#64748b';
  const strokeWidth = selected ? 3 : 2;

  return (
    <>
      <path
        id={id}
        d={edgePath}
        stroke={edgeColor}
        strokeWidth={strokeWidth}
        fill="none"
        className="transition-all duration-200 hover:stroke-2"
        style={{ cursor: 'pointer' }}
      />
      {data?.label && (
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2 - 10}
          textAnchor="middle"
          className="text-xs fill-slate-600 bg-white px-1"
        >
          {data.label}
        </text>
      )}
    </>
  );
};

export default ArchitectureEdge;
