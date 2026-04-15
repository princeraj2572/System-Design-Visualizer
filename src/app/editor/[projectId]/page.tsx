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
import { Zap, Download, Upload, BarChart3 } from 'lucide-react';
import { useRealtime } from '@/hooks/useRealtime';
import PresenceIndicator from '@/components/realtime/PresenceIndicator';
import RemoteCursorsOverlay from '@/components/realtime/RemoteCursorsOverlay';
import { ExportDialog } from '@/components/canvas/ExportDialog';
import { ImportDialog } from '@/components/canvas/ImportDialog';
import { AnalyticsPanel } from '@/components/canvas/AnalyticsPanel';
import { TemplateLibrary } from '@/components/canvas/TemplateLibrary';
import { AuditLogViewer } from '@/components/canvas/AuditLogViewer';
import { ComplianceReporter } from '@/components/canvas/ComplianceReporter';
import { ArchitectureHealthDashboard } from '@/components/canvas/ArchitectureHealthDashboard';
import { ComponentMetricsPanel } from '@/components/canvas/ComponentMetricsPanel';
import { DependencyTracer } from '@/components/canvas/DependencyTracer';
import { ComplianceDashboard } from '@/components/canvas/ComplianceDashboard';
import { RemediationTracker } from '@/components/canvas/RemediationTracker';
import { AdvancedCollaboration } from '@/components/canvas/AdvancedCollaboration';
import { SharedWorkspace } from '@/components/canvas/SharedWorkspace';
import { PerformanceDashboard } from '@/components/canvas/PerformanceDashboard';
import { BookOpen, FileText, Shield, HeartHandshake, Zap as ZapIcon, GitBranch, CheckCircle, AlertTriangle, Users, Share2, Gauge } from 'lucide-react';

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
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);
  const [showHealthDashboard, setShowHealthDashboard] = useState(false);
  const [showComponentMetrics, setShowComponentMetrics] = useState(false);
  const [showDependencyTracer, setShowDependencyTracer] = useState(false);
  const [showComplianceDashboard, setShowComplianceDashboard] = useState(false);
  const [showRemediationTracker, setShowRemediationTracker] = useState(false);
  const [showAdvancedCollaboration, setShowAdvancedCollaboration] = useState(false);
  const [showSharedWorkspace, setShowSharedWorkspace] = useState(false);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);

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

  // Initialize auth state
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    if (storedToken) setToken(storedToken);
    if (storedUserId) setUserId(storedUserId);
  }, []);

  // Initialize real-time collaboration
  const realtime = useRealtime({
    projectId,
    token: token || '',
    userId: userId || '',
    enabled: !!token && !!userId && !!projectId,
  });

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
        groups: project.groups || [],
        selectedNode: null,
        expandedGroups: [],
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
    setShowExportDialog(true);
  };

  const handleImportSuccess = async (project: any) => {
    try {
      // Load imported project data into canvas
      load({
        nodes: project.nodes || [],
        edges: project.edges || [],
        groups: project.groups || [],
        selectedNode: null,
        expandedGroups: [],
        history: [],
        historyIndex: -1,
        theme: 'light',
      });

      // Update project metadata
      setProjectName(project.name);
      setProjectDescription(project.description);

      setError('');
      setShowImportDialog(false);
    } catch (err: any) {
      setError(err.message || 'Failed to import project');
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

          <div className="w-px h-6 bg-slate-300" />

          <Button onClick={handleExport} variant="ghost" title="Export architecture">
            <Download size={16} className="mr-1" />
            Export
          </Button>
          <Button onClick={() => setShowImportDialog(true)} variant="ghost" title="Import architecture">
            <Upload size={16} className="mr-1" />
            Import
          </Button>
          <Button onClick={() => setShowAnalytics(true)} variant="ghost" title="View analytics">
            <BarChart3 size={16} className="mr-1" />
            Analytics
          </Button>

          <div className="w-px h-6 bg-slate-300" />

          <Button onClick={() => setShowTemplateLibrary(true)} variant="ghost" title="Browse architecture templates">
            <BookOpen size={16} className="mr-1" />
            Templates
          </Button>
          <Button onClick={() => setShowAuditLog(true)} variant="ghost" title="View audit log">
            <FileText size={16} className="mr-1" />
            Audit Log
          </Button>
          <Button onClick={() => setShowCompliance(true)} variant="ghost" title="Compliance reports">
            <Shield size={16} className="mr-1" />
            Compliance
          </Button>

          <div className="w-px h-6 bg-slate-300" />

          <Button onClick={() => setShowHealthDashboard(true)} variant="ghost" title="Architecture health analysis">
            <HeartHandshake size={16} className="mr-1" />
            Health
          </Button>
          <Button onClick={() => setShowComponentMetrics(true)} variant="ghost" title="Component metrics and analysis">
            <ZapIcon size={16} className="mr-1" />
            Metrics
          </Button>
          <Button onClick={() => setShowDependencyTracer(true)} variant="ghost" title="Dependency analysis">
            <GitBranch size={16} className="mr-1" />
            Dependencies
          </Button>

          <div className="w-px h-6 bg-slate-300" />

          <Button onClick={() => setShowComplianceDashboard(true)} variant="ghost" title="Compliance framework dashboard">
            <CheckCircle size={16} className="mr-1" />
            Frameworks
          </Button>
          <Button onClick={() => setShowRemediationTracker(true)} variant="ghost" title="Track remediation efforts">
            <AlertTriangle size={16} className="mr-1" />
            Remediation
          </Button>

          <div className="w-px h-6 bg-slate-300" />

          <Button onClick={() => setShowAdvancedCollaboration(true)} variant="ghost" title="Real-time collaboration sessions">
            <Users size={16} className="mr-1" />
            Collaborate
          </Button>
          <Button onClick={() => setShowSharedWorkspace(true)} variant="ghost" title="Share workspace with team members">
            <Share2 size={16} className="mr-1" />
            Share
          </Button>

          <div className="w-px h-6 bg-slate-300" />

          <Button onClick={() => setShowPerformanceDashboard(true)} variant="ghost" title="Monitor performance metrics">
            <Gauge size={16} className="mr-1" />
            Performance
          </Button>

          <div className="w-px h-6 bg-slate-300" />

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
        <div className="flex-1 flex overflow-hidden" onMouseMove={(e) => realtime?.sendCursorPosition(e.clientX, e.clientY)}>
          {/* Remote cursors overlay */}
          <RemoteCursorsOverlay remoteCursors={realtime?.remoteCursors || []} />

          {/* Presence indicator */}
          <PresenceIndicator 
            activeUsers={realtime?.activeUsers || []} 
            remoteCursors={realtime?.remoteCursors || []}
            selectedNodes={realtime?.selectedNodes || []}
            isConnected={realtime?.isConnected || false}
          />

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

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        nodes={nodes}
        edges={edges}
        projectName={projectName || 'Untitled Project'}
      />

      {/* Import Dialog */}
      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* Analytics Panel */}
      <AnalyticsPanel
        projectId={projectId}
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />

      {/* Template Library */}
      <TemplateLibrary
        isOpen={showTemplateLibrary}
        onClose={() => setShowTemplateLibrary(false)}
      />

      {/* Audit Log Viewer */}
      <AuditLogViewer
        projectId={projectId}
        isOpen={showAuditLog}
        onClose={() => setShowAuditLog(false)}
      />

      {/* Compliance Reporter */}
      <ComplianceReporter
        projectId={projectId}
        projectName={projectName}
        isOpen={showCompliance}
        onClose={() => setShowCompliance(false)}
      />

      {/* Architecture Health Dashboard */}
      {showHealthDashboard && (
        <ArchitectureHealthDashboard onClose={() => setShowHealthDashboard(false)} />
      )}

      {/* Component Metrics Panel */}
      {showComponentMetrics && (
        <ComponentMetricsPanel onClose={() => setShowComponentMetrics(false)} />
      )}

      {/* Dependency Tracer */}
      {showDependencyTracer && (
        <DependencyTracer onClose={() => setShowDependencyTracer(false)} />
      )}

      {/* Compliance Dashboard */}
      {showComplianceDashboard && (
        <ComplianceDashboard
          projectId={projectId}
          projectName={projectName}
          isOpen={showComplianceDashboard}
          onClose={() => setShowComplianceDashboard(false)}
        />
      )}

      {/* Remediation Tracker */}
      {showRemediationTracker && (
        <RemediationTracker
          projectId={projectId}
          isOpen={showRemediationTracker}
          onClose={() => setShowRemediationTracker(false)}
        />
      )}

      {/* Advanced Collaboration */}
      {showAdvancedCollaboration && (
        <AdvancedCollaboration
          projectId={projectId}
          isOpen={showAdvancedCollaboration}
          onClose={() => setShowAdvancedCollaboration(false)}
          currentUserId={userId || undefined}
        />
      )}

      {/* Shared Workspace */}
      {showSharedWorkspace && (
        <SharedWorkspace
          projectId={projectId}
          projectName={projectName}
          isOpen={showSharedWorkspace}
          onClose={() => setShowSharedWorkspace(false)}
        />
      )}

      {/* Performance Dashboard */}
      {showPerformanceDashboard && (
        <PerformanceDashboard
          isOpen={showPerformanceDashboard}
          onClose={() => setShowPerformanceDashboard(false)}
        />
      )}
    </div>
  );
}
