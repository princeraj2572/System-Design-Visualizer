'use client';

import { useEffect, useState } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { NODE_CONFIG } from '@/components/nodes/nodeConfig';
import type { NodeData } from '@/types';

type FormField = 'name' | 'technology' | 'description' | 'config';

const FIELDS: {
  field: FormField;
  label: string;
  multiline: boolean;
  placeholder: (c: { defaultName: string; defaultTechnology: string }) => string;
}[] = [
  { field: 'name', label: 'Name', multiline: false, placeholder: (c) => c.defaultName },
  { field: 'technology', label: 'Technology', multiline: false, placeholder: (c) => c.defaultTechnology },
  { field: 'description', label: 'Description', multiline: true, placeholder: () => 'What does this component do?' },
  { field: 'config', label: 'Config', multiline: true, placeholder: () => 'hostname, port, replicas, region…' },
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
      <aside className="w-60 flex-shrink-0 bg-gray-900/95 border-l border-gray-800 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray-800/60 border border-gray-700/50 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-600">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <div className="text-center px-5">
          <p className="text-[11px] font-semibold text-gray-600">No component selected</p>
          <p className="text-[10px] text-gray-700 mt-1 leading-relaxed">
            Click a node on the canvas to inspect and edit its properties
          </p>
        </div>
      </aside>
    );
  }

  const config = NODE_CONFIG[selectedNode.data.nodeType];

  const handleChange = (field: FormField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    updateNodeData(selectedNode.id, { [field]: value });
  };

  const inputBase =
    'w-full bg-gray-800/80 border border-gray-700/60 rounded-lg px-2.5 py-1.5 text-[11px] text-gray-200 placeholder-gray-600 resize-none transition-all duration-150 outline-none focus:bg-gray-800 focus:border-opacity-100';

  return (
    <aside className="w-60 flex-shrink-0 bg-gray-900/95 border-l border-gray-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3.5 py-3 border-b border-gray-800 flex items-center gap-2.5">
        {/* Accent circle + icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: `${config.accent}1e`, border: `1px solid ${config.accent}30` }}
        >
          {config.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-gray-100 truncate">
            {form.name || config.defaultName}
          </p>
          <p className="text-[9px] font-medium uppercase tracking-wide mt-0.5" style={{ color: config.accent }}>
            {config.label}
          </p>
        </div>
        {/* Accent dot */}
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: config.accent }} />
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3.5">
        {FIELDS.map(({ field, label, multiline, placeholder }) => (
          <div key={field}>
            <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              {label}
            </label>
            {multiline ? (
              <textarea
                value={(form[field] as string) ?? ''}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={placeholder(config)}
                rows={3}
                className={inputBase}
                style={{ ['--tw-ring-color' as string]: config.accent }}
              />
            ) : (
              <input
                type="text"
                value={(form[field] as string) ?? ''}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={placeholder(config)}
                className={inputBase}
                style={{ ['--tw-ring-color' as string]: config.accent }}
              />
            )}
          </div>
        ))}

        {/* Node ID */}
        <div>
          <label className="block text-[9px] font-bold text-gray-700 uppercase tracking-widest mb-1">
            Node ID
          </label>
          <p className="text-[9px] text-gray-700 font-mono truncate px-0.5">{selectedNode.id}</p>
        </div>
      </div>

      {/* Delete */}
      <div className="px-3.5 pb-3.5 pt-2.5 border-t border-gray-800">
        <button
          onClick={() => deleteNode(selectedNode.id)}
          className="w-full py-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5
            bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 hover:border-red-800/60
            text-red-500 hover:text-red-400 transition-all duration-150"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
          Delete Component
        </button>
      </div>
    </aside>
  );
}
