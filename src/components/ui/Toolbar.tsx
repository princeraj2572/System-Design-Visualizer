/**
 * Toolbar component for application-wide actions
 */

'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { useArchitectureStore } from '@/store/architecture-store';

interface ToolbarProps {
  onExportClick?: () => void;
  onImportClick?: () => void;
  onAnalyticsClick?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onExportClick,
  onImportClick,
  onAnalyticsClick,
}) => {
  const { undo, redo, clearAll, setTheme } = useArchitectureStore();

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Save architecture');
  };

  const handleNew = () => {
    if (window.confirm('Create new architecture? Unsaved changes will be lost.')) {
      clearAll();
    }
  };

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setTheme(isDark ? 'dark' : 'light');
  };

  return (
    <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-slate-900">System Design Visualizer</h1>
      </div>

      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleNew}
          title="Create new architecture"
        >
          📄 New
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          title="Save architecture"
        >
          💾 Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onExportClick}
          title="Export architecture to multiple formats"
        >
          📥 Export
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onImportClick}
          title="Import architecture from file"
        >
          📤 Import
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onAnalyticsClick}
          title="View architecture analytics"
        >
          📊 Analytics
        </Button>

        <div className="w-px h-6 bg-slate-200" />

        <Button
          size="sm"
          variant="ghost"
          onClick={undo}
          title="Undo (Ctrl+Z)"
        >
          ↶ Undo
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={redo}
          title="Redo (Ctrl+Y)"
        >
          ↷ Redo
        </Button>

        <div className="w-px h-6 bg-slate-200" />

        <Button
          size="sm"
          variant="ghost"
          onClick={toggleTheme}
          title="Toggle dark mode"
        >
          🌙
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
