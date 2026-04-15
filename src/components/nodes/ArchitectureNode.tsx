/**
 * Node component for React Flow with dragging and resizing support
 * Optimized with custom comparison to prevent unnecessary re-renders
 */

import React, { memo, useMemo } from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import { NODE_TYPES_CONFIG } from '@/utils/design-system';
import { getNodeMetadata } from '@/utils/node-metadata';
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

  return (
    <div
      className={`
        rounded-lg border-2 transition-all duration-200
        ${
          selected
            ? 'border-cyan-500 shadow-xl bg-blue-50'
            : isHovering
            ? 'border-cyan-400 shadow-lg bg-slate-50'
            : 'border-slate-300 shadow-md bg-white'
        }
      `}
      style={{
        width: '100%',
        height: '100%',
        borderTopColor: iconColor,
        borderTopWidth: '3px',
        padding: '12px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        willChange: selected ? 'box-shadow' : 'auto',
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Resize Handle - Only visible when selected */}
      {selected && <NodeResizer minWidth={140} minHeight={100} />}
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

      <div className="text-center space-y-1.5 flex-1 flex flex-col justify-between">
        {/* Icon */}
        <div className="flex justify-center flex-shrink-0">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${iconColor}15` }}>
            <IconComponent
              size={28}
              style={{ color: iconColor }}
            />
          </div>
        </div>
        
        {/* Component Name - Large and clear */}
        <div 
          className="font-bold text-slate-900 break-words text-center flex-shrink"
          style={{ fontSize: '13px', lineHeight: '1.3' }}
          title={data.name}
        >
          {data.name}
        </div>
        
        {/* Technology Badge */}
        {data.technology && (
          <div 
            className="text-xs font-medium px-2 py-1 rounded text-white inline-block mx-auto truncate flex-shrink-0"
            style={{ backgroundColor: iconColor, maxWidth: '100%' }}
            title={data.technology}
          >
            {data.technology}
          </div>
        )}
        
        {/* Description on hover - Scrollable if needed */}
        {isHovering && (
          <div className="text-xs pt-2 border-t border-slate-200 space-y-1 overflow-y-auto flex-1 text-left">
            {data.description && (
              <div className="text-slate-600 italic break-words">
                {data.description.substring(0, 60)}{data.description.length > 60 ? '...' : ''}
              </div>
            )}
            {metadata && (
              <div className="bg-cyan-50 px-2 py-1.5 rounded border border-cyan-200">
                <div className="text-xs font-semibold text-cyan-900 flex items-center gap-1 mb-1">
                  <ArrowRight className="w-3 h-3 flex-shrink-0" />
                  Can connect to:
                </div>
                <div className="text-xs text-cyan-800 break-words">
                  {metadata.canConnectTo.length > 0
                    ? metadata.canConnectTo.slice(0, 5).join(', ') + (metadata.canConnectTo.length > 5 ? '...' : '')
                    : 'No outgoing connections'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connection Indicator */}
      {(isHovering || selected) && (
        <div className="text-xs text-center text-slate-500 mt-2 pt-2 border-t border-slate-200">
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
