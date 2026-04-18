/**
 * Enhanced Toolbar Component
 * Provides UX tools: alignment, auto-layout, multi-select, locking, etc.
 */

'use client';

import React, { useState } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignCenterVertical,
  ArrowUp,
  ArrowDown,
  Layers,
  Lock,
  Unlock,
  Zap,
  Copy,
  Trash2,
  Undo,
  Redo,
  GripVertical,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useArchitectureStore } from '@/store/architecture-store';
import { layoutNodesHierarchical } from '@/lib/layout-engine';

export interface EnhancedToolbarProps {
  onAlignment?: (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'distribute-h' | 'distribute-v') => void;
  onAutoLayout?: () => void;
  onLock?: () => void;
  onUnlock?: () => void;
}

export const EnhancedToolbar: React.FC<EnhancedToolbarProps> = ({
  onAlignment,
  onAutoLayout,
  onLock,
  onUnlock,
}) => {
  const {
    nodes,
    edges,
    selectedNodes,
    deleteSelectedNodes,
    undo,
    redo,
    copyToClipboard,
    updateNode,
  } = useArchitectureStore();

  const [lockedNodes, setLockedNodes] = useState<Set<string>>(new Set());

  // Alignment helpers
  const alignNodes = (direction: 'left' | 'center' | 'right' | 'top' | 'middle'): void => {
    if (selectedNodes.length < 2) return;

    const selectedNodeData = nodes.filter((n) => selectedNodes.includes(n.id));
    const positions = selectedNodeData.map((n) => n.position);

    let newPositions: Array<{ x: number; y: number }> = [];

    switch (direction) {
      case 'left':
        const minX = Math.min(...positions.map((p) => p.x));
        newPositions = positions.map((p) => ({ ...p, x: minX }));
        break;

      case 'center':
        const centerX = positions.reduce((sum, p) => sum + p.x, 0) / positions.length;
        newPositions = positions.map((p) => ({
          ...p,
          x: centerX,
        }));
        break;

      case 'right':
        const maxX = Math.max(...positions.map((p) => p.x));
        newPositions = positions.map((p) => ({ ...p, x: maxX }));
        break;

      case 'top':
        const minY = Math.min(...positions.map((p) => p.y));
        newPositions = positions.map((p) => ({ ...p, y: minY }));
        break;

      case 'middle':
        const centerY = positions.reduce((sum, p) => sum + p.y, 0) / positions.length;
        newPositions = positions.map((p) => ({
          ...p,
          y: centerY,
        }));
        break;
    }

    // Update nodes with new positions
    selectedNodeData.forEach((node, idx) => {
      updateNode(node.id, {
        position: newPositions[idx],
      });
    });

    onAlignment?.(direction);
  };

  // Distribute nodes evenly
  const distributeNodes = (direction: 'horizontal' | 'vertical'): void => {
    if (selectedNodes.length < 3) return;

    const selectedNodeData = nodes.filter((n) => selectedNodes.includes(n.id));
    const positions = selectedNodeData.map((n) => n.position);

    let newPositions: Array<{ x: number; y: number }> = [];

    if (direction === 'horizontal') {
      const sortedByX = positions.sort((a, b) => a.x - b.x);
      const minX = sortedByX[0].x;
      const maxX = sortedByX[sortedByX.length - 1].x;
      const spacing = (maxX - minX) / (positions.length - 1);

      newPositions = sortedByX.map((p, idx) => ({
        ...p,
        x: minX + spacing * idx,
      }));
    } else {
      const sortedByY = positions.sort((a, b) => a.y - b.y);
      const minY = sortedByY[0].y;
      const maxY = sortedByY[sortedByY.length - 1].y;
      const spacing = (maxY - minY) / (positions.length - 1);

      newPositions = sortedByY.map((p, idx) => ({
        ...p,
        y: minY + spacing * idx,
      }));
    }

    // Update nodes
    selectedNodeData.forEach((node, idx) => {
      updateNode(node.id, {
        position: newPositions[idx],
      });
    });
  };

  // Auto-layout using hierarchical layout
  const triggerAutoLayout = (): void => {
    if (nodes.length === 0) return;

    const { nodes: layoutedNodes } = layoutNodesHierarchical(nodes, edges, {
      rankGap: 150,
      nodeSpacing: 200,
      direction: 'TB',
    });

    // Update all nodes with new positions
    layoutedNodes.forEach((node) => {
      updateNode(node.id, {
        position: node.position,
      });
    });

    onAutoLayout?.();
  };

  // Toggle lock on selected nodes
  const toggleLock = (): void => {
    const newLocked = new Set(lockedNodes);
    selectedNodes.forEach((nodeId) => {
      if (newLocked.has(nodeId)) {
        newLocked.delete(nodeId);
      } else {
        newLocked.add(nodeId);
      }
    });
    setLockedNodes(newLocked);

    if (selectedNodes[0] && !newLocked.has(selectedNodes[0])) {
      onUnlock?.();
    } else if (selectedNodes.length > 0) {
      onLock?.();
    }
  };

  const hasSelection = selectedNodes.length > 0;

  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-white border-b border-slate-200 overflow-x-auto">
      {/* Alignment Tools */}
      <div className="flex items-center gap-1 border-r border-slate-300 pr-3 mr-3">
        <span className="text-xs font-semibold text-slate-600">Align:</span>
        
        <Button
          size="sm"
          variant="ghost"
          disabled={selectedNodes.length < 2}
          onClick={() => alignNodes('left')}
          title="Align left"
          className="p-1"
        >
          <AlignLeft size={16} />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          disabled={selectedNodes.length < 2}
          onClick={() => alignNodes('center')}
          title="Align center"
          className="p-1"
        >
          <AlignCenter size={16} />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          disabled={selectedNodes.length < 2}
          onClick={() => alignNodes('right')}
          title="Align right"
          className="p-1"
        >
          <AlignRight size={16} />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          disabled={selectedNodes.length < 2}
          onClick={() => alignNodes('top')}
          title="Align top"
          className="p-1"
        >
          <ArrowUp size={16} />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          disabled={selectedNodes.length < 2}
          onClick={() => alignNodes('middle')}
          title="Align middle"
          className="p-1"
        >
          <AlignCenterVertical size={16} />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          disabled={selectedNodes.length < 3}
          onClick={() => distributeNodes('horizontal')}
          title="Distribute horizontally"
          className="p-1"
        >
          <Layers size={16} className="rotate-90" />
        </Button>
      </div>

      {/* Layout Tools */}
      <div className="flex items-center gap-1 border-r border-slate-300 pr-3 mr-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={triggerAutoLayout}
          disabled={nodes.length === 0}
          title="Auto-layout (Hierarchical)"
          className="p-1"
        >
          <Zap size={16} className="text-green-600" />
        </Button>
      </div>

      {/* Lock Tools */}
      <div className="flex items-center gap-1 border-r border-slate-300 pr-3 mr-3">
        <Button
          size="sm"
          variant="ghost"
          disabled={!hasSelection}
          onClick={toggleLock}
          title={lockedNodes.has(selectedNodes[0]) ? 'Unlock' : 'Lock'}
          className="p-1"
        >
          {lockedNodes.has(selectedNodes[0]) ? (
            <Lock size={16} className="text-red-600" />
          ) : (
            <Unlock size={16} />
          )}
        </Button>
      </div>

      {/* Edit Tools */}
      <div className="flex items-center gap-1 border-r border-slate-300 pr-3 mr-3">
        <Button
          size="sm"
          variant="ghost"
          disabled={!hasSelection}
          onClick={copyToClipboard}
          title="Copy (Ctrl+C)"
          className="p-1"
        >
          <Copy size={16} />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          disabled={!hasSelection}
          onClick={deleteSelectedNodes}
          title="Delete (Del)"
          className="p-1"
        >
          <Trash2 size={16} className="text-red-600" />
        </Button>
      </div>

      {/* History Tools */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={undo}
          title="Undo (Ctrl+Z)"
          className="p-1"
        >
          <Undo size={16} />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={redo}
          title="Redo (Ctrl+Y)"
          className="p-1"
        >
          <Redo size={16} />
        </Button>
      </div>
    </div>
  );
};

export default EnhancedToolbar;
