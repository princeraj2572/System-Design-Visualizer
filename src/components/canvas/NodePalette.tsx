/**
 * Node palette - component library for dragging onto canvas
 */

'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
import Card from '@/components/ui/Card';
import { NODE_TYPES_CONFIG } from '@/utils/design-system';
import type { NodeType } from '@/types/architecture';

interface NodePaletteProps {
  onNodeDragStart?: (nodeType: NodeType) => void;
}

const CATEGORY_ORDER = [
  'Frontend',
  'API',
  'Compute',
  'Data',
  'Performance',
  'Messaging',
  'Infrastructure',
  'Observability',
  'Services',
];

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

export const NodePalette: React.FC<NodePaletteProps> = ({ onNodeDragStart }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Frontend', 'API', 'Data', 'Services'])
  );

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    nodeType: NodeType
  ) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify({ type: nodeType }));
    onNodeDragStart?.(nodeType);
  };

  // Group by category
  const grouped = Object.entries(NODE_TYPES_CONFIG).reduce(
    (acc, [key, config]) => {
      if (!acc[config.category]) {
        acc[config.category] = [];
      }
      acc[config.category].push({ key, ...config });
      return acc;
    },
    {} as Record<string, any[]>
  );

  return (
    <div className="w-72 bg-white border-r border-slate-200 overflow-y-auto h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
        <h2 className="text-lg font-bold text-slate-900">Components</h2>
        <p className="text-xs text-slate-500 mt-1">Drag to canvas to add</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {CATEGORY_ORDER.map((category) => {
          if (!grouped[category]) return null;
          const isExpanded = expandedCategories.has(category);
          const componentCount = grouped[category].length;

          return (
            <div key={category}>
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="text-left">
                  <span className="font-semibold text-sm text-slate-900">
                    {category}
                  </span>
                  <span className="text-xs text-slate-500 ml-2">
                    ({componentCount})
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp size={16} className="text-slate-600 flex-shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-slate-600 flex-shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="ml-1 mt-2 space-y-2 border-l-2 border-slate-200 pl-2">
                  {grouped[category].map((item) => {
                    const IconComponent = ICON_MAP[item.icon] || Globe;
                    return (
                      <Card
                        key={item.key}
                        variant="outlined"
                        padding="sm"
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(
                            e as React.DragEvent<HTMLDivElement>,
                            item.key as NodeType
                          )
                        }
                        className="cursor-move hover:bg-cyan-50 hover:border-cyan-400 transition-colors active:opacity-50"
                      >
                        <div className="flex items-start gap-2">
                          <IconComponent
                            size={18}
                            style={{ color: item.iconColor }}
                            className="flex-shrink-0 mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-slate-900">
                              {item.label}
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NodePalette;
