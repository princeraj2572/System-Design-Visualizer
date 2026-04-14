'use client';

import React, { useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useArchitectureStore } from '@/store/architecture-store';
import { buildHierarchy, HierarchyNode } from '@/lib/layout-engine';

export const HierarchyPanel: React.FC = () => {
  const { nodes, edges, selectNode, selectedNode } = useArchitectureStore();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const hierarchy = useMemo(() => {
    return buildHierarchy(nodes, edges);
  }, [nodes, edges]);

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const HierarchyTreeItem: React.FC<{ node: HierarchyNode; depth: number }> = ({
    node,
    depth,
  }) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedNode === node.id;

    return (
      <div key={node.id}>
        <div
          onClick={() => {
            selectNode(node.id);
            if (hasChildren) {
              toggleExpanded(node.id);
            }
          }}
          className={`
            flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors
            ${
              isSelected
                ? 'bg-cyan-100 text-cyan-900 font-semibold'
                : 'hover:bg-slate-100 text-slate-700'
            }
          `}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.id);
              }}
              className="p-0 hover:bg-slate-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}

          <span className="text-sm truncate">{node.name}</span>

          {node.outgoingEdges > 0 && (
            <span className="ml-auto text-xs bg-cyan-200 text-cyan-800 px-1.5 py-0.5 rounded-full">
              {node.outgoingEdges}
            </span>
          )}
        </div>

        {isExpanded && hasChildren && (
          <div>
            {node.children.map((child) => (
              <HierarchyTreeItem key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
        <h2 className="text-lg font-bold text-slate-900">Architecture Hierarchy</h2>
        <p className="text-xs text-slate-500 mt-1">
          {nodes.length} components • {edges.length} connections
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {hierarchy.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">No components yet</p>
            <p className="text-xs mt-2">Drag components to the canvas to start</p>
          </div>
        ) : (
          <div className="space-y-1">
            {hierarchy.map((root) => (
              <HierarchyTreeItem key={root.id} node={root} depth={0} />
            ))}
          </div>
        )}
      </div>

      {nodes.length > 0 && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-600">
          <div className="space-y-1">
            <div>
              <span className="font-semibold">Total Nodes:</span> {nodes.length}
            </div>
            <div>
              <span className="font-semibold">Total Edges:</span> {edges.length}
            </div>
            <div>
              <span className="font-semibold">Leaf Nodes:</span>{' '}
              {nodes.filter((n) => !edges.some((e) => e.source === n.id)).length}
            </div>
            <div>
              <span className="font-semibold">Root Nodes:</span>{' '}
              {nodes.filter((n) => !edges.some((e) => e.target === n.id)).length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchyPanel;
