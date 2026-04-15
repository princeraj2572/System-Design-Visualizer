/**
 * Edge component for React Flow with performance optimizations
 */

import React, { memo, useMemo } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { EDGE_TYPES } from '@/utils/design-system';

interface ArchitectureEdgeData {
  type?: keyof typeof EDGE_TYPES;
  label?: string;
}

const ArchitectureEdgeComponent: React.FC<EdgeProps<ArchitectureEdgeData>> = ({
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
  const [isHovering, setIsHovering] = React.useState(false);
  
  // Memoize bezier path calculation
  const [edgePath] = useMemo(
    () => [
      getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      })[0],
    ],
    [sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition]
  );

  const edgeColor = useMemo(
    () => (data?.type ? EDGE_TYPES[data.type]?.color : '#64748b'),
    [data?.type]
  );
  
  const strokeWidth = selected ? 4 : isHovering ? 3 : 2;
  const strokeOpacity = selected ? 1 : isHovering ? 0.9 : 0.7;

  return (
    <>
      {/* Animated glow effect on hover/select - skipped for performance */}
      {(selected || isHovering) && (
        <path
          d={edgePath}
          stroke={edgeColor}
          strokeWidth={strokeWidth + 2}
          fill="none"
          opacity="0.2"
          className="pointer-events-none"
          style={{ willChange: 'opacity' }}
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
        style={{
          cursor: 'pointer',
          willChange: isHovering || selected ? 'stroke-width, opacity' : 'auto',
        }}
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
            stroke={edgeColor}
            strokeWidth="1"
            rx="4"
            opacity={selected || isHovering ? 1 : 0.9}
            style={{ pointerEvents: 'none' }}
          />
          
          {/* Label text */}
          <text
            x={(sourceX + targetX) / 2}
            y={(sourceY + targetY) / 2 + 4}
            textAnchor="middle"
            fontSize="12"
            fill={edgeColor}
            fontWeight="600"
            className="pointer-events-none select-none"
            style={{ paintOrder: 'stroke', strokeWidth: '0.5px', stroke: 'white' }}
          >
            {data.label}
          </text>
        </g>
      )}
    </>
  );
};

// Custom comparison to prevent re-renders on non-critical changes
const areEdgePropsEqual = (prevProps: EdgeProps<ArchitectureEdgeData>, nextProps: EdgeProps<ArchitectureEdgeData>) => {
  return (
    prevProps.sourceX === nextProps.sourceX &&
    prevProps.sourceY === nextProps.sourceY &&
    prevProps.targetX === nextProps.targetX &&
    prevProps.targetY === nextProps.targetY &&
    prevProps.sourcePosition === nextProps.sourcePosition &&
    prevProps.targetPosition === nextProps.targetPosition &&
    prevProps.data?.label === nextProps.data?.label &&
    prevProps.data?.type === nextProps.data?.type &&
    prevProps.selected === nextProps.selected
  );
};

export const ArchitectureEdge = memo(ArchitectureEdgeComponent, areEdgePropsEqual);

ArchitectureEdge.displayName = 'ArchitectureEdge';

export default ArchitectureEdge;
