'use client';

import React, { useState } from 'react';
import { useArchitectureStore } from '@/store/architecture-store';
import { ChevronDown, ChevronRight, Folder, Copy, Trash2 } from 'lucide-react';
import { NodeData, NodeGroup } from '@/types/architecture';
import Button from '@/components/ui/Button';

/**
 * HierarchyPanel - Display and manage node hierarchy with groups
 */
export const HierarchyPanel: React.FC = () => {
  const {
    nodes,
    groups,
    expandedGroups,
    selectedNodes,
    toggleGroupExpanded,
    selectNode,
    toggleSelection,
    deleteSelectedNodes,
    duplicateSelectedNodes,
    deleteGroup,
    moveNodeToGroup,
  } = useArchitectureStore();

  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);

  // Get top-level nodes that don't belong to any group
  const getTopLevelNodes = (): NodeData[] => {
    return nodes.filter(n => !n.parentId);
  };

  // Get child nodes of a group
  const getGroupChildren = (groupId: string): NodeData[] => {
    return nodes.filter(n => n.parentId === groupId);
  };

  // Get top-level groups that don't have a parent
  const getTopLevelGroups = (): NodeGroup[] => {
    return groups.filter(g => !g.parentId);
  };

  // Handle node selection with Ctrl/Cmd for multi-select
  const handleNodeSelect = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      toggleSelection(nodeId);
    } else {
      selectNode(nodeId);
    }
  };

  // Handle drag start
  const handleDragStart = (nodeId: string, e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedNodeId(nodeId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over group
  const handleDragOver = (groupId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverGroupId(groupId);
  };

  // Handle drop into group
  const handleDrop = (groupId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedNodeId) {
      moveNodeToGroup(draggedNodeId, groupId);
      setDraggedNodeId(null);
      setDragOverGroupId(null);
    }
  };

  // Handle drop outside groups (remove from group)
  const handleDropOutside = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedNodeId) {
      moveNodeToGroup(draggedNodeId, null);
      setDraggedNodeId(null);
    }
  };

  const renderGroupItem = (group: NodeGroup, depth: number = 0) => {
    const isExpanded = expandedGroups.includes(group.id);
    const children = getGroupChildren(group.id);
    const isHovering = dragOverGroupId === group.id;

    return (
      <div key={group.id} style={{ marginLeft: `${depth * 16}px` }}>
        <div
          className={`
            flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700
            ${isHovering ? 'bg-blue-100 dark:bg-blue-900' : ''}
          `}
          onDragOver={(e) => handleDragOver(group.id, e)}
          onDrop={(e) => handleDrop(group.id, e)}
        >
          <button
            onClick={() => toggleGroupExpanded(group.id)}
            className="p-0 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
          >
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>

          <Folder size={16} className="text-yellow-600" />
          <span className="text-sm font-medium flex-1">{group.name}</span>

          <button
            onClick={() => deleteGroup(group.id)}
            className="p-0.5 hover:bg-red-200 dark:hover:bg-red-900 rounded text-red-600"
            title="Delete group"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Child items */}
        {isExpanded && (
          <div>
            {/* Child nodes */}
            {children.map(node => renderNodeItem(node, depth + 1))}

            {/* Child groups (nested hierarchies) */}
            {groups
              .filter(g => g.parentId === group.id)
              .map(childGroup => renderGroupItem(childGroup, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderNodeItem = (node: NodeData, depth: number = 0) => {
    const isSelected = selectedNodes.includes(node.id);

    return (
      <div
        key={node.id}
        draggable
        onDragStart={(e) => handleDragStart(node.id, e)}
        style={{ marginLeft: `${depth * 16}px` }}
        className={`
          flex items-center gap-2 px-2 py-1 rounded cursor-move
          ${isSelected ? 'bg-blue-200 dark:bg-blue-900' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}
        `}
        onClick={(e) => handleNodeSelect(node.id, e)}
      >
        <div className="w-4" /> {/* Placeholder for expand icon */}
        <div
          className="w-3 h-3 rounded border border-gray-400"
          style={{ backgroundColor: getNodeColor(node.type) }}
        />
        <span className="text-sm flex-1 truncate">
          {node.metadata.name || `Untitled (${node.type})`}
        </span>
      </div>
    );
  };

  // Get color for node type (simplified version)
  const getNodeColor = (nodeType: string): string => {
    const colors: Record<string, string> = {
      'api-gateway': '#3B82F6',
      'rest-api': '#3B82F6',
      'database': '#EF4444',
      'cache': '#8B5CF6',
      'message-queue': '#EC4899',
      'load-balancer': '#14B8A6',
      'service': '#10B981',
      'worker': '#F59E0B',
    };
    return colors[nodeType] || '#6B7280';
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-sm">Hierarchy</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={duplicateSelectedNodes}
            disabled={selectedNodes.length === 0}
            title="Duplicate selected"
          >
            <Copy size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={deleteSelectedNodes}
            disabled={selectedNodes.length === 0}
            className="text-red-600 hover:text-red-700"
            title="Delete selected"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto p-2"
        onDragLeave={() => setDragOverGroupId(null)}
        onDragOver={handleDropOutside}
        onDrop={handleDropOutside}
      >
        {/* Top-level groups */}
        {getTopLevelGroups().map(group => renderGroupItem(group))}

        {/* Top-level nodes */}
        {getTopLevelNodes().map(node => renderNodeItem(node))}

        {/* Empty state */}
        {getTopLevelGroups().length === 0 && getTopLevelNodes().length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No nodes or groups yet</p>
            <p className="text-xs">Add nodes to the canvas to see them here</p>
          </div>
        )}
      </div>

      {/* Stats footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-2 text-xs text-gray-600 dark:text-gray-400">
        <div>Nodes: {nodes.length}</div>
        <div>Groups: {groups.length}</div>
      </div>
    </div>
  );
};

export default HierarchyPanel;
