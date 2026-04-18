/**
 * Properties panel for editing selected node details
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Save, Settings } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useArchitectureStore } from '@/store/architecture-store';
import { getNodeTypeConfig } from '@/types/nodeTypes';
import AdvancedNodeEditor from './AdvancedNodeEditor';

export const PropertiesPanel: React.FC = () => {
  const { nodes, selectedNode, updateNode, removeNode } = useArchitectureStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    technology: '',
    latency: 0,
    throughput: 0,
    replicas: 1,
    region: '',
    tier: 'medium' as const,
    tags: '' as string,
  });

  const node = nodes.find((n) => n.id === selectedNode);

  useEffect(() => {
    if (node) {
      setFormData({
        name: node.metadata.name,
        description: node.metadata.description || '',
        technology: node.metadata.technology || '',
        latency: node.metadata.latency || 0,
        throughput: node.metadata.throughput || 0,
        replicas: node.metadata.replicas || 1,
        region: node.metadata.region || '',
        tier: (node.metadata.tier || 'medium') as any,
        tags: (node.metadata.tags || []).join(', '),
      });
      setErrors({});
    } else {
      setFormData({ 
        name: '', 
        description: '', 
        technology: '',
        latency: 0,
        throughput: 0,
        replicas: 1,
        region: '',
        tier: 'medium',
        tags: '',
      });
    }
  }, [node, selectedNode]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (formData.name.length > 50) {
      newErrors.name = 'Name must be 50 characters or less';
    }
    if (formData.description.length > 200) {
      newErrors.description = 'Description must be 200 characters or less';
    }
    if (formData.technology.length > 30) {
      newErrors.technology = 'Technology must be 30 characters or less';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSave = async () => {
    if (!validate() || !node) return;

    setIsSaving(true);
    try {
      updateNode(node.id, {
        metadata: {
          ...node.metadata,
          name: formData.name.trim(),
          description: formData.description.trim(),
          technology: formData.technology.trim(),
          latency: formData.latency > 0 ? formData.latency : undefined,
          throughput: formData.throughput > 0 ? formData.throughput : undefined,
          replicas: formData.replicas > 0 ? formData.replicas : 1,
          region: formData.region.trim() || undefined,
          tier: formData.tier as any,
          tags: formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0),
        },
      });
    } catch (error) {
      setErrors({ submit: 'Failed to save changes' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (node && window.confirm('Are you sure? This will delete the component and all its connections.')) {
      removeNode(node.id);
    }
  };

  const config = node ? getNodeTypeConfig(node.type) : null;

  return (
    <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
        <h2 className="text-lg font-bold text-slate-900">Properties</h2>
        <p className="text-xs text-slate-500 mt-0.5">{config?.name || 'Select component'}</p>
      </div>

      {node ? (
        <>
          {errors.submit && (
            <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {errors.submit}
            </div>
          )}

          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Component Type Info */}
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-xs font-semibold text-slate-900 mb-2">Component Type</p>
              <p className="text-xs text-slate-600">{config?.description || 'N/A'}</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                Component Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                maxLength={50}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  errors.name ? 'border-red-500 bg-red-50' : 'border-slate-300'
                }`}
                placeholder="Enter component name"
              />
              {errors.name ? (
                <span className="text-xs text-red-600 mt-1 block">{errors.name}</span>
              ) : (
                <span className="text-xs text-slate-500 mt-1 block text-right">
                  {formData.name.length}/50
                </span>
              )}
            </div>

            {/* Technology */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                Technology/Stack
              </label>
              <input
                type="text"
                value={formData.technology}
                onChange={(e) => handleChange('technology', e.target.value)}
                maxLength={30}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  errors.technology ? 'border-red-500 bg-red-50' : 'border-slate-300'
                }`}
                placeholder="e.g., PostgreSQL, Node.js, Redis"
              />
              {errors.technology ? (
                <span className="text-xs text-red-600 mt-1 block">{errors.technology}</span>
              ) : (
                <span className="text-xs text-slate-500 mt-1 block text-right">
                  {formData.technology.length}/30
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                maxLength={200}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none ${
                  errors.description ? 'border-red-500 bg-red-50' : 'border-slate-300'
                }`}
                rows={3}
                placeholder="Enter component description"
              />
              {errors.description ? (
                <span className="text-xs text-red-600 mt-1 block">{errors.description}</span>
              ) : (
                <span className="text-xs text-slate-500 mt-1 block text-right">
                  {formData.description.length}/200
                </span>
              )}
            </div>

            {/* Performance Metrics Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
              <p className="text-xs font-semibold text-blue-900 mb-2">Performance & Deployment</p>
              
              {/* Latency */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Latency (ms)
                </label>
                <input
                  type="number"
                  value={formData.latency}
                  onChange={(e) => handleChange('latency', Number(e.target.value) || 0)}
                  min="0"
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., 100"
                />
              </div>

              {/* Throughput */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Throughput (RPS)
                </label>
                <input
                  type="number"
                  value={formData.throughput}
                  onChange={(e) => handleChange('throughput', Number(e.target.value) || 0)}
                  min="0"
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., 10000"
                />
              </div>

              {/* Replicas */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Replicas/Instances
                </label>
                <input
                  type="number"
                  value={formData.replicas}
                  onChange={(e) => handleChange('replicas', Number(e.target.value) || 1)}
                  min="1"
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="1"
                />
              </div>

              {/* Region */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Region
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => handleChange('region', e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., us-east-1, eu-west-1"
                />
              </div>

              {/* Tier */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Criticality Tier
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) => handleChange('tier', e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., external, paid, vendor"
                />
                <p className="text-xs text-slate-500 mt-1">Separate with commas</p>
              </div>
            </div>

            {/* Metadata */}
            <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
              <p className="font-mono break-all">ID: {node.id}</p>
              <p>Position: ({Math.round(node.position.x)}, {Math.round(node.position.y)})</p>
              <p>Incoming: {node.id} {/* placeholder */}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2 sticky bottom-0">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full"
              size="sm"
            >
              <Save size={16} className="mr-1" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              onClick={() => setShowAdvancedEditor(true)}
              variant="ghost"
              className="w-full"
              size="sm"
            >
              <Settings size={16} className="mr-1" />
              Advanced Properties
            </Button>
            <Button
              onClick={handleDelete}
              variant="ghost"
              className="w-full text-red-600 hover:bg-red-50"
              size="sm"
            >
              <Trash2 size={16} className="mr-1" />
              Delete Component
            </Button>
          </div>

          {/* Advanced Editor Modal */}
          {showAdvancedEditor && node && (
            <AdvancedNodeEditor node={node} onClose={() => setShowAdvancedEditor(false)} />
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-slate-500">
            <p className="text-sm">Select a component to edit its properties</p>
            <p className="text-xs mt-2">Click on any component in the canvas</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPanel;
