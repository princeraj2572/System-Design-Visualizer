'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useArchitectureStore } from '@/store/architecture-store';
import { projectService } from '@/lib/project-service';
import ArchitectureCanvas from '@/components/canvas/ArchitectureCanvas';
import Button from '@/components/ui/Button';

export default function EditorPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!projectId);

  const load = useArchitectureStore((state) => state.load);
  const saveProject = useArchitectureStore((state) => state.saveProject);
  const setCurrentProjectId = useArchitectureStore((state) => state.setCurrentProjectId);
  const setProjectName = useArchitectureStore((state) => state.setProjectName);
  const setProjectDescription = useArchitectureStore((state) => state.setProjectDescription);
  const projectName = useArchitectureStore((state) => state.projectName);

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

  return (
    <div className="w-full h-screen flex flex-col bg-slate-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 shadow-sm p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{projectName || 'Untitled Project'}</h1>
          <p className="text-sm text-slate-600">System Design Visualizer</p>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => window.history.back()} variant="ghost">
            Back
          </Button>
          <Button onClick={handleExport} variant="ghost">
            Export
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Canvas */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading project...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <ArchitectureCanvas />
        </div>
      )}
    </div>
  );
}
