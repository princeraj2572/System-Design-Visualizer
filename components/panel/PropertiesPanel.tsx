'use client';

import { useEffect, useRef, useState } from 'react';
import { Trash2, Copy, Check, X, Plus, ArrowRight } from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { NODE_CONFIG } from '@/components/nodes/nodeConfig';
import type { NodeData, NodeType } from '@/types';

type FormField = 'name' | 'technology' | 'description';

const FIELDS: {
  field: FormField; label: string; multiline: boolean;
  placeholder: (c: { defaultName: string; defaultTechnology: string }) => string;
}[] = [
  { field: 'name',        label: 'Name',        multiline: false, placeholder: (c) => c.defaultName },
  { field: 'technology',  label: 'Technology',  multiline: false, placeholder: (c) => c.defaultTechnology },
  { field: 'description', label: 'Description', multiline: true,  placeholder: () => 'What does this component do?' },
];

const inputCls = `w-full rounded-lg px-2.5 py-1.5 text-[11px] text-slate-800 dark:text-zinc-200
  bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800
  placeholder-slate-400 dark:placeholder-zinc-600
  focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-600
  transition-colors resize-none`;

function parseConfig(raw: string): { key: string; value: string }[] {
  return raw
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const idx = line.indexOf(':');
      return idx === -1
        ? { key: line.trim(), value: '' }
        : { key: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
    });
}

function serializeConfig(rows: { key: string; value: string }[]): string {
  return rows
    .filter((r) => r.key.trim().length > 0)
    .map((r) => (r.value ? `${r.key}: ${r.value}` : r.key))
    .join('\n');
}

export default function PropertiesPanel() {
  const { nodes, edges, selectedNodeId, updateNodeData, deleteNode, deleteEdge, snapshot } = useCanvasStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const [form, setForm] = useState<Partial<NodeData>>({});
  const [configRows, setConfigRows] = useState<{ key: string; value: string }[]>([]);
  const [copied, setCopied] = useState(false);
  // Snapshot once per node-selection, not per keystroke, so undo reverts
  // "everything typed while this node was open" as a single step.
  const snapshotTakenFor = useRef<string | null>(null);

  useEffect(() => {
    if (selectedNode) {
      setForm({ ...selectedNode.data });
      setConfigRows(parseConfig(selectedNode.data.config ?? ''));
    } else {
      setForm({});
      setConfigRows([]);
    }
    snapshotTakenFor.current = null;
    // Re-syncs only when the selected node identity changes, not on every
    // keystroke (updateNodeData replaces the node object on each edit).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode?.id]);

  if (!selectedNode) {
    return (
      <aside className="w-60 flex-shrink-0 bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className="w-5 h-5 text-slate-300 dark:text-zinc-600">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
        <div className="text-center px-5">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">No component selected</p>
          <p className="text-[10px] text-slate-300 dark:text-zinc-600 mt-1 leading-relaxed">
            Click a node on the canvas to inspect and edit its properties
          </p>
        </div>
      </aside>
    );
  }

  const config = NODE_CONFIG[selectedNode.data.nodeType];
  const { Icon } = config;

  const ensureSnapshot = () => {
    if (snapshotTakenFor.current !== selectedNode.id) {
      snapshot();
      snapshotTakenFor.current = selectedNode.id;
    }
  };

  const handleChange = (field: FormField, value: string) => {
    ensureSnapshot();
    setForm((prev) => ({ ...prev, [field]: value }));
    updateNodeData(selectedNode.id, { [field]: value });
  };

  const commitConfigRows = (rows: { key: string; value: string }[]) => {
    ensureSnapshot();
    setConfigRows(rows);
    updateNodeData(selectedNode.id, { config: serializeConfig(rows) });
  };

  const handleCopyId = () => {
    navigator.clipboard?.writeText(selectedNode.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const connectedEdges = edges
    .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
    .map((e) => {
      const isOutgoing = e.source === selectedNode.id;
      const otherId = isOutgoing ? e.target : e.source;
      const other = nodes.find((n) => n.id === otherId);
      return { edge: e, isOutgoing, otherName: other?.data.name || 'Unknown' };
    });

  return (
    <aside className="w-60 flex-shrink-0 bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3.5 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${config.accent}18` }}>
          <Icon size={16} style={{ color: config.accent }} strokeWidth={2}/>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-slate-800 dark:text-zinc-100 truncate">
            {form.name || config.defaultName}
          </p>
          <p className="text-[9px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: config.accent }}>
            {config.label}
          </p>
        </div>
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: config.accent }}/>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3">
        {FIELDS.map(({ field, label, multiline, placeholder }) => (
          <div key={field}>
            <label className="block text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
              {label}
            </label>
            {multiline
              ? <textarea value={(form[field] as string) ?? ''} onChange={(e) => handleChange(field, e.target.value)}
                  placeholder={placeholder(config)} rows={3} className={inputCls}/>
              : <input type="text" value={(form[field] as string) ?? ''} onChange={(e) => handleChange(field, e.target.value)}
                  placeholder={placeholder(config)} className={inputCls}/>
            }
          </div>
        ))}

        {/* Config editor */}
        <div>
          <label className="block text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
            Config
          </label>
          <div className="space-y-1">
            {configRows.map((row, i) => (
              <div key={i} className="flex items-center gap-1">
                <input
                  value={row.key}
                  onChange={(e) => {
                    const next = [...configRows]; next[i] = { ...row, key: e.target.value };
                    commitConfigRows(next);
                  }}
                  placeholder="key"
                  className={`${inputCls} !py-1 w-[40%]`}
                />
                <input
                  value={row.value}
                  onChange={(e) => {
                    const next = [...configRows]; next[i] = { ...row, value: e.target.value };
                    commitConfigRows(next);
                  }}
                  placeholder="value"
                  className={`${inputCls} !py-1 flex-1`}
                />
                <button
                  onClick={() => commitConfigRows(configRows.filter((_, j) => j !== i))}
                  className="flex-shrink-0 p-1 rounded text-slate-300 dark:text-zinc-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <X size={12}/>
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => commitConfigRows([...configRows, { key: '', value: '' }])}
            className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-zinc-500
              hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          >
            <Plus size={11}/> Add field
          </button>
        </div>

        {/* Connection rules */}
        {config.allowedTargets.length > 0 && (
          <div>
            <label className="block text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
              Connects to
            </label>
            <div className="flex flex-wrap gap-1">
              {config.allowedTargets.map((t) => {
                const tc = NODE_CONFIG[t as NodeType];
                return (
                  <span key={t} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium
                    bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800
                    text-slate-500 dark:text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: tc.accent }}/>
                    {tc.label}
                  </span>
                );
              })}
            </div>
            <p className="text-[9px] text-slate-400 dark:text-zinc-600 mt-1.5 leading-relaxed">
              {config.description}
            </p>
          </div>
        )}

        {/* Connected edges */}
        {connectedEdges.length > 0 && (
          <div>
            <label className="block text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">
              Connections ({connectedEdges.length})
            </label>
            <div className="space-y-1">
              {connectedEdges.map(({ edge, isOutgoing, otherName }) => (
                <div key={edge.id} className="group flex items-center gap-1.5 px-2 py-1 rounded-md
                  bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                  {isOutgoing
                    ? <ArrowRight size={10} className="text-slate-400 dark:text-zinc-600 flex-shrink-0"/>
                    : <ArrowRight size={10} className="text-slate-400 dark:text-zinc-600 flex-shrink-0 rotate-180"/>}
                  <span className="text-[10px] text-slate-600 dark:text-zinc-400 truncate flex-1">{otherName}</span>
                  <button
                    onClick={() => deleteEdge(edge.id)}
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-slate-300 dark:text-zinc-600
                      hover:text-red-500 transition-all"
                  >
                    <X size={11}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Node ID */}
        <div>
          <label className="block text-[9px] font-bold text-slate-300 dark:text-zinc-700 uppercase tracking-widest mb-1">
            Node ID
          </label>
          <button
            onClick={handleCopyId}
            title="Copy to clipboard"
            className="group flex items-center gap-1 max-w-full text-left"
          >
            <p className="text-[9px] text-slate-300 dark:text-zinc-700 font-mono truncate group-hover:text-slate-500 dark:group-hover:text-zinc-500 transition-colors">
              {selectedNode.id}
            </p>
            {copied
              ? <Check size={10} className="text-emerald-500 flex-shrink-0"/>
              : <Copy size={10} className="text-slate-300 dark:text-zinc-700 group-hover:text-slate-500 dark:group-hover:text-zinc-500 flex-shrink-0 transition-colors"/>}
          </button>
        </div>
      </div>

      {/* Delete */}
      <div className="px-3.5 pb-3.5 pt-2.5 border-t border-slate-100 dark:border-zinc-800">
        <button onClick={() => deleteNode(selectedNode.id)}
          className="w-full py-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5
            bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50
            border border-red-200 dark:border-red-900/40
            text-red-500 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400
            transition-colors">
          <Trash2 size={13} strokeWidth={2}/> Delete Component
        </button>
      </div>
    </aside>
  );
}
