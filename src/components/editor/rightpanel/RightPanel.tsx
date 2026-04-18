/**
 * RightPanel - Tabbed panel for node inspection and editing
 */

'use client';
import { useState } from 'react';
import { Node, Edge } from '@xyflow/react';
import { NodeDataExtended, EdgeDataExtended, RightPanelTab } from '@/types/architecture';
import { PropertiesTab } from './tabs/PropertiesTab';
import { ConnectionsTab } from './tabs/ConnectionsTab';
import { DocumentationTab } from './tabs/DocumentationTab';

const TABS: Array<{ id: RightPanelTab; label: string }> = [
  { id: 'properties', label: 'Properties' },
  { id: 'connections', label: 'Connections' },
  { id: 'documentation', label: 'Docs' },
];

interface RightPanelProps {
  selectedNode: Node<NodeDataExtended> | null;
  selectedEdge: Edge<EdgeDataExtended> | null;
  nodes: Node<NodeDataExtended>[];
  edges: Edge<EdgeDataExtended>[];
  onUpdateNode?: (nodeId: string, patch: Partial<NodeDataExtended>) => void;
  onUpdateEdge?: (edgeId: string, patch: Partial<EdgeDataExtended>) => void;
  onDeleteEdge?: (edgeId: string) => void;
  onAddNode?: (componentId: string, position: { x: number; y: number }) => void;
}

export default function RightPanel({
  selectedNode,
  selectedEdge,
  nodes,
  edges,
  onUpdateNode,
  onUpdateEdge,
  onDeleteEdge,
  onAddNode,
}: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<RightPanelTab>('properties');

  return (
    <aside className="w-64 flex flex-col border-l border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-full overflow-hidden flex-shrink-0">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-3 text-xs font-medium transition-colors
              ${
                activeTab === tab.id
                  ? 'text-gray-900 dark:text-gray-100 border-b-2 border-blue-500 bg-white dark:bg-zinc-950'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {!selectedNode && !selectedEdge ? (
          <EmptyState />
        ) : (
          <>
            {activeTab === 'properties' && selectedNode && (
              <PropertiesTab node={selectedNode} onUpdate={onUpdateNode} />
            )}
            {activeTab === 'connections' && selectedNode && (
              <ConnectionsTab
                node={selectedNode}
                nodes={nodes}
                edges={edges}
                onUpdateEdge={onUpdateEdge}
                onDeleteEdge={onDeleteEdge}
                onAddNode={onAddNode}
              />
            )}
            {activeTab === 'documentation' && selectedNode && (
              <DocumentationTab node={selectedNode} onUpdate={onUpdateNode} />
            )}
          </>
        )}
      </div>
    </aside>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-300 dark:text-zinc-700 p-4 text-center">
      <span className="text-3xl">⬡</span>
      <p className="text-xs">Select a component to inspect</p>
    </div>
  );
}
