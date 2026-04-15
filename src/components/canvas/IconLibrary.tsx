/**
 * Icon Library Panel - Right sidebar with organized icon categories
 * Inspired by Eraser.io icon panel
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, Settings2, PlusCircle } from 'lucide-react';
import {
  Server, Database, Cloud, Lock, Network, Code,
  Zap, Package, Box, Globe, Shield, Cpu,
  Radio, Wifi, HardDrive, Key, CheckCircle, AlertCircle,
  Layers, Workflow, Activity, Share2, Users, MessageSquare
} from 'lucide-react';

interface IconCategory {
  id: string;
  name: string;
  description?: string;
  icons: IconItem[];
}

interface IconItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  tags?: string[];
}

interface IconLibraryProps {
  onSelectIcon?: (iconItem: IconItem) => void;
  onDragStart?: (iconItem: IconItem) => void;
  className?: string;
}

const IconLibrary: React.FC<IconLibraryProps> = ({ onSelectIcon, onDragStart, className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['tech', 'cloud'])
  );

  const categories: IconCategory[] = [
    {
      id: 'all',
      name: 'All Categories',
      icons: [],
    },
    {
      id: 'custom',
      name: 'Custom Icons',
      description: 'Your team\'s custom icons',
      icons: [
        { id: 'custom1', name: 'Custom Icon 1', icon: <PlusCircle size={18} /> },
      ],
    },
    {
      id: 'general',
      name: 'General Icon',
      description: '250+ icons available',
      icons: [
        { id: 'circle', name: 'Circle', icon: <div className="w-4 h-4 border-2 border-slate-400 rounded-full" /> },
        { id: 'square', name: 'Square', icon: <Box size={18} /> },
        { id: 'check', name: 'Check', icon: <CheckCircle size={18} /> },
        { id: 'alert', name: 'Alert', icon: <AlertCircle size={18} /> },
        { id: 'zap', name: 'Power', icon: <Zap size={18} /> },
        { id: 'activity', name: 'Activity', icon: <Activity size={18} /> },
      ],
    },
    {
      id: 'tech',
      name: 'Tech Logo',
      description: 'Popular tools and libraries',
      icons: [
        { id: 'code', name: 'Code', icon: <Code size={18} /> },
        { id: 'package', name: 'Package', icon: <Package size={18} /> },
        { id: 'cpu', name: 'CPU', icon: <Cpu size={18} /> },
        { id: 'workflow', name: 'Workflow', icon: <Workflow size={18} /> },
        { id: 'layers', name: 'Layers', icon: <Layers size={18} /> },
      ],
    },
    {
      id: 'cloud',
      name: 'Cloud Provider Icon',
      description: 'AWS, Azure, and Google Cloud',
      icons: [
        { id: 'cloud', name: 'Cloud', icon: <Cloud size={18} /> },
        { id: 'server', name: 'Server', icon: <Server size={18} /> },
        { id: 'database', name: 'Database', icon: <Database size={18} /> },
        { id: 'globe', name: 'Globe', icon: <Globe size={18} /> },
        { id: 'network', name: 'Network', icon: <Network size={18} /> },
      ],
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure',
      description: 'System components',
      icons: [
        { id: 'lock', name: 'Lock', icon: <Lock size={18} /> },
        { id: 'shield', name: 'Shield', icon: <Shield size={18} /> },
        { id: 'radio', name: 'Radio', icon: <Radio size={18} /> },
        { id: 'wifi', name: 'WiFi', icon: <Wifi size={18} /> },
        { id: 'harddrive', name: 'Storage', icon: <HardDrive size={18} /> },
      ],
    },
    {
      id: 'collaboration',
      name: 'Collaboration',
      description: 'Team and communication',
      icons: [
        { id: 'users', name: 'Users', icon: <Users size={18} /> },
        { id: 'share', name: 'Share', icon: <Share2 size={18} /> },
        { id: 'message', name: 'Message', icon: <MessageSquare size={18} /> },
        { id: 'key', name: 'Key', icon: <Key size={18} /> },
      ],
    },
  ];

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;

    return categories.map((cat) => ({
      ...cat,
      icons: cat.icons.filter((icon) =>
        icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        icon.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    })).filter((cat) => cat.icons.length > 0 || cat.id === 'all');
  }, [searchQuery]);

  return (
    <div className={`w-72 bg-white border-l border-slate-200 flex flex-col overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200">
        <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Icons</h2>

        {/* Search Bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search icon"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {filteredCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);

            return (
              <div key={category.id}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded transition-colors group"
                >
                  <span
                    className={`text-slate-400 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  >
                    <ChevronRight size={14} />
                  </span>
                  <span className="flex-1 text-left font-medium">{category.name}</span>
                  {category.description && (
                    <span className="text-xs text-slate-400 group-hover:text-slate-500 hidden sm:inline">
                      {category.description}
                    </span>
                  )}
                </button>

                {/* Category Icons */}
                {isExpanded && category.icons.length > 0 && (
                  <div className="ml-2 p-2 grid grid-cols-4 gap-2">
                    {category.icons.map((icon) => (
                      <button
                        key={icon.id}
                        onClick={() => onSelectIcon?.(icon)}
                        draggable
                        onDragStart={(e) => {
                          onDragStart?.(icon);
                          e.dataTransfer!.effectAllowed = 'copy';
                          e.dataTransfer!.setData('application/json', JSON.stringify(icon));
                        }}
                        className="flex items-center justify-center p-2 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded transition-colors group cursor-grab active:cursor-grabbing"
                        title={`${icon.name} - Drag to canvas or click to select`}
                      >
                        {icon.icon}
                        <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 absolute mt-8 bg-slate-900 text-white px-2 py-1 rounded whitespace-nowrap z-10">
                          {icon.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 p-2">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm rounded transition-colors">
          <Settings2 size={14} />
          <span>Icon Settings</span>
        </button>
      </div>
    </div>
  );
};

export default IconLibrary;
