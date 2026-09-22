'use client';

import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge as rfAddEdge,
  MarkerType,
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
  clipboard: ArchNode | null;
  recentTypes: NodeType[];
  savedSnapshot: string;

  // React Flow handlers
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Node actions
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  nudgeNode: (id: string, dx: number, dy: number) => void;
  copyNode: (id: string) => void;
  pasteNode: () => void;
  autoLayout: () => void;
  setSelectedNode: (id: string | null) => void;

  // History
  undo: () => void;
  redo: () => void;
  snapshot: () => void;

  // Theme
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Project
  setProjectName: (name: string) => void;
  loadProject: (project: Project) => void;
  clearCanvas: () => void;
  getProject: () => Project;
  markSaved: () => void;

  // Validation
  validate: () => void;
  dismissValidation: () => void;
}

function snapshotKey(nodes: ArchNode[], edges: ArchEdge[]): string {
  return JSON.stringify({ nodes, edges });
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
  clipboard: null,
  recentTypes: [],
  savedSnapshot: snapshotKey([], []),

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

    const stroke = isValid ? '#6366f1' : '#ef4444';
    set((state) => ({
      edges: rfAddEdge(
        {
          ...connection,
          id: uuidv4(),
          animated: isValid,
          type: 'smoothstep',
          style: {
            stroke,
            strokeWidth: 1.5,
            strokeDasharray: isValid ? undefined : '5 3',
          },
          markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: stroke },
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
    set((state) => ({
      nodes: [...state.nodes, newNode],
      recentTypes: [type, ...state.recentTypes.filter((t) => t !== type)].slice(0, 5),
    }));
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

  duplicateNode: (id) => {
    const { nodes } = get();
    const source = nodes.find((n) => n.id === id);
    if (!source) return;
    get().snapshot();
    const clone: ArchNode = {
      ...source,
      id: uuidv4(),
      position: { x: source.position.x + 32, y: source.position.y + 32 },
      selected: false,
      data: { ...source.data },
    };
    set((state) => ({ nodes: [...state.nodes, clone], selectedNodeId: clone.id }));
  },

  nudgeNode: (id, dx, dy) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } } : n
      ),
    }));
  },

  copyNode: (id) => {
    const node = get().nodes.find((n) => n.id === id);
    if (node) set({ clipboard: { ...node, data: { ...node.data } } });
  },

  pasteNode: () => {
    const { clipboard } = get();
    if (!clipboard) return;
    get().snapshot();
    const clone: ArchNode = {
      ...clipboard,
      id: uuidv4(),
      position: { x: clipboard.position.x + 48, y: clipboard.position.y + 48 },
      selected: false,
      data: { ...clipboard.data },
    };
    set((state) => ({ nodes: [...state.nodes, clone], selectedNodeId: clone.id }));
  },

  autoLayout: () => {
    const { nodes, edges } = get();
    if (nodes.length === 0) return;
    get().snapshot();

    const incoming = new Map<string, number>();
    const adj = new Map<string, string[]>();
    nodes.forEach((n) => { incoming.set(n.id, 0); adj.set(n.id, []); });
    edges.forEach((e) => {
      if (!adj.has(e.source) || !incoming.has(e.target)) return;
      adj.get(e.source)!.push(e.target);
      incoming.set(e.target, (incoming.get(e.target) ?? 0) + 1);
    });

    // Longest-path layering (BFS from roots); nodes in cycles fall back to layer 0.
    const layer = new Map<string, number>();
    const queue = nodes.filter((n) => (incoming.get(n.id) ?? 0) === 0).map((n) => n.id);
    queue.forEach((id) => layer.set(id, 0));
    let cursor = 0;
    while (cursor < queue.length) {
      const id = queue[cursor++];
      const depth = layer.get(id) ?? 0;
      for (const next of adj.get(id) ?? []) {
        if ((layer.get(next) ?? -1) < depth + 1) {
          layer.set(next, depth + 1);
          queue.push(next);
        }
      }
    }
    nodes.forEach((n) => { if (!layer.has(n.id)) layer.set(n.id, 0); });

    const spacingX = 260;
    const spacingY = 150;
    const columns = new Map<number, string[]>();
    nodes.forEach((n) => {
      const l = layer.get(n.id) ?? 0;
      if (!columns.has(l)) columns.set(l, []);
      columns.get(l)!.push(n.id);
    });

    const positions = new Map<string, { x: number; y: number }>();
    Array.from(columns.entries())
      .sort(([a], [b]) => a - b)
      .forEach(([col, ids]) => {
        const totalHeight = ids.length * spacingY;
        ids.forEach((id, i) => {
          positions.set(id, { x: col * spacingX, y: i * spacingY - totalHeight / 2 });
        });
      });

    set((state) => ({
      nodes: state.nodes.map((n) => ({ ...n, position: positions.get(n.id) ?? n.position })),
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
    set((state) => {
      const theme = state.theme === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('theme', theme); } catch {}
      return { theme };
    });
  },

  setTheme: (theme) => {
    try { localStorage.setItem('theme', theme); } catch {}
    set({ theme });
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
      savedSnapshot: snapshotKey(project.nodes, project.edges),
    });
  },

  markSaved: () => {
    const { nodes, edges } = get();
    set({ savedSnapshot: snapshotKey(nodes, edges) });
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
