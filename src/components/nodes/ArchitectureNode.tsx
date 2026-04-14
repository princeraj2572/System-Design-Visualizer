/**
 * Node component for React Flow
 */

import React, { memo } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { NODE_TYPES_CONFIG } from '@/utils/design-system';
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

export const ArchitectureNode: React.FC<NodeProps<ArchitectureNodeData>> = memo(
  ({ data, selected, isConnectable }) => {
    const [isHovering, setIsHovering] = React.useState(false);
    const config = NODE_TYPES_CONFIG[data.type as keyof typeof NODE_TYPES_CONFIG];
    const IconComponent = config ? ICON_MAP[config.icon] : Globe;
    const iconColor = config?.iconColor || '#3b82f6';

    return (
      <div
        className={`
          rounded-lg border-2 transition-all duration-200 cursor-pointer
          ${
            selected
              ? 'border-cyan-500 shadow-xl scale-105 bg-blue-50'
              : isHovering
              ? 'border-cyan-400 shadow-lg bg-slate-50'
              : 'border-slate-300 shadow-md bg-white'
          }
        `}
        style={{
          minWidth: '160px',
          maxWidth: '200px',
          borderTopColor: iconColor,
          borderTopWidth: '3px',
          padding: '12px',
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
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

        <div className="text-center space-y-1.5">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${iconColor}15` }}>
              <IconComponent
                size={28}
                style={{ color: iconColor }}
              />
            </div>
          </div>
          
          {/* Component Name - Large and clear */}
          <div 
            className="font-bold text-slate-900 break-words text-center"
            style={{ fontSize: '13px', lineHeight: '1.3' }}
            title={data.name}
          >
            {data.name}
          </div>
          
          {/* Technology Badge */}
          {data.technology && (
            <div 
              className="text-xs font-medium px-2 py-1 rounded text-white inline-block mx-auto truncate"
              style={{ backgroundColor: iconColor, maxWidth: '100%' }}
              title={data.technology}
            >
              {data.technology}
            </div>
          )}
          
          {/* Description on hover */}
          {isHovering && data.description && (
            <div className="text-xs text-slate-600 italic pt-1 border-t border-slate-200 break-words">
              {data.description.substring(0, 50)}{data.description.length > 50 ? '...' : ''}
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
  }
);

ArchitectureNode.displayName = 'ArchitectureNode';

export default ArchitectureNode;
