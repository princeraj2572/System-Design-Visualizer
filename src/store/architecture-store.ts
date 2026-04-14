/**
 * Zustand store for architecture state management
 */

import { create } from 'zustand';
import { NodeData, Edge, ArchitectureState } from '@/types/architecture';
import { v4 as uuidv4 } from 'uuid';

interface StoreState extends ArchitectureState {
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

export const useArchitectureStore = create<StoreState>((set) => ({
  ...initialState,

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

  clearAll: () =>
    set(() => ({
      nodes: [],
      edges: [],
      selectedNode: null,
      history: [],
      historyIndex: -1,
    })),
}));
