'use client';

import React, { useState } from 'react';
import { ChevronRight, Database, Globe, Zap, AlertCircle, ChevronDown } from 'lucide-react';
import { getNodeMetadata } from '@/utils/node-metadata';

interface APIInfoPanelProps {
  selectedNodeId: string | null;
  selectedNodeType?: string;
  selectedNodeName?: string;
  onToggle?: (isOpen: boolean) => void;
}

/**
 * APIInfoPanel - Right sidebar component displaying detailed information about selected node
 * Shows: metadata, connections, API endpoints, database tables, role, and examples
 */
export const APIInfoPanel: React.FC<APIInfoPanelProps> = ({
  selectedNodeId,
  selectedNodeType,
  selectedNodeName,
  onToggle,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    connections: true,
    api: true,
    database: true,
    info: true,
  });

  if (!selectedNodeId || !selectedNodeType) {
    return (
      <div className="absolute right-0 top-0 h-full w-96 bg-white border-l border-slate-200 shadow-lg p-6 overflow-y-auto">
        <div className="text-center text-slate-400 py-12">
          <Database className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm font-medium">Select a component to view details</p>
          <p className="text-xs text-slate-500 mt-2">Click any node to see its API endpoints, database interactions, and connection rules</p>
        </div>
      </div>
    );
  }

  const metadata = getNodeMetadata(selectedNodeType);

  if (!metadata) {
    return null;
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const SectionHeader: React.FC<{ title: string; icon: React.ReactNode; section: string; count?: number }> = ({
    title,
    icon,
    section,
    count,
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-2">
        <div className="text-slate-600">{icon}</div>
        <span className="font-semibold text-sm text-slate-900">{title}</span>
        {count !== undefined && (
          <span className="ml-2 px-2 py-0.5 bg-slate-100 text-xs text-slate-600 rounded-full">{count}</span>
        )}
      </div>
      <ChevronDown
        className={`w-4 h-4 text-slate-600 transition-transform ${
          expandedSections[section] ? 'rotate-180' : ''
        }`}
      />
    </button>
  );

  const Badge: React.FC<{ label: string; variant?: 'default' | 'accent' | 'success' }> = ({
    label,
    variant = 'default',
  }) => {
    const variantClasses = {
      default: 'bg-slate-100 text-slate-700',
      accent: 'bg-cyan-100 text-cyan-700',
      success: 'bg-emerald-100 text-emerald-700',
    };
    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="absolute right-0 top-16 h-[calc(100%-4rem)] w-96 bg-white border-l border-slate-200 shadow-lg overflow-y-auto z-40">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{selectedNodeName || metadata.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{selectedNodeType}</p>
          </div>
          {onToggle && (
            <button
              onClick={() => onToggle(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              title="Close panel"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
        <Badge label={metadata.category} variant="accent" />
      </div>

      <div className="p-4 space-y-4">
        {/* Description */}
        {expandedSections.info && (
          <div>
            <SectionHeader title="Description" icon={<AlertCircle className="w-4 h-4" />} section="info" />
            {expandedSections.info && (
              <div className="px-3 py-2 text-sm text-slate-600 leading-relaxed">
                <p className="mb-2">{metadata.description}</p>
                <div className="bg-slate-50 p-2 rounded border border-slate-200 text-xs">
                  <p className="font-medium text-slate-700 mb-1">Role: </p>
                  <p>{metadata.role}</p>
                </div>
                {metadata.example && (
                  <div className="bg-blue-50 p-2 rounded border border-blue-200 text-xs mt-2">
                    <p className="font-medium text-blue-700 mb-1">Example: </p>
                    <p className="text-blue-600">{metadata.example}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Connections */}
        <div>
          <SectionHeader
            title="Connections"
            icon={<Globe className="w-4 h-4" />}
            section="connections"
            count={metadata.canConnectTo.length}
          />
          {expandedSections.connections && (
            <div className="px-3 py-2 space-y-3">
              {/* Outgoing */}
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Can Connect To:</p>
                {metadata.canConnectTo.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {metadata.canConnectTo.slice(0, 8).map((type) => (
                      <Badge key={`to-${type}`} label={type} variant="default" />
                    ))}
                    {metadata.canConnectTo.length > 8 && (
                      <Badge label={`+${metadata.canConnectTo.length - 8} more`} variant="default" />
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No outgoing connections allowed</p>
                )}
              </div>

              {/* Incoming */}
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Can Receive From:</p>
                {metadata.canBeConnectedFrom.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {metadata.canBeConnectedFrom.slice(0, 8).map((type) => (
                      <Badge key={`from-${type}`} label={type} variant="success" />
                    ))}
                    {metadata.canBeConnectedFrom.length > 8 && (
                      <Badge label={`+${metadata.canBeConnectedFrom.length - 8} more`} variant="success" />
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Cannot receive connections</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* API Endpoints */}
        {metadata.apiEndpoints.length > 0 && (
          <div>
            <SectionHeader
              title="API Endpoints"
              icon={<Zap className="w-4 h-4" />}
              section="api"
              count={metadata.apiEndpoints.length}
            />
            {expandedSections.api && (
              <div className="px-3 py-2 space-y-1">
                {metadata.apiEndpoints.map((endpoint, idx) => (
                  <div key={`api-${idx}`} className="bg-slate-50 p-2 rounded border border-slate-200 text-xs font-mono text-slate-700">
                    {endpoint}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Database Tables */}
        {metadata.dbTables.length > 0 && (
          <div>
            <SectionHeader
              title="Database Tables"
              icon={<Database className="w-4 h-4" />}
              section="database"
              count={metadata.dbTables.length}
            />
            {expandedSections.database && (
              <div className="px-3 py-2 space-y-1">
                {metadata.dbTables.map((table, idx) => (
                  <div key={`db-${idx}`} className="bg-purple-50 p-2 rounded border border-purple-200 text-xs text-purple-700">
                    <span className="font-mono">{table}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category Info */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-3 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-600">
            <span className="font-semibold">Category:</span> {metadata.category}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            <span className="font-semibold">Type:</span> {selectedNodeType}
          </p>
        </div>

        {/* Help Text */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
          <p className="text-xs text-cyan-700">
            <span className="font-semibold">💡 Tip:</span> Drag from handles to create connections. Only allowed connections will be accepted.
          </p>
        </div>
      </div>
    </div>
  );
};

export default APIInfoPanel;
