'use client';

import React, { useState, useMemo } from 'react';
import { X, Grid, List, Search, Download } from 'lucide-react';
import { templateService, ArchitectureTemplate } from '@/lib/template-service';
import { useArchitectureStore } from '@/store/architecture-store';

interface TemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate?: (template: ArchitectureTemplate) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ArchitectureTemplate | null>(null);
  const { load, setProjectName } = useArchitectureStore();

  const allTemplates = templateService.getAllTemplates();
  const categories = templateService.getCategories();

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let result = templateService
      .getAllTemplates()
      .filter((t) => !selectedCategory || t.category === selectedCategory);

    if (searchQuery) {
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [selectedCategory, searchQuery]);

  const handleApplyTemplate = (template: ArchitectureTemplate) => {
    // Load template into store
    load({
      nodes: template.nodes,
      edges: template.edges,
      groups: [],
      selectedNode: null,
      expandedGroups: [],
      history: [],
      historyIndex: -1,
      theme: 'light',
    });

    // Update project name
    setProjectName(`${template.name} (${new Date().toLocaleDateString()})`);

    // Increment popularity
    templateService.incrementPopularity(template.id);

    // Callback if provided
    if (onApplyTemplate) {
      onApplyTemplate(template);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Architecture Templates</h2>
            <p className="text-sm text-slate-500 mt-1">
              Choose from {allTemplates.length} pre-built templates or create your own
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition p-2"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Categories */}
          <div className="w-56 border-r border-slate-200 bg-slate-50 overflow-y-auto p-4 space-y-2">
            <div className="font-semibold text-sm text-slate-700 mb-3 px-2">CATEGORIES</div>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                selectedCategory === null
                  ? 'bg-cyan-100 text-cyan-900 font-semibold'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className="mr-2">📋</span>
              All Templates ({allTemplates.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 ${
                  selectedCategory === cat.name
                    ? 'bg-cyan-100 text-cyan-900 font-semibold'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="flex-1">{cat.name}</span>
                <span className="text-xs bg-slate-200 px-2 py-1 rounded">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search and Controls */}
            <div className="px-8 py-4 border-b border-slate-200 bg-white space-y-3">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search templates by name, description or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition ${
                      viewMode === 'grid'
                        ? 'bg-cyan-100 text-cyan-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Grid view"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition ${
                      viewMode === 'list'
                        ? 'bg-cyan-100 text-cyan-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Templates Grid/List */}
            <div className="flex-1 overflow-y-auto p-8">
              {filteredTemplates.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <div className="text-4xl mb-2">🔍</div>
                    <p className="font-semibold">No templates found</p>
                    <p className="text-sm mt-1">Try adjusting your search criteria</p>
                  </div>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer hover:border-cyan-300"
                    >
                      <div className="mb-3">
                        <div className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
                          {template.category.toUpperCase()}
                        </div>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm mb-1">
                        {template.name}
                      </h3>
                      <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="flex gap-1">
                          {template.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-cyan-50 text-cyan-700 px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {template.tags.length > 2 && (
                            <span className="text-xs text-slate-500">+{template.tags.length - 2}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <span>⭐ {template.popularity}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyTemplate(template);
                        }}
                        className="w-full mt-3 px-3 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-lg hover:bg-cyan-700 transition"
                      >
                        Use Template
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer hover:border-cyan-300 flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-semibold text-slate-900">
                            {template.name}
                          </span>
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                            {template.category}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 truncate">
                          {template.description}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {template.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-cyan-50 text-cyan-700 px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-sm text-slate-500">⭐ {template.popularity}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyTemplate(template);
                          }}
                          className="px-4 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-lg hover:bg-cyan-700 transition flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Use
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Template Preview */}
          {selectedTemplate && (
            <div className="w-80 border-l border-slate-200 bg-slate-50 flex flex-col overflow-hidden">
              <div className="px-4 py-4 border-b border-slate-200 bg-white">
                <h3 className="font-semibold text-slate-900">{selectedTemplate.name}</h3>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">DESCRIPTION</p>
                  <p className="text-sm text-slate-700">{selectedTemplate.description}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">COMPOSITION</p>
                  <div className="space-y-1 text-sm text-slate-700">
                    <p>🔹 {selectedTemplate.nodes.length} Components</p>
                    <p>🔗 {selectedTemplate.edges.length} Connections</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">TAGS</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleApplyTemplate(selectedTemplate)}
                  className="w-full px-4 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition"
                >
                  Use This Template
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateLibrary;
