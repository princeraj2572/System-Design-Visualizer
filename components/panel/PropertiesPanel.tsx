'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { NODE_CONFIG } from '@/components/nodes/nodeConfig';
import type { NodeData, NodeType } from '@/types';

type FormField = 'name' | 'technology' | 'description' | 'config';

const FIELDS: {
  field: FormField; label: string; multiline: boolean;
  placeholder: (c: { defaultName: string; defaultTechnology: string }) => string;
}[] = [
  { field: 'name',        label: 'Name',        multiline: false, placeholder: (c) => c.defaultName },
  { field: 'technology',  label: 'Technology',  multiline: false, placeholder: (c) => c.defaultTechnology },
  { field: 'description', label: 'Description', multiline: true,  placeholder: () => 'What does this component do?' },
  { field: 'config',      label: 'Config',      multiline: true,  placeholder: () => 'hostname, port, replicas, region…' },
];

export default function PropertiesPanel() {
  const { nodes, selectedNodeId, updateNodeData, deleteNode } = useCanvasStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const [form, setForm] = useState<Partial<NodeData>>({});

  useEffect(() => {
    if (selectedNode) setForm({ ...selectedNode.data });
    else setForm({});
  }, [selectedNode]);

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

  const handleChange = (field: FormField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    updateNodeData(selectedNode.id, { [field]: value });
  };

  const inputCls = `w-full rounded-lg px-2.5 py-1.5 text-[11px] text-slate-800 dark:text-zinc-200
    bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800
    placeholder-slate-400 dark:placeholder-zinc-600
    focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-600
    transition-colors resize-none`;

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

        {/* Node ID */}
        <div>
          <label className="block text-[9px] font-bold text-slate-300 dark:text-zinc-700 uppercase tracking-widest mb-1">
            Node ID
          </label>
          <p className="text-[9px] text-slate-300 dark:text-zinc-700 font-mono truncate">{selectedNode.id}</p>
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
