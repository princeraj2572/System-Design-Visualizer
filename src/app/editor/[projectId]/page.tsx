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
import ToolbarNew from '@/components/ui/ToolbarNew';
import { layoutNodesHierarchical } from '@/lib/layout-engine';
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

export default function EditorPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!projectId);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
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
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-slate-50">
      {/* Redesigned Toolbar */}
      <ToolbarNew
        projectName={projectName}
        isSaving={isSaving}
        onLayoutClick={handleAutoLayout}
        onExportClick={() => setShowExportDialog(true)}
        onAnalyticsClick={handleSave}
        onShowTemplates={() => setShowTemplateLibrary(true)}
        onShowAuditLog={() => setShowAuditLog(true)}
        onShowCompliance={() => setShowCompliance(true)}
        onShowHealth={() => setShowHealthDashboard(true)}
        onShowMetrics={() => setShowComponentMetrics(true)}
        onShowDependencies={() => setShowDependencyTracer(true)}
        onShowFrameworks={() => setShowComplianceDashboard(true)}
        onShowRemediation={() => setShowRemediationTracker(true)}
        onShowCollaboration={() => setShowAdvancedCollaboration(true)}
        onShowSharedWorkspace={() => setShowSharedWorkspace(true)}
        onShowPerformance={() => setShowPerformanceDashboard(true)}
      />

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
            ) : (
              <HierarchyPanel />
            )}
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
