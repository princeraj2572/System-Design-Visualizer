/**
 * Properties panel for editing selected node details
 */

'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useArchitectureStore } from '@/store/architecture-store';
import { NODE_TYPES } from '@/utils/design-system';

export const PropertiesPanel: React.FC = () => {
  const { nodes, selectedNode, updateNode, removeNode } = useArchitectureStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    technology: '',
  });

  const node = nodes.find((n) => n.id === selectedNode);

  useEffect(() => {
    if (node) {
      setFormData({
        name: node.metadata.name,
        description: node.metadata.description || '',
        technology: node.metadata.technology || '',
      });
    } else {
      setFormData({ name: '', description: '', technology: '' });
    }
  }, [node]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (node) {
      updateNode(node.id, {
        metadata: {
          ...node.metadata,
          ...formData,
        },
      });
    }
  };

  const handleDelete = () => {
    if (node && window.confirm('Delete this component?')) {
      removeNode(node.id);
    }
  };

  return (
    <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-slate-200 sticky top-0 bg-white">
        <h2 className="text-lg font-bold text-slate-900">Properties</h2>
      </div>

      {node ? (
        <div className="flex-1 p-4 space-y-4">
          <Card variant="outlined" padding="md">
            <div className="space-y-2">
              <div className="text-2xl text-center">
                {NODE_TYPES[node.type as keyof typeof NODE_TYPES]?.icon || '🔧'}
              </div>
              <div className="text-center text-sm text-slate-600">
                {NODE_TYPES[node.type as keyof typeof NODE_TYPES]?.label}
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Component name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                rows={3}
                placeholder="Component description"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                Technology
              </label>
              <input
                type="text"
                value={formData.technology}
                onChange={(e) => handleChange('technology', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g., PostgreSQL, Redis, Node.js"
              />
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={handleSave}
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              size="md"
              className="w-full border-red-400 text-red-600 hover:bg-red-50"
              onClick={handleDelete}
            >
              Delete Component
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-slate-500">
            <p className="text-sm">Select a component to edit its properties</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPanel;
