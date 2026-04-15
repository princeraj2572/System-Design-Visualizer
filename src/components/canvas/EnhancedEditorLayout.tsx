/**
 * Enhanced Editor Container - Eraser.io inspired layout
 * Combines new navigation and canvas with existing functionality
 */

'use client';

import React, { useState } from 'react';
import SidebarNav from '@/components/canvas/SidebarNav';
import ViewModeTabs, { ViewMode } from '@/components/canvas/ViewModeTabs';
import IconLibrary from '@/components/canvas/IconLibrary';
import ArchitectureCanvas from '@/components/canvas/ArchitectureCanvas';
import PropertiesPanel from '@/components/canvas/PropertiesPanel';
import { ReactFlowProvider } from 'reactflow';

interface EnhancedEditorLayoutProps {
  onToolSelect?: (toolId: string, itemId?: string) => void;
  children?: React.ReactNode;
}

const EnhancedEditorLayout: React.FC<EnhancedEditorLayoutProps> = ({ 
  onToolSelect,
  children
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('canvas');
  const [rightPanelMode, setRightPanelMode] = useState<'properties' | 'icons'>('icons');

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* View Mode Tabs */}
      <ViewModeTabs 
        currentMode={viewMode}
        onModeChange={setViewMode}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tool Navigation */}
        <SidebarNav onSelectTool={onToolSelect} />

        {/* Center - Canvas or Document */}
        <ReactFlowProvider>
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {viewMode === 'canvas' || viewMode === 'both' ? (
              <div className="flex-1 overflow-hidden">
                <ArchitectureCanvas />
              </div>
            ) : null}

            {viewMode === 'document' || viewMode === 'both' ? (
              <div className="flex-1 overflow-hidden p-8 bg-slate-50">
                <div className="bg-white rounded-lg p-6 shadow-sm max-w-4xl mx-auto h-full overflow-y-auto">
                  {children || (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      <p>Document view - Add content here</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </ReactFlowProvider>

        {/* Right Sidebar - Icons or Properties */}
        <>
          {/* Mode Toggle */}
          <div className="w-px bg-slate-200 relative group">
            <button
              onClick={() => setRightPanelMode(rightPanelMode === 'icons' ? 'properties' : 'icons')}
              className="absolute left-1/2 top-2 -translate-x-1/2 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-500 hover:text-slate-700 hover:border-slate-300 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              title="Toggle between icons and properties"
            >
              {rightPanelMode === 'icons' ? 'Props' : 'Icons'}
            </button>
          </div>

          {rightPanelMode === 'icons' ? (
            <IconLibrary />
          ) : (
              <PropertiesPanel />
            )}
        </>
      </div>
    </div>
  );
};

export default EnhancedEditorLayout;
