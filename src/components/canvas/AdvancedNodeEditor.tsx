import { useState } from 'react';
import { NodeData } from '@/types/architecture';
import { NodeTypeMetadata, getNodeTypeConfig } from '@/types/nodeTypes';
import { useArchitectureStore } from '@/store/architecture-store';
import Button from '@/components/ui/Button';
import { X, ChevronDown } from 'lucide-react';

interface AdvancedNodeEditorProps {
  node: NodeData;
  onClose: () => void;
}

export function AdvancedNodeEditor({ node, onClose }: AdvancedNodeEditorProps) {
  const [metadata, setMetadata] = useState<NodeTypeMetadata>(
    node.metadata as unknown as NodeTypeMetadata
  );
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    typeSpecific: true,
    advanced: false,
  });

  const updateNode = useArchitectureStore((state) => state.updateNode);
  const nodeTypeConfig = getNodeTypeConfig(node.type);

  const handleSave = () => {
    updateNode(node.id, {
      metadata: {
        name: metadata.name,
        description: metadata.description,
        technology: metadata.technology,
        config: {
          ...metadata,
          // Filter out base properties to keep config clean
          name: undefined,
          description: undefined,
          technology: undefined,
        },
      },
    });
    onClose();
  };

  const handleFieldChange = (
    field: keyof NodeTypeMetadata,
    value: unknown
  ) => {
    setMetadata((prev: NodeTypeMetadata) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev: typeof expandedSections) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
              style={{ backgroundColor: nodeTypeConfig.color }}
            >
              📦
            </div>
            <div>
              <h2 className="text-xl font-bold">{metadata.name}</h2>
              <p className="text-sm text-slate-300">{nodeTypeConfig.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('basic')}
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between font-semibold text-slate-900"
            >
              <span>Basic Information</span>
              <ChevronDown
                size={18}
                className={`transition-transform ${expandedSections.basic ? 'rotate-180' : ''}`}
              />
            </button>

            {expandedSections.basic && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={metadata.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Component name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={metadata.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    placeholder="Component description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Technology/Stack
                  </label>
                  <input
                    type="text"
                    value={metadata.technology}
                    onChange={(e) => handleFieldChange('technology', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Node.js, PostgreSQL, React"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Type-Specific Properties */}
          {Object.keys(nodeTypeConfig.propertiesSchema).length > 0 && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('typeSpecific')}
                className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between font-semibold text-slate-900"
              >
                <span>{nodeTypeConfig.name} Properties</span>
                <ChevronDown
                  size={18}
                  className={`transition-transform ${expandedSections.typeSpecific ? 'rotate-180' : ''}`}
                />
              </button>

              {expandedSections.typeSpecific && (
                <div className="p-4 space-y-4">
                  {Object.values(nodeTypeConfig.propertiesSchema).map((field) => (
                    <PropertyInput
                      key={field.name}
                      field={field}
                      value={(metadata as any)[field.name]}
                      onChange={(value) => handleFieldChange(field.name as any, value)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags & Tier */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('advanced')}
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between font-semibold text-slate-900"
            >
              <span>Advanced</span>
              <ChevronDown
                size={18}
                className={`transition-transform ${expandedSections.advanced ? 'rotate-180' : ''}`}
              />
            </button>

            {expandedSections.advanced && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tier / Criticality
                  </label>
                  <select
                    value={metadata.tier || ''}
                    onChange={(e) => handleFieldChange('tier', e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Not Set</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={(metadata.tags || []).join(', ')}
                    onChange={(e) =>
                      handleFieldChange(
                        'tags',
                        e.target.value.split(',').map((s) => s.trim())
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., external, paid, vendor"
                  />
                  <p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4 flex gap-3 justify-end">
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Property input component for handling different field types
 */
interface PropertyInputProps {
  field: any;
  value: unknown;
  onChange: (value: unknown) => void;
}

function PropertyInput({ field, value, onChange }: PropertyInputProps) {
  switch (field.type) {
    case 'text':
      return (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {field.description && (
            <p className="text-xs text-slate-500 mt-1">{field.description}</p>
          )}
        </div>
      );

    case 'textarea':
      return (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {field.label}
          </label>
          <textarea
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
        </div>
      );

    case 'number':
      return (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {field.label}
          </label>
          <input
            type="number"
            value={(value as number) || ''}
            onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : '')}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      );

    case 'boolean':
      return (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(value as boolean) || false}
            onChange={(e) => onChange(e.target.checked)}
            className="w-5 h-5 bg-white border border-slate-300 rounded cursor-pointer focus:ring-2 focus:ring-blue-500"
          />
          <label className="text-sm font-medium text-slate-700">{field.label}</label>
        </div>
      );

    case 'select':
      return (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {field.label}
          </label>
          <select
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an option</option>
            {field.options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    case 'multiselect':
      return (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {field.label}
          </label>
          <select
            multiple
            value={(value as string[]) || []}
            onChange={(e) =>
              onChange(Array.from(e.target.selectedOptions, (opt) => opt.value))
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {field.options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">Hold Ctrl to select multiple</p>
        </div>
      );

    default:
      return null;
  }
}

export default AdvancedNodeEditor;
