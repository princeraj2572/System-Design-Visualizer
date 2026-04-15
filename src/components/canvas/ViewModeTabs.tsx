/**
 * View Mode Tabs - Switch between Document, Both, and Canvas views
 * Inspired by Eraser.io interface
 */

'use client';

import React, { useEffect } from 'react';
import { FileText, Maximize2, Grid } from 'lucide-react';

export type ViewMode = 'document' | 'both' | 'canvas';

interface ViewModeTabsProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  className?: string;
}

const ViewModeTabs: React.FC<ViewModeTabsProps> = ({ currentMode, onModeChange, className = '' }) => {
  // Keyboard shortcuts for view modes
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + 1 = Document
      if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        onModeChange('document');
      }
      // Cmd/Ctrl + 2 = Both
      if ((e.ctrlKey || e.metaKey) && e.key === '2') {
        e.preventDefault();
        onModeChange('both');
      }
      // Cmd/Ctrl + 3 = Canvas
      if ((e.ctrlKey || e.metaKey) && e.key === '3') {
        e.preventDefault();
        onModeChange('canvas');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onModeChange]);
  const modes: Array<{ id: ViewMode; label: string; icon: React.ReactNode; description: string }> = [
    {
      id: 'document',
      label: 'Document',
      icon: <FileText size={16} />,
      description: 'Edit documentation (⌘1)',
    },
    {
      id: 'both',
      label: 'Both',
      icon: <Maximize2 size={16} />,
      description: 'Document + Canvas (⌘2)',
    },
    {
      id: 'canvas',
      label: 'Canvas',
      icon: <Grid size={16} />,
      description: 'Diagram only (⌘3)',
    },
  ];

  return (
    <div className={`flex items-center gap-1 bg-slate-50 px-4 py-2 border-b border-slate-200 ${className}`}>
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
            currentMode === mode.id
              ? 'bg-white text-cyan-600 shadow-sm border border-cyan-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
          title={mode.description}
        >
          {mode.icon}
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ViewModeTabs;
