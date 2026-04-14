/**
 * Zustand store for architecture state management
 */

import { create } from 'zustand';
import { NodeData, Edge, ArchitectureState } from '@/types/architecture';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@/lib/auth-service';
import { projectService } from '@/lib/project-service';

interface StoreState extends ArchitectureState {
  // Authentication
  authToken: string | null;
  authUser: User | null;
  isCheckingAuth: boolean;
  setAuthToken: (token: string | null) => void;
  setAuthUser: (user: User | null) => void;
  
  // Project management
  currentProjectId: string | null;
  projectName: string;
  projectDescription: string;
  isLoadingProject: boolean;
  isSavingProject: boolean;
  setCurrentProjectId: (id: string | null) => void;
  setProjectName: (name: string) => void;
  setProjectDescription: (description: string) => void;
  loadProject: (projectId: string) => Promise<void>;
  saveProject: () => Promise<void>;
  createNewProject: (name: string, description: string) => Promise<string>;

  // Node operations
  addNode: (node: Omit<NodeData, 'id'>) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, updates: Partial<NodeData>) => void;
  selectNode: (id: string | null) => void;

  // Edge operations
  addEdge: (edge: Omit<Edge, 'id'>) => void;
  removeEdge: (id: string) => void;
  updateEdge: (id: string, updates: Partial<Edge>) => void;

  // History operations
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  // Load/Save operations
  load: (data: ArchitectureState) => void;
  save: () => ArchitectureState;

  // Theme
  setTheme: (theme: 'light' | 'dark') => void;

  // Clear all
  clearAll: () => void;
}

const initialState: ArchitectureState = {
  nodes: [],
  edges: [],
  selectedNode: null,
  history: [],
  historyIndex: -1,
  theme: 'light',
};

export const useArchitectureStore = create<StoreState>((set, get) => ({
  ...initialState,
  authToken: null,
  authUser: null,
  isCheckingAuth: true,
  currentProjectId: null,
  projectName: 'Untitled Project',
  projectDescription: '',
  isLoadingProject: false,
  isSavingProject: false,

  // Auth
  setAuthToken: (token) =>
    set(() => ({
      authToken: token,
    })),

  setAuthUser: (user) =>
    set(() => ({
      authUser: user,
      isCheckingAuth: false,
    })),

  // Project management
  setCurrentProjectId: (id) =>
    set(() => ({
      currentProjectId: id,
    })),

  setProjectName: (name) =>
    set(() => ({
      projectName: name,
    })),

  setProjectDescription: (description) =>
    set(() => ({
      projectDescription: description,
    })),

  loadProject: async (projectId) => {
    set(() => ({ isLoadingProject: true }));
    try {
      const project = await projectService.getProject(projectId);
      set(() => ({
        currentProjectId: project.id,
        projectName: project.name,
        projectDescription: project.description || '',
        nodes: project.nodes || [],
        edges: project.edges || [],
        isLoadingProject: false,
      }));
    } catch (error) {
      console.error('Failed to load project:', error);
      set(() => ({ isLoadingProject: false }));
      throw error;
    }
  },

  saveProject: async () => {
    const state = get();
    if (!state.currentProjectId) return;

    set(() => ({ isSavingProject: true }));
    try {
      await projectService.updateProject(state.currentProjectId, {
        name: state.projectName,
        description: state.projectDescription,
        nodes: state.nodes,
        edges: state.edges,
      });
      set(() => ({ isSavingProject: false }));
    } catch (error) {
      console.error('Failed to save project:', error);
      set(() => ({ isSavingProject: false }));
      throw error;
    }
  },

  createNewProject: async (name, description) => {
    set(() => ({ isSavingProject: true }));
    try {
      const project = await projectService.createProject({
        name,
        description,
        nodes: [],
        edges: [],
      });
      set(() => ({
        currentProjectId: project.id,
        projectName: project.name,
        projectDescription: project.description || '',
        nodes: project.nodes || [],
        edges: project.edges || [],
        isSavingProject: false,
      }));
      return project.id;
    } catch (error) {
      console.error('Failed to create project:', error);
      set(() => ({ isSavingProject: false }));
      throw error;
    }
  },

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, { ...node, id: uuidv4() }],
    })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
      selectedNode: state.selectedNode === id ? null : state.selectedNode,
    })),

  updateNode: (id, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) => (node.id === id ? { ...node, ...updates } : node)),
    })),

  selectNode: (id) =>
    set(() => ({
      selectedNode: id,
    })),

  addEdge: (edge) =>
    set((state) => ({
      edges: [...state.edges, { ...edge, id: uuidv4() }],
    })),

  removeEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    })),

  updateEdge: (id, updates) =>
    set((state) => ({
      edges: state.edges.map((edge) => (edge.id === id ? { ...edge, ...updates } : edge)),
    })),

  saveToHistory: () =>
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        history: [...newHistory, { nodes: state.nodes, edges: state.edges }],
        historyIndex: newHistory.length,
      };
    }),

  undo: () =>
    set((state) => {
      if (state.historyIndex > 0) {
        const prevIndex = state.historyIndex - 1;
        const prevState = state.history[prevIndex];
        return {
          nodes: prevState.nodes,
          edges: prevState.edges,
          historyIndex: prevIndex,
        };
      }
      return state;
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        const nextIndex = state.historyIndex + 1;
        const nextState = state.history[nextIndex];
        return {
          nodes: nextState.nodes,
          edges: nextState.edges,
          historyIndex: nextIndex,
        };
      }
      return state;
    }),

  setTheme: (theme) =>
    set(() => ({
      theme,
    })),

  load: (data) =>
    set(() => ({
      nodes: data.nodes || [],
      edges: data.edges || [],
      selectedNode: data.selectedNode || null,
      history: data.history || [],
      historyIndex: data.historyIndex || -1,
      theme: data.theme || 'light',
    })),

  save: () => {
    const state = get();
    return {
      nodes: state.nodes,
      edges: state.edges,
      selectedNode: state.selectedNode,
      history: state.history,
      historyIndex: state.historyIndex,
      theme: state.theme,
    };
  },

  clearAll: () =>
    set(() => ({
      nodes: [],
      edges: [],
      selectedNode: null,
      history: [],
      historyIndex: -1,
    })),
}));
