'use client';

import { useEffect, useState } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { NODE_CONFIG } from '@/components/nodes/nodeConfig';
import type { NodeData } from '@/types';

type FormField = 'name' | 'technology' | 'description' | 'config';

const FIELDS: { field: FormField; label: string; multiline: boolean; placeholder: (c: { defaultName: string; defaultTechnology: string }) => string }[] = [
  { field: 'name', label: 'Name', multiline: false, placeholder: (c) => c.defaultName },
  { field: 'technology', label: 'Technology', multiline: false, placeholder: (c) => c.defaultTechnology },
  { field: 'description', label: 'Description', multiline: true, placeholder: () => 'What does this component do?' },
  { field: 'config', label: 'Config', multiline: true, placeholder: () => 'hostname, port, replicas, region...' },
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
      <aside className="w-60 flex-shrink-0 bg-gray-900 border-l border-gray-700/50 flex flex-col items-center justify-center gap-2">
        <span className="text-3xl opacity-20">📋</span>
        <p className="text-[11px] text-gray-600 text-center px-4 leading-relaxed">
          Select a component to view and edit its properties
        </p>
      </aside>
    );
  }

  const config = NODE_CONFIG[selectedNode.data.nodeType];

  const handleChange = (field: FormField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    updateNodeData(selectedNode.id, { [field]: value });
  };

  return (
    <aside className="w-60 flex-shrink-0 bg-gray-900 border-l border-gray-700/50 flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="px-3 py-3 border-b border-gray-700/50 flex items-center gap-2.5"
        style={{ borderLeftWidth: 3, borderLeftColor: config.accent }}
      >
        <span className="text-xl">{config.icon}</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            {form.name || config.defaultName}
          </p>
          <p className="text-[10px] text-gray-500">{config.label}</p>
        </div>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {FIELDS.map(({ field, label, multiline, placeholder }) => (
          <div key={field}>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">
              {label}
            </label>
            {multiline ? (
              <textarea
                value={(form[field] as string) ?? ''}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={placeholder(config)}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700/60 rounded-lg px-2.5 py-1.5
                  text-xs text-gray-200 placeholder-gray-700 resize-none
                  focus:outline-none focus:border-gray-500 transition-colors"
              />
            ) : (
              <input
                type="text"
                value={(form[field] as string) ?? ''}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={placeholder(config)}
                className="w-full bg-gray-800 border border-gray-700/60 rounded-lg px-2.5 py-1.5
                  text-xs text-gray-200 placeholder-gray-700
                  focus:outline-none focus:border-gray-500 transition-colors"
              />
            )}
          </div>
        ))}

        {/* Node ID (read-only) */}
        <div>
          <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-1">
            Node ID
          </label>
          <p className="text-[9px] text-gray-700 font-mono truncate">{selectedNode.id}</p>
        </div>
      </div>

      {/* Delete */}
      <div className="p-3 border-t border-gray-700/50">
        <button
          onClick={() => deleteNode(selectedNode.id)}
          className="w-full py-1.5 rounded-lg text-xs font-medium
            bg-red-950/40 hover:bg-red-900/40 border border-red-900/50 hover:border-red-700/60
            text-red-400 hover:text-red-300 transition-all duration-150"
        >
          Delete Component
        </button>
      </div>
    </aside>
  );
}
