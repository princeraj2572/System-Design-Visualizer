/**
 * Left Sidebar Navigation - Minimalist design inspired by Eraser.io
 * Provides quick access to tools and canvas elements
 */

'use client';

import React, { useState } from 'react';
import {
  Square, Circle, Triangle, Zap, GitBranch, Database, Server, Cloud,
  Lock, Network, Package, Code
} from 'lucide-react';

export interface ToolCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items?: ToolItem[];
  isCollapsed?: boolean;
}

export interface ToolItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface SidebarNavProps {
  onSelectTool?: (toolId: string, itemId?: string) => void;
  onRender?: () => void;
  className?: string;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ onSelectTool, onRender, className = '' }) => {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set(['shapes']));

  const toolCategories: ToolCategory[] = [
    {
      id: 'shapes',
      name: 'Shapes',
      icon: <Square size={16} />,
      items: [
        { id: 'rectangle', name: 'Rectangle', icon: <Square size={14} /> },
        { id: 'circle', name: 'Circle', icon: <Circle size={14} /> },
        { id: 'triangle', name: 'Triangle', icon: <Triangle size={14} /> },
      ],
    },
    {
      id: 'components',
      name: 'Components',
      icon: <Package size={16} />,
      items: [
        { id: 'service', name: 'Service', icon: <Server size={14} /> },
        { id: 'database', name: 'Database', icon: <Database size={14} /> },
        { id: 'api', name: 'API', icon: <Network size={14} /> },
      ],
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure',
      icon: <Cloud size={16} />,
      items: [
        { id: 'cloud', name: 'Cloud Provider', icon: <Cloud size={14} /> },
        { id: 'server', name: 'Server', icon: <Server size={14} /> },
        { id: 'network', name: 'Network', icon: <Network size={14} /> },
      ],
    },
    {
      id: 'security',
      name: 'Security',
      icon: <Lock size={16} />,
      items: [
        { id: 'firewall', name: 'Firewall', icon: <Lock size={14} /> },
        { id: 'encryption', name: 'Encryption', icon: <Code size={14} /> },
      ],
    },
    {
      id: 'connections',
      name: 'Connections',
      icon: <GitBranch size={16} />,
      items: [
        { id: 'sync', name: 'Synchronous', icon: <Zap size={14} /> },
        { id: 'async', name: 'Asynchronous', icon: <GitBranch size={14} /> },
      ],
    },
  ];

  const toggleCategory = (categoryId: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(categoryId)) {
      newCollapsed.delete(categoryId);
    } else {
      newCollapsed.add(categoryId);
    }
    setCollapsedCategories(newCollapsed);
  };

  const handleSelectTool = (categoryId: string, itemId?: string) => {
    if (itemId) {
      onSelectTool?.(categoryId, itemId);
    } else {
      // If no item, this is just a category header click - toggle collapse
      toggleCategory(categoryId);
    }
  };

  return (
    <div className={`w-40 bg-white border-r border-slate-200 flex flex-col overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-3 py-2 border-b border-slate-200">
        <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Tools</h2>
      </div>

      {/* Tool Categories */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-0.5 p-1.5">
          {toolCategories.map((category) => {
            const isCollapsed = collapsedCategories.has(category.id);

            return (
              <div key={category.id}>
                {/* Category Header */}
                <button
                  onClick={() => handleSelectTool(category.id)}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded transition-colors"
                  title={category.name}
                >
                  <span className="text-slate-600 flex-shrink-0">{category.icon}</span>
                  <span className="flex-1 text-left truncate">{category.name}</span>
                  <span
                    className={`text-slate-400 transition-transform flex-shrink-0 ${
                      isCollapsed ? '-rotate-90' : ''
                    }`}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M2 4l4 4 4-4" />
                    </svg>
                  </span>
                </button>

                {/* Category Items */}
                {!isCollapsed && category.items && (
                  <div className="ml-1 space-y-0.5">
                    {category.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onSelectTool?.(category.id, item.id)}
                        className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 rounded transition-colors"
                        title={item.name}
                      >
                        <span className="text-slate-500 flex-shrink-0">{item.icon}</span>
                        <span className="flex-1 text-left truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-slate-200 p-1.5 space-y-1.5">
        <button
          onClick={onRender}
          className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-cyan-500 text-white text-xs font-medium rounded hover:bg-cyan-600 transition-colors"
          title="Apply auto-layout to canvas"
        >
          <Zap size={12} />
          <span>Render</span>
        </button>
        
        {/* Keyboard Shortcuts Help */}
        <div className="text-xs text-slate-500 p-2 bg-slate-50 rounded space-y-1">
          <div className="font-semibold text-slate-600 mb-2">Shortcuts</div>
          <div className="flex justify-between">
            <span>View Mode:</span>
            <span className="text-slate-400">⌘1-3</span>
          </div>
          <div className="flex justify-between">
            <span>Drag icon:</span>
            <span className="text-slate-400">Icon→Canvas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarNav;
