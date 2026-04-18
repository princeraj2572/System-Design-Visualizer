/**
 * Node component for React Flow with dragging and resizing support
 * Optimized with custom comparison to prevent unnecessary re-renders
 */

import React, { memo, useMemo } from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import { NODE_TYPES_CONFIG } from '@/utils/design-system';
import { getNodeMetadata } from '@/utils/node-metadata';
import { getShape, getShapePath } from '@/utils/shapes';
import {
  Globe,
  Smartphone,
  Phone,
  Network,
  Server,
  Zap,
  MessageSquare,
  Cpu,
  Box,
  Database,
  Eye,
  HardDrive,
  Activity,
  Shield,
  BarChart3,
  FileText,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface ArchitectureNodeData {
  type: string;
  name: string;
  description: string;
  technology: string;
  isSelected?: boolean;
  latency?: number;
  throughput?: number;
  replicas?: number;
  region?: string;
  tier?: 'critical' | 'high' | 'medium' | 'low';
  tags?: string[];
}

const ICON_MAP: Record<string, any> = {
  Globe,
  Smartphone,
  Phone,
  Network,
  Server,
  Zap,
  MessageSquare,
  Cpu,
  Box,
  Database,
  Eye,
  HardDrive,
  Activity,
  Shield,
  BarChart3,
  FileText,
  AlertCircle,
  Clock,
};

const ArchitectureNodeComponent: React.FC<NodeProps<ArchitectureNodeData>> = ({
  data,
  selected,
  isConnectable,
}) => {
  const [isHovering, setIsHovering] = React.useState(false);
  
  // Get width & height from node (ReactFlow provides these)
  const width = React.useMemo(() => 140, []);
  const height = React.useMemo(() => 100, []);
  
  // Memoize config lookups to avoid repeated object creation
  const config = useMemo(
    () => NODE_TYPES_CONFIG[data.type as keyof typeof NODE_TYPES_CONFIG],
    [data.type]
  );
  
  const metadata = useMemo(() => getNodeMetadata(data.type), [data.type]);
  
  const IconComponent = useMemo(
    () => (config ? ICON_MAP[config.icon] : Globe),
    [config]
  );
  
  const iconColor = useMemo(
    () => config?.iconColor || '#3b82f6',
    [config]
  );

  const shape = useMemo(() => getShape(data.type), [data.type]);
  
  const shapePath = useMemo(
    () => getShapePath(data.type, 140, 100),
    [data.type]
  );

  return (
    <div
      className={`
        transition-all duration-200 relative
        ${
          selected
            ? 'border-cyan-500 shadow-xl bg-blue-50'
            : isHovering
            ? 'border-cyan-400 shadow-lg bg-slate-50'
            : 'border-slate-300 shadow-md bg-white'
        }
        ${selected ? 'ring-2 ring-cyan-300 ring-offset-2' : ''}
      `}
      style={{
        width: '100%',
        height: '100%',
        borderTopColor: iconColor,
        borderTopWidth: '3px',
        borderStyle: 'solid',
        borderWidth: '2px',
        padding: '12px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        willChange: selected ? 'box-shadow, width, height' : 'auto',
        minWidth: '120px',
        minHeight: '80px',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Shape Badge - Visual identifier */}
      <div
        className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white pointer-events-none"
        style={{
          backgroundColor: iconColor,
          opacity: 0.7,
        }}
        title={shape}
      >
        {shape === 'cylinder' && '∞'}
        {shape === 'hexagon' && '⬡'}
        {shape === 'diamond' && '◆'}
        {shape === 'circle' && '●'}
        {shape === 'parallelogram' && '▶'}
        {shape === 'cloud' && '☁'}
        {shape === 'trapezoid' && '▲'}
        {shape === 'rectangle' && '□'}
      </div>

      {/* Resize Handle - Only visible when selected */}
      {selected && (
        <NodeResizer 
          minWidth={120} 
          minHeight={80} 
          maxWidth={400}
          maxHeight={300}
          isVisible={selected}
          keepAspectRatio={false}
        />
      )}
      {/* Connection Handles - Visible on hover */}
      <div className={`transition-opacity duration-200 ${isHovering || selected ? 'opacity-100' : 'opacity-30'}`}>
        <Handle 
          type="target" 
          position={Position.Top}
          isConnectable={isConnectable}
          className="!bg-cyan-500 !border-2 !border-white !w-3 !h-3"
        />
        <Handle 
          type="source" 
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="!bg-cyan-500 !border-2 !border-white !w-3 !h-3"
        />
      </div>

      <div className="text-center space-y-1 flex-1 flex flex-col justify-center items-center pointer-events-auto relative z-10 gap-1">
        {/* Icon */}
        <div className="flex justify-center flex-shrink-0">
          <div 
            className="p-2 rounded-lg"
            style={{ 
              backgroundColor: `${iconColor}15`,
              pointerEvents: 'none',
            }}
          >
            <IconComponent
              size={28}
              style={{ color: iconColor }}
            />
          </div>
        </div>
        
        {/* Component Name - Large and clear */}
        <div 
          className="font-bold text-slate-900 break-words text-center"
          style={{ 
            fontSize: '13px', 
            lineHeight: '1.3',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            pointerEvents: 'none',
          }}
          title={data.name}
        >
          {data.name}
        </div>
        
        {/* Technology Badge */}
        {data.technology && (
          <div 
            className="text-xs font-medium px-2 py-0.5 rounded text-white line-clamp-1"
            style={{ 
              backgroundColor: iconColor,
              maxWidth: '90%',
              pointerEvents: 'none',
            }}
            title={data.technology}
          >
            {data.technology}
          </div>
        )}
        
        {/* Description on hover - Scrollable if needed */}
        {isHovering && (
          <div className="text-xs pt-1 border-t border-slate-200 space-y-0.5 overflow-y-auto max-h-20 text-left w-full pointer-events-none">
            {data.description && (
              <div className="text-slate-600 italic break-words text-center px-1">
                {data.description.substring(0, 60)}{data.description.length > 60 ? '...' : ''}
              </div>
            )}
            
            {/* Performance Metrics Display */}
            {(data.latency || data.throughput || data.replicas || data.region) && (
              <div className="bg-yellow-50 px-1.5 py-1 rounded border border-yellow-200 space-y-0.5 text-center">
                <div className="text-xs font-semibold text-yellow-900">Perf:</div>
                {data.latency && <div className="text-xs text-yellow-800">⏱️ {data.latency}ms</div>}
                {data.throughput && <div className="text-xs text-yellow-800">📊 {data.throughput} RPS</div>}
                {data.replicas && <div className="text-xs text-yellow-800">📦 {data.replicas}x</div>}
                {data.region && <div className="text-xs text-yellow-800">🌍 {data.region}</div>}
              </div>
            )}
            
            {metadata && (
              <div className="bg-cyan-50 px-1.5 py-1 rounded border border-cyan-200 text-center">
                <div className="text-xs font-semibold text-cyan-900 mb-0.5">
                  Can connect to:
                </div>
                <div className="text-xs text-cyan-800 break-words line-clamp-2">
                  {metadata.canConnectTo.length > 0
                    ? metadata.canConnectTo.slice(0, 3).join(', ') + (metadata.canConnectTo.length > 3 ? '...' : '')
                    : 'No connections'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connection Indicator */}
      {(isHovering || selected) && (
        <div className="text-xs text-center text-slate-500 mt-auto pt-1 border-t border-slate-200 pointer-events-none">
          Click handles to connect
        </div>
      )}
    </div>
  );
};

// Custom comparison function to prevent unnecessary re-renders
// Only re-render if these specific props change
const arePropsEqual = (prevProps: NodeProps<ArchitectureNodeData>, nextProps: NodeProps<ArchitectureNodeData>) => {
  return (
    prevProps.data.name === nextProps.data.name &&
    prevProps.data.type === nextProps.data.type &&
    prevProps.data.description === nextProps.data.description &&
    prevProps.data.technology === nextProps.data.technology &&
    prevProps.selected === nextProps.selected &&
    prevProps.isConnectable === nextProps.isConnectable &&
    prevProps.dragging === nextProps.dragging
  );
};

export const ArchitectureNode = memo(ArchitectureNodeComponent, arePropsEqual);

ArchitectureNode.displayName = 'ArchitectureNode';

export default ArchitectureNode;
