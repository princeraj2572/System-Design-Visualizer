/**
 * Edge component for React Flow
 */

import React, { memo } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { EDGE_TYPES } from '@/utils/design-system';

interface ArchitectureEdgeData {
  type?: keyof typeof EDGE_TYPES;
  label?: string;
}

export const ArchitectureEdge: React.FC<EdgeProps<ArchitectureEdgeData>> = memo(
  ({
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

    const [isHovering, setIsHovering] = React.useState(false);
    const edgeColor = data?.type ? EDGE_TYPES[data.type]?.color : '#64748b';
    const strokeWidth = selected ? 4 : isHovering ? 3 : 2;
    const strokeOpacity = selected ? 1 : isHovering ? 0.9 : 0.7;

    return (
      <>
        {/* Animated glow effect on hover/select */}
        {(selected || isHovering) && (
          <path
            d={edgePath}
            stroke={edgeColor}
            strokeWidth={strokeWidth + 2}
            fill="none"
            opacity="0.2"
            className="pointer-events-none"
          />
        )}
        
        {/* Main edge line */}
        <path
          id={id}
          d={edgePath}
          stroke={edgeColor}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={strokeOpacity}
          className={`transition-all duration-200 ${
            selected || isHovering ? '' : 'hover:opacity-100'
          }`}
          style={{ cursor: 'pointer' }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          strokeDasharray={isHovering ? '5,5' : 'none'}
          strokeDashoffset={isHovering ? '10' : '0'}
        />
        
        {/* Edge label with background */}
        {data?.label && (
          <g>
            {/* Label background */}
            <rect
              x={(sourceX + targetX) / 2 - 45}
              y={(sourceY + targetY) / 2 - 18}
              width="90"
              height="18"
              fill="white"
              rx="3"
              stroke={edgeColor}
              strokeWidth="1"
              opacity="0.95"
            />
            {/* Label text */}
            <text
              x={(sourceX + targetX) / 2}
              y={(sourceY + targetY) / 2 - 7}
              textAnchor="middle"
              className="text-xs font-semibold"
              fill={edgeColor}
              style={{ pointerEvents: 'none' }}
            >
              {data.label}
            </text>
          </g>
        )}
      </>
    );
  }
);

ArchitectureEdge.displayName = 'ArchitectureEdge';

export default ArchitectureEdge;
