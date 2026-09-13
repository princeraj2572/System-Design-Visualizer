'use client';

import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge as rfAddEdge,
} from 'reactflow';
import type { NodeChange, EdgeChange, Connection } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import type {
  ArchNode,
  ArchEdge,
  NodeType,
  NodeData,
  ValidationIssue,
  Project,
} from '@/types';
import { NODE_CONFIG } from '@/components/nodes/nodeConfig';

const MAX_HISTORY = 50;

interface HistoryEntry {
  nodes: ArchNode[];
  edges: ArchEdge[];
}

interface CanvasStore {
  nodes: ArchNode[];
  edges: ArchEdge[];
  selectedNodeId: string | null;
  theme: 'light' | 'dark';
  history: HistoryEntry[];
  future: HistoryEntry[];
  projectName: string;
  validationIssues: ValidationIssue[];
  showValidation: boolean;

  // React Flow handlers
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Node actions
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  deleteNode: (id: string) => void;
  setSelectedNode: (id: string | null) => void;

  // History
  undo: () => void;
  redo: () => void;
  snapshot: () => void;

  // Theme
  toggleTheme: () => void;

  // Project
  setProjectName: (name: string) => void;
  loadProject: (project: Project) => void;
  clearCanvas: () => void;
  getProject: () => Project;

  // Validation
  validate: () => void;
  dismissValidation: () => void;
}

function deepClone<T>(val: T): T {
  return JSON.parse(JSON.stringify(val));
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  theme: 'dark',
  history: [],
  future: [],
  projectName: 'Untitled Architecture',
  validationIssues: [],
  showValidation: false,

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes) as ArchNode[],
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges) as ArchEdge[],
    }));
  },

  onConnect: (connection) => {
    get().snapshot();
    const { nodes } = get();
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);

    let isValid = true;
    if (sourceNode && targetNode) {
      const { allowedTargets } = NODE_CONFIG[sourceNode.data.nodeType];
      isValid = allowedTargets.length === 0 || allowedTargets.includes(targetNode.data.nodeType);
    }

    set((state) => ({
      edges: rfAddEdge(
        {
          ...connection,
          id: uuidv4(),
          animated: isValid,
          type: 'smoothstep',
          style: {
            stroke: isValid ? '#6366f1' : '#ef4444',
            strokeWidth: 1.5,
            strokeDasharray: isValid ? undefined : '5 3',
          },
          data: { isValid },
        },
        state.edges
      ) as ArchEdge[],
    }));
  },

  addNode: (type, position) => {
    get().snapshot();
    const config = NODE_CONFIG[type];
    const newNode: ArchNode = {
      id: uuidv4(),
      type: 'custom',
      position,
      data: {
        nodeType: type,
        name: config.defaultName,
        description: '',
        technology: config.defaultTechnology,
        config: '',
      },
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },

  updateNodeData: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    }));
  },

  deleteNode: (id) => {
    get().snapshot();
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));
  },

  setSelectedNode: (id) => {
    set({ selectedNodeId: id });
  },

  snapshot: () => {
    const { nodes, edges, history } = get();
    const entry: HistoryEntry = {
      nodes: deepClone(nodes),
      edges: deepClone(edges),
    };
    const newHistory = [...history, entry].slice(-MAX_HISTORY);
    set({ history: newHistory, future: [] });
  },

  undo: () => {
    const { history, nodes, edges, future } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    const newFuture: HistoryEntry[] = [
      { nodes: deepClone(nodes), edges: deepClone(edges) },
      ...future,
    ];
    set({
      nodes: prev.nodes,
      edges: prev.edges,
      history: history.slice(0, -1),
      future: newFuture,
      selectedNodeId: null,
    });
  },

  redo: () => {
    const { future, nodes, edges, history } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newHistory: HistoryEntry[] = [
      ...history,
      { nodes: deepClone(nodes), edges: deepClone(edges) },
    ];
    set({
      nodes: next.nodes,
      edges: next.edges,
      history: newHistory,
      future: future.slice(1),
      selectedNodeId: null,
    });
  },

  toggleTheme: () => {
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }));
  },

  setProjectName: (name) => {
    set({ projectName: name });
  },

  loadProject: (project) => {
    set({
      nodes: project.nodes,
      edges: project.edges,
      projectName: project.name,
      selectedNodeId: null,
      history: [],
      future: [],
      validationIssues: [],
      showValidation: false,
    });
  },

  clearCanvas: () => {
    get().snapshot();
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      validationIssues: [],
      showValidation: false,
    });
  },

  getProject: () => {
    const { nodes, edges, projectName } = get();
    return {
      id: uuidv4(),
      name: projectName,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  validate: () => {
    const { nodes, edges } = get();
    const issues = runValidation(nodes, edges);
    set({ validationIssues: issues, showValidation: true });
  },

  dismissValidation: () => {
    set({ showValidation: false });
  },
}));

function runValidation(nodes: ArchNode[], edges: ArchEdge[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (nodes.length === 0) {
    return [{ severity: 'warning', message: 'Canvas is empty — add some components first.' }];
  }

  // Disconnected nodes
  const connected = new Set<string>();
  edges.forEach((e) => { connected.add(e.source); connected.add(e.target); });
  nodes.forEach((n) => {
    if (!connected.has(n.id)) {
      issues.push({
        severity: 'warning',
        message: `"${n.data.name}" is not connected to anything.`,
        nodeId: n.id,
      });
    }
  });

  // Architecture connection rules
  edges.forEach((e) => {
    const src = nodes.find((n) => n.id === e.source);
    const tgt = nodes.find((n) => n.id === e.target);
    if (!src || !tgt) return;
    const { allowedTargets, label: srcLabel } = NODE_CONFIG[src.data.nodeType];
    const { label: tgtLabel } = NODE_CONFIG[tgt.data.nodeType];
    if (allowedTargets.length > 0 && !allowedTargets.includes(tgt.data.nodeType)) {
      issues.push({
        severity: 'warning',
        message: `Unusual connection: ${srcLabel} → ${tgtLabel}. ${srcLabel} doesn't typically talk directly to ${tgtLabel}.`,
        nodeId: src.id,
      });
    }
  });

  // Client directly hitting internal services
  edges.forEach((e) => {
    const src = nodes.find((n) => n.id === e.source);
    const tgt = nodes.find((n) => n.id === e.target);
    if (!src || !tgt) return;
    if (src.data.nodeType === 'user' && ['database', 'cache', 'messageQueue', 'storage', 'microservice', 'worker'].includes(tgt.data.nodeType)) {
      issues.push({
        severity: 'error',
        message: `Client "${src.data.name}" connects directly to "${tgt.data.name}" — internal services should not be exposed to users.`,
        nodeId: src.id,
      });
    }
  });

  // Cycle detection (DFS)
  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n.id, []));
  edges.forEach((e) => adj.get(e.source)?.push(e.target));
  const visited = new Set<string>();
  const stack = new Set<string>();
  let hasCycle = false;
  function dfs(id: string) {
    visited.add(id); stack.add(id);
    for (const nb of adj.get(id) ?? []) {
      if (!visited.has(nb)) dfs(nb);
      else if (stack.has(nb)) { hasCycle = true; return; }
    }
    stack.delete(id);
  }
  nodes.forEach((n) => { if (!visited.has(n.id)) dfs(n.id); });
  if (hasCycle) {
    issues.push({ severity: 'warning', message: 'Circular dependency detected — check for feedback loops.' });
  }

  // No entry point
  const hasUser = nodes.some((n) => n.data.nodeType === 'user');
  if (!hasUser && nodes.length > 2) {
    issues.push({ severity: 'warning', message: 'No User / Client entry point. Add one to define the traffic source.' });
  }

  // Database without cache
  const hasDb = nodes.some((n) => n.data.nodeType === 'database');
  const hasCache = nodes.some((n) => n.data.nodeType === 'cache');
  if (hasDb && !hasCache && nodes.length > 3) {
    issues.push({ severity: 'warning', message: 'Consider adding a Cache layer in front of your Database to reduce read latency.' });
  }

  // Message queue without worker
  const hasMQ = nodes.some((n) => n.data.nodeType === 'messageQueue');
  const hasWorker = nodes.some((n) => n.data.nodeType === 'worker');
  if (hasMQ && !hasWorker) {
    issues.push({ severity: 'warning', message: 'Message Queue has no Worker consuming it — queued messages will not be processed.' });
  }

  return issues;
}
