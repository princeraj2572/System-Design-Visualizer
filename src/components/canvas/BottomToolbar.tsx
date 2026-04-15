/**
 * Bottom Center Toolbar - Shapes and Connections
 * Horizontal toolbar positioned at the center bottom of the canvas
 */

'use client';

import React, { useState } from 'react';
import {
  Square, Circle, Triangle,
  GitBranch, Zap, MessageSquare, Database, Eye
} from 'lucide-react';

interface BottomToolbarProps {
  onAddShape?: (shapeType: string) => void;
  onAddConnection?: (connectionType: string) => void;
  onAddNode?: (type: string, name: string) => void;
  className?: string;
}

interface ToolItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  group: 'shapes' | 'connections' | 'actions';
}

const BottomToolbar: React.FC<BottomToolbarProps> = ({
  onAddShape,
  onAddConnection,
  onAddNode,
  className = '',
}) => {
  const [expandedGroup, setExpandedGroup] = useState<'shapes' | 'connections' | null>(null);

  const tools: ToolItem[] = [
    // Shapes
    { id: 'rectangle', label: 'Rectangle', icon: <Square size={18} />, group: 'shapes' },
    { id: 'circle', label: 'Circle', icon: <Circle size={18} />, group: 'shapes' },
    { id: 'triangle', label: 'Triangle', icon: <Triangle size={18} />, group: 'shapes' },
    // Connections
    { id: 'http', label: 'HTTP', icon: <Zap size={18} />, group: 'connections' },
    { id: 'grpc', label: 'gRPC', icon: <GitBranch size={18} />, group: 'connections' },
    { id: 'message-queue', label: 'Message Queue', icon: <MessageSquare size={18} />, group: 'connections' },
    { id: 'database', label: 'Database', icon: <Database size={18} />, group: 'connections' },
    { id: 'event', label: 'Event Stream', icon: <Eye size={18} />, group: 'connections' },
  ];

  const shapeTools = tools.filter(t => t.group === 'shapes');
  const connectionTools = tools.filter(t => t.group === 'connections');

  const handleAddShape = (shapeType: string) => {
    onAddShape?.(shapeType);
    // Also create a node if handler provided
    const shapeNames: Record<string, string> = {
      'rectangle': 'Rectangle Component',
      'circle': 'Circle Component',
      'triangle': 'Triangle Component',
    };
    onAddNode?.(shapeType, shapeNames[shapeType] || shapeType);
    setExpandedGroup(null);
  };

  const handleAddConnection = (connectionType: string) => {
    onAddConnection?.(connectionType);
    setExpandedGroup(null);
  };

  return (
    <div
      className={`
        fixed bottom-8 left-1/2 transform -translate-x-1/2 
        bg-white border border-slate-300 rounded-lg shadow-xl 
        flex items-center gap-2 px-4 py-3 z-20
        ${className}
      `}
    >
      {/* Shapes Group */}
      <div className="relative">
        <button
          onClick={() => setExpandedGroup(expandedGroup === 'shapes' ? null : 'shapes')}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm
            transition-all whitespace-nowrap
            ${
              expandedGroup === 'shapes'
                ? 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
            }
          `}
          title="Add shapes"
        >
          <Square size={16} />
          Shapes
        </button>

        {/* Shapes Submenu */}
        {expandedGroup === 'shapes' && (
          <div className="absolute bottom-full mb-2 left-0 bg-white border border-slate-300 rounded-lg shadow-lg p-2 flex gap-2 min-w-max">
            {shapeTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleAddShape(tool.id)}
                className="flex flex-col items-center gap-1 p-2 rounded hover:bg-cyan-50 transition-colors text-slate-600 hover:text-cyan-700"
                title={tool.label}
              >
                {tool.icon}
                <span className="text-xs">{tool.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-300" />

      {/* Connections Group */}
      <div className="relative">
        <button
          onClick={() => setExpandedGroup(expandedGroup === 'connections' ? null : 'connections')}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm
            transition-all whitespace-nowrap
            ${
              expandedGroup === 'connections'
                ? 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                : 'text-slate-600 hover:bg-slate-50 border border-slate-200'
            }
          `}
          title="Add connections"
        >
          <GitBranch size={16} />
          Connections
        </button>

        {/* Connections Submenu */}
        {expandedGroup === 'connections' && (
          <div className="absolute bottom-full mb-2 left-0 bg-white border border-slate-300 rounded-lg shadow-lg p-2 flex gap-2 min-w-max">
            {connectionTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleAddConnection(tool.id)}
                className="flex flex-col items-center gap-1 p-2 rounded hover:bg-cyan-50 transition-colors text-slate-600 hover:text-cyan-700"
                title={tool.label}
              >
                {tool.icon}
                <span className="text-xs">{tool.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomToolbar;
