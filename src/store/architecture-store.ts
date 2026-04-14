/**
 * Zustand store for architecture state management
 */

import { create } from 'zustand';
import { NodeData, Edge, ArchitectureState, NodeGroup } from '@/types/architecture';
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
  
  // Multi-select operations
  selectedNodes: string[];
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  deleteSelectedNodes: () => void;
  duplicateSelectedNodes: () => void;
  copyToClipboard: () => void;
  pasteFromClipboard: () => void;

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

  // Hierarchy operations
  createGroup: (name: string, nodeIds: string[], parentId?: string | null) => void;
  deleteGroup: (groupId: string) => void;
  updateGroup: (groupId: string, updates: Partial<NodeGroup>) => void;
  moveNodeToGroup: (nodeId: string, groupId: string | null) => void;
  toggleGroupExpanded: (groupId: string) => void;
  expandAllGroups: () => void;
  collapseAllGroups: () => void;

  // Search & Filter
  searchQuery: string;
  filterTypes: string[];
  filterConnectivity: { incoming: boolean; outgoing: boolean };
  filteredNodeIds: Set<string>;
  filteredEdgeIds: Set<string>;
  setSearchQuery: (query: string) => void;
  setFilterTypes: (types: string[]) => void;
  setFilterConnectivity: (connectivity: { incoming: boolean; outgoing: boolean }) => void;
  applyFilters: () => void;
  clearFilters: () => void;

  // Theme
  setTheme: (theme: 'light' | 'dark') => void;

  // Clear all
  clearAll: () => void;
}

const initialState: ArchitectureState = {
  nodes: [],
  edges: [],
  groups: [],
  selectedNode: null,
  expandedGroups: [],
  history: [],
  historyIndex: -1,
  theme: 'light',
};

// Clipboard for copy/paste
let clipboardData: { nodes: NodeData[]; edges: Edge[] } | null = null;

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
  selectedNodes: [],
  
  // Search & Filter
  searchQuery: '',
  filterTypes: [],
  filterConnectivity: { incoming: false, outgoing: false },
  filteredNodeIds: new Set(),
  filteredEdgeIds: new Set(),

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
        groups: project.groups || [],
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
        groups: state.groups,
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
        groups: [],
      });
      set(() => ({
        currentProjectId: project.id,
        projectName: project.name,
        projectDescription: project.description || '',
        nodes: project.nodes || [],
        edges: project.edges || [],
        groups: project.groups || [],
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

  // Multi-select operations
  addToSelection: (id) =>
    set((state) => ({
      selectedNodes: state.selectedNodes.includes(id) ? state.selectedNodes : [...state.selectedNodes, id],
    })),

  removeFromSelection: (id) =>
    set((state) => ({
      selectedNodes: state.selectedNodes.filter((nodeId) => nodeId !== id),
    })),

  toggleSelection: (id) =>
    set((state) => ({
      selectedNodes: state.selectedNodes.includes(id)
        ? state.selectedNodes.filter((nodeId) => nodeId !== id)
        : [...state.selectedNodes, id],
    })),

  clearSelection: () =>
    set(() => ({
      selectedNodes: [],
    })),

  selectAll: () =>
    set((state) => ({
      selectedNodes: state.nodes.map((n) => n.id),
    })),

  deleteSelectedNodes: () =>
    set((state) => {
      const nodesToDelete = state.selectedNodes;
      return {
        nodes: state.nodes.filter((n) => !nodesToDelete.includes(n.id)),
        edges: state.edges.filter((e) => !nodesToDelete.includes(e.source) && !nodesToDelete.includes(e.target)),
        selectedNodes: [],
      };
    }),

  duplicateSelectedNodes: () =>
    set((state) => {
      const nodesToDuplicate = state.nodes.filter((n) => state.selectedNodes.includes(n.id));
      const edgesToDuplicate = state.edges.filter(
        (e) => state.selectedNodes.includes(e.source) && state.selectedNodes.includes(e.target)
      );

      const idMap = new Map<string, string>();
      const newNodes = nodesToDuplicate.map((node) => {
        const newId = uuidv4();
        idMap.set(node.id, newId);
        return {
          ...node,
          id: newId,
          position: { x: node.position.x + 50, y: node.position.y + 50 },
        };
      });

      const newEdges = edgesToDuplicate.map((edge) => ({
        ...edge,
        id: uuidv4(),
        source: idMap.get(edge.source) || edge.source,
        target: idMap.get(edge.target) || edge.target,
      }));

      return {
        nodes: [...state.nodes, ...newNodes],
        edges: [...state.edges, ...newEdges],
        selectedNodes: newNodes.map((n) => n.id),
      };
    }),

  copyToClipboard: () => {
    const state = get();
    const nodesToCopy = state.nodes.filter((n) => state.selectedNodes.includes(n.id));
    const edgesToCopy = state.edges.filter(
      (e) => state.selectedNodes.includes(e.source) && state.selectedNodes.includes(e.target)
    );
    clipboardData = { nodes: nodesToCopy, edges: edgesToCopy };
  },

  pasteFromClipboard: () => {
    if (!clipboardData) return;

    set((state) => {
      const idMap = new Map<string, string>();
      const newNodes = clipboardData!.nodes.map((node) => {
        const newId = uuidv4();
        idMap.set(node.id, newId);
        return {
          ...node,
          id: newId,
          position: { x: node.position.x + 30, y: node.position.y + 30 },
        };
      });

      const newEdges = clipboardData!.edges.map((edge) => ({
        ...edge,
        id: uuidv4(),
        source: idMap.get(edge.source) || edge.source,
        target: idMap.get(edge.target) || edge.target,
      }));

      return {
        nodes: [...state.nodes, ...newNodes],
        edges: [...state.edges, ...newEdges],
        selectedNodes: newNodes.map((n) => n.id),
      };
    });
  },

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
        history: [...newHistory, { nodes: state.nodes, edges: state.edges, groups: state.groups }],
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
          groups: prevState.groups || [],
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
          groups: nextState.groups || [],
          historyIndex: nextIndex,
        };
      }
      return state;
    }),

  setTheme: (theme) =>
    set(() => ({
      theme,
    })),

  // Search & Filter operations
  setSearchQuery: (query) =>
    set(() => ({
      searchQuery: query,
    })),

  setFilterTypes: (types) =>
    set(() => ({
      filterTypes: types,
    })),

  setFilterConnectivity: (connectivity) =>
    set(() => ({
      filterConnectivity: connectivity,
    })),

  applyFilters: () => {
    const state = get();
    const { executeSearch } = require('@/lib/search-service');
    
    const result = executeSearch(
      state.nodes,
      state.edges,
      {
        text: state.searchQuery,
        filters: {
          types: state.filterTypes,
          hasIncoming: state.filterConnectivity.incoming,
          hasOutgoing: state.filterConnectivity.outgoing,
          tier: null,
        },
      }
    );

    set(() => ({
      filteredNodeIds: result.nodeIds,
      filteredEdgeIds: result.edgeIds,
    }));
  },

  clearFilters: () =>
    set(() => ({
      searchQuery: '',
      filterTypes: [],
      filterConnectivity: { incoming: false, outgoing: false },
      filteredNodeIds: new Set(),
      filteredEdgeIds: new Set(),
    })),

  load: (data) =>
    set(() => ({
      nodes: data.nodes || [],
      edges: data.edges || [],
      groups: data.groups || [],
      selectedNode: data.selectedNode || null,
      expandedGroups: [],
      history: data.history || [],
      historyIndex: data.historyIndex || -1,
      theme: data.theme || 'light',
    })),

  save: () => {
    const state = get();
    return {
      nodes: state.nodes,
      edges: state.edges,
      groups: state.groups,
      selectedNode: state.selectedNode,
      expandedGroups: state.expandedGroups,
      history: state.history,
      historyIndex: state.historyIndex,
      theme: state.theme,
    };
  },

  // Hierarchy operations
  createGroup: (name, nodeIds, parentId = null) =>
    set((state) => {
      const groupId = uuidv4();
      
      // Validate all node IDs exist
      const nodesToGroup = state.nodes.filter(n => nodeIds.includes(n.id));
      if (nodesToGroup.length === 0) return state;
      
      // Calculate bounding box for the group
      const positions = nodesToGroup.map(n => n.position);
      const minX = Math.min(...positions.map(p => p.x));
      const minY = Math.min(...positions.map(p => p.y));
      const maxX = Math.max(...positions.map(p => p.x));
      const maxY = Math.max(...positions.map(p => p.y));
      
      const newGroup: NodeGroup = {
        id: groupId,
        name,
        parentId: parentId || null,
        childNodeIds: nodeIds,
        position: { x: minX - 50, y: minY - 50 },
        size: {
          width: maxX - minX + 200,
          height: maxY - minY + 200,
        },
        color: '#E8F1F5',
        isCollapsed: false,
      };
      
      // Update nodes to have this group as parent
      const updatedNodes = state.nodes.map(n =>
        nodeIds.includes(n.id) ? { ...n, parentId: groupId } : n
      );
      
      return {
        nodes: updatedNodes,
        groups: [...state.groups, newGroup],
        expandedGroups: [...state.expandedGroups, groupId],
      };
    }),

  deleteGroup: (groupId) =>
    set((state) => {
      const group = state.groups.find(g => g.id === groupId);
      if (!group) return state;
      
      // Remove parentId from all child nodes
      const updatedNodes = state.nodes.map(n =>
        n.parentId === groupId ? { ...n, parentId: null } : n
      );
      
      return {
        nodes: updatedNodes,
        groups: state.groups.filter(g => g.id !== groupId),
        expandedGroups: state.expandedGroups.filter(id => id !== groupId),
      };
    }),

  updateGroup: (groupId, updates) =>
    set((state) => ({
      groups: state.groups.map(g =>
        g.id === groupId ? { ...g, ...updates } : g
      ),
    })),

  moveNodeToGroup: (nodeId, groupId) =>
    set((state) => {
      // Validate group exists if groupId is not null
      if (groupId && !state.groups.find(g => g.id === groupId)) {
        return state;
      }
      
      // Find the node's current group and remove it from there
      const node = state.nodes.find(n => n.id === nodeId);
      if (!node) return state;
      
      const updatedNodes = state.nodes.map(n => {
        if (n.id === nodeId) {
          return { ...n, parentId: groupId || null };
        }
        return n;
      });
      
      // Update old group's childNodeIds
      const updatedGroups = state.groups.map(g => {
        if (g.id === node.parentId) {
          return {
            ...g,
            childNodeIds: g.childNodeIds.filter(id => id !== nodeId),
          };
        }
        if (g.id === groupId) {
          return {
            ...g,
            childNodeIds: g.childNodeIds.includes(nodeId)
              ? g.childNodeIds
              : [...g.childNodeIds, nodeId],
          };
        }
        return g;
      });
      
      return {
        nodes: updatedNodes,
        groups: updatedGroups,
      };
    }),

  toggleGroupExpanded: (groupId) =>
    set((state) => ({
      expandedGroups: state.expandedGroups.includes(groupId)
        ? state.expandedGroups.filter(id => id !== groupId)
        : [...state.expandedGroups, groupId],
    })),

  expandAllGroups: () =>
    set((state) => ({
      expandedGroups: state.groups.map(g => g.id),
    })),

  collapseAllGroups: () =>
    set(() => ({
      expandedGroups: [],
    })),

  clearAll: () =>
    set(() => ({
      nodes: [],
      edges: [],
      groups: [],
      selectedNode: null,
      expandedGroups: [],
      history: [],
      historyIndex: -1,
    })),
}));
