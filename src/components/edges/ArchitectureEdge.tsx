/**
 * Edge component for React Flow with performance optimizations
 */

import React, { memo, useMemo } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { EDGE_TYPES } from '@/utils/design-system';

interface ArchitectureEdgeData {
  type?: keyof typeof EDGE_TYPES;
  label?: string;
  protocol?: string;
  latency?: number;
  bandwidth?: number;
  syncType?: 'sync' | 'async';
  authentication?: string;
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

  // Determine if this is an async flow
  const isAsync = data?.syncType === 'async';
  
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
        strokeDasharray={isAsync ? '5,5' : isHovering ? '5,5' : 'none'}
        strokeDashoffset={isAsync ? '10' : isHovering ? '10' : '0'}
        style={{
          animation: isAsync ? 'dashFlow 0.5s linear infinite' : undefined,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        } as any}
      />
      
      {/* Edge label with background */}
      {data?.label && (
        <g>
          {/* Label background */}
          <rect
            x={(sourceX + targetX) / 2 - 50}
            y={(sourceY + targetY) / 2 - 20}
            width="100"
            height="22"
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
            y={(sourceY + targetY) / 2 + 5}
            textAnchor="middle"
            fontSize="11"
            fill={edgeColor}
            fontWeight="600"
            className="pointer-events-none select-none"
            style={{ paintOrder: 'stroke', strokeWidth: '0.5px', stroke: 'white' }}
          >
            {data.label}
          </text>

          {/* Additional metadata on hover */}
          {(selected || isHovering) && (
            <g>
              {/* Protocol badge */}
              {data.protocol && (
                <g>
                  <rect
                    x={(sourceX + targetX) / 2 - 35}
                    y={(sourceY + targetY) / 2 + 15}
                    width="70"
                    height="16"
                    fill={edgeColor}
                    fillOpacity="0.1"
                    stroke={edgeColor}
                    strokeWidth="0.5"
                    rx="2"
                  />
                  <text
                    x={(sourceX + targetX) / 2}
                    y={(sourceY + targetY) / 2 + 26}
                    textAnchor="middle"
                    fontSize="9"
                    fill={edgeColor}
                    fontWeight="500"
                    className="pointer-events-none"
                  >
                    {data.protocol}
                  </text>
                </g>
              )}

              {/* Latency badge */}
              {data.latency && (
                <g>
                  <rect
                    x={(sourceX + targetX) / 2 - 35}
                    y={(sourceY + targetY) / 2 + 35}
                    width="70"
                    height="16"
                    fill="#fbbf24"
                    fillOpacity="0.1"
                    stroke="#fbbf24"
                    strokeWidth="0.5"
                    rx="2"
                  />
                  <text
                    x={(sourceX + targetX) / 2}
                    y={(sourceY + targetY) / 2 + 46}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#92400e"
                    fontWeight="500"
                    className="pointer-events-none"
                  >
                    {data.latency}ms
                  </text>
                </g>
              )}
            </g>
          )}
        </g>
      )}

      {/* CSS for animation */}
      <style>{`
        @keyframes dashFlow {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
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
