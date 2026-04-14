'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ReactFlowProvider } from 'reactflow';
import { useArchitectureStore } from '@/store/architecture-store';
import { projectService } from '@/lib/project-service';
import ArchitectureCanvas from '@/components/canvas/ArchitectureCanvas';
import NodePalette from '@/components/canvas/NodePalette';
import HierarchyPanel from '@/components/canvas/HierarchyPanel';
import PropertiesPanel from '@/components/canvas/PropertiesPanel';
import Button from '@/components/ui/Button';
import { layoutNodesHierarchical } from '@/lib/layout-engine';
import { Zap } from 'lucide-react';

export default function EditorPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!projectId);
  const [showHierarchy, setShowHierarchy] = useState(true);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [isLayouting, setIsLayouting] = useState(false);

  const load = useArchitectureStore((state) => state.load);
  const saveProject = useArchitectureStore((state) => state.saveProject);
  const setCurrentProjectId = useArchitectureStore((state) => state.setCurrentProjectId);
  const setProjectName = useArchitectureStore((state) => state.setProjectName);
  const setProjectDescription = useArchitectureStore((state) => state.setProjectDescription);
  const projectName = useArchitectureStore((state) => state.projectName);
  const nodes = useArchitectureStore((state) => state.nodes);
  const edges = useArchitectureStore((state) => state.edges);
  const updateNode = useArchitectureStore((state) => state.updateNode);
  const selectedNode = useArchitectureStore((state) => state.selectedNode);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      const project = await projectService.getProject(projectId);
      
      // Load canvas data (nodes and edges from project)
      load({
        nodes: project.nodes || [],
        edges: project.edges || [],
        selectedNode: null,
        history: [],
        historyIndex: -1,
        theme: 'light',
      });

      // Set project metadata using store setters
      setCurrentProjectId(projectId);
      setProjectName(project.name);
      setProjectDescription(project.description || '');

      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!projectId) {
      setError('No project selected');
      return;
    }

    setIsSaving(true);
    try {
      await saveProject();

      setError('');
      // Optional: Show save success message
    } catch (err: any) {
      setError(err.message || 'Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (!projectId) return;

    try {
      const data = await projectService.exportProject(projectId);
      
      // Trigger download
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)));
      element.setAttribute('download', `${projectName}.json`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err: any) {
      setError(err.message || 'Failed to export project');
    }
  };

  const handleAutoLayout = async () => {
    if (nodes.length === 0) {
      setError('No components to layout');
      return;
    }

    setIsLayouting(true);
    try {
      // Apply hierarchical layout
      const { nodes: layoutedNodes } = layoutNodesHierarchical(nodes, edges, {
        rankGap: 200,
        nodeSpacing: 250,
        direction: 'TB',
      });

      // Update store with new positions
      layoutedNodes.forEach((node) => {
        updateNode(node.id, {
          position: node.position,
        });
      });

      setError('');
    } catch (err: any) {
      setError('Failed to auto-layout: ' + err.message);
    } finally {
      setIsLayouting(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-slate-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 shadow-sm p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{projectName || 'Untitled Project'}</h1>
          <p className="text-sm text-slate-600">System Design Visualizer</p>
        </div>

        <div className="flex gap-3 items-center">
          <Button onClick={() => window.history.back()} variant="ghost">
            Back
          </Button>
          <Button onClick={handleAutoLayout} disabled={isLayouting || nodes.length === 0} title="Auto arrange nodes in hierarchy (Ctrl+Shift+L)">
            <Zap size={16} className="mr-1" />
            {isLayouting ? 'Layouting...' : 'Auto Layout'}
          </Button>
          <Button onClick={() => setShowHierarchy(!showHierarchy)} variant="ghost">
            {showHierarchy ? 'Hide' : 'Show'} Hierarchy
          </Button>
          <Button onClick={handleExport} variant="ghost">
            Export
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          
          {/* PHASE 1 Keyboard Shortcuts Info */}
          <div className="ml-4 text-xs text-slate-600 border-l border-slate-300 pl-3 py-1">
            <details className="cursor-help hover:text-slate-900">
              <summary className="font-semibold">⌨️ Shortcuts</summary>
              <div className="absolute bg-white border border-slate-200 rounded-lg p-3 mt-1 shadow-lg z-50 text-xs whitespace-nowrap">
                <div><kbd>G</kbd> Toggle Grid</div>
                <div><kbd>Shift</kbd>+<kbd>G</kbd> Snap-to-Grid</div>
                <div><kbd>M</kbd> Toggle Minimap</div>
                <div><kbd>F</kbd> Focus Mode</div>
                <div><kbd>Ctrl</kbd>+<kbd>F</kbd> Search</div>
                <div><kbd>Delete</kbd> Remove Component</div>
                <div><kbd>Ctrl</kbd>+<kbd>±</kbd> Zoom</div>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Canvas with Node Palette and Hierarchy/Properties */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading project...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Node Palette - left sidebar (fixed 288px) */}
          <NodePalette />
          
          {/* Main Canvas - center (flex-1) */}
          <ReactFlowProvider>
            <div className="flex-1 overflow-hidden">
              <ArchitectureCanvas />
            </div>
          </ReactFlowProvider>

          {/* Right Sidebar - Properties or Hierarchy */}
          <div 
            className="bg-white border-l border-slate-200 overflow-hidden flex flex-col"
            style={{ width: `${rightPanelWidth}px` }}
          >
            {/* Resizable divider */}
            <div
              className="absolute left-0 top-0 w-1 h-full bg-slate-200 hover:bg-cyan-400 cursor-col-resize transition-colors"
              style={{ 
                left: `-${rightPanelWidth}px`,
                transform: `translateX(${rightPanelWidth}px)`,
                marginLeft: '-2px',
              }}
              onMouseDown={() => setIsResizing(true)}
            />
            
            {/* Tab-like header to switch between views */}
            {selectedNode && (
              <div className="flex border-b border-slate-200 bg-slate-50">
                <button
                  className="flex-1 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white transition-colors border-b-2 border-cyan-500"
                >
                  Properties
                </button>
                <button
                  onClick={() => {}}
                  className="flex-1 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-white transition-colors"
                >
                  Hierarchy
                </button>
              </div>
            )}

            {/* Panel Content */}
            {selectedNode ? (
              <PropertiesPanel />
            ) : showHierarchy ? (
              <HierarchyPanel />
            ) : null}
          </div>

          {/* Global mouse up listener for resizing */}
          {isResizing && (
            <div
              className="fixed inset-0 cursor-col-resize z-50"
              onMouseMove={(e) => {
                const newWidth = Math.max(280, Math.min(600, window.innerWidth - e.clientX));
                setRightPanelWidth(newWidth);
              }}
              onMouseUp={() => setIsResizing(false)}
              onMouseLeave={() => setIsResizing(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
