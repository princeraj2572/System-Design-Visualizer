'use client';

import { useEffect, useState } from 'react';
import { useArchitectureStore } from '@/store/architecture-store';
import { projectService, ProjectsListResponse } from '@/lib/project-service';
import Button from '@/components/ui/Button';
import { Layout } from '@/components/ui/Layout';

export default function ProjectsPage() {
  const { authUser } = useArchitectureStore();
  const [projects, setProjects] = useState<ProjectsListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const createNewProject = useArchitectureStore((state) => state.createNewProject);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectService.listProjects();
      setProjects(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }

    setIsCreating(true);
    try {
      const projectId = await createNewProject(newProjectName, newProjectDesc);
      setNewProjectName('');
      setNewProjectDesc('');
      window.location.href = `/editor/${projectId}`;
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenProject = async (projectId: string) => {
    window.location.href = `/editor/${projectId}`;
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectService.deleteProject(projectId);
      await loadProjects();
    } catch (err: any) {
      setError(err.message || 'Failed to delete project');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              System Design Visualizer
            </h1>
            <p className="text-slate-600">
              Welcome back, <span className="font-semibold">{authUser?.username}</span>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Create New Project */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Project</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <textarea
                placeholder="Project description (optional)..."
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <Button
                onClick={handleCreateProject}
                disabled={isCreating || !newProjectName.trim()}
                className="w-full"
              >
                {isCreating ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </div>

          {/* Projects List */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Projects</h2>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Loading projects...</p>
              </div>
            ) : projects && projects.projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 group cursor-pointer"
                  >
                    <div onClick={() => handleOpenProject(project.id)} className="mb-4">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-cyan-600">
                        {project.name}
                      </h3>
                      <p className="text-slate-600 text-sm mt-2 line-clamp-2">
                        {project.description || 'No description'}
                      </p>
                      <div className="mt-4 text-xs text-slate-500">
                        <p>
                          {project.nodes?.length || 0} nodes • {project.edges?.length || 0} connections
                        </p>
                        <p>Updated: {new Date(project.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-slate-200">
                      <Button
                        onClick={() => handleOpenProject(project.id)}
                        size="sm"
                        variant="primary"
                        className="flex-1"
                      >
                        Open
                      </Button>
                      <Button
                        onClick={() => handleDeleteProject(project.id)}
                        size="sm"
                        variant="ghost"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-slate-600 mb-4">No projects yet. Create your first one above!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
