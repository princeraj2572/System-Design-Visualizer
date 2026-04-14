/**
 * Context menu for node operations
 * Appears on right-click on canvas or nodes
 */

'use client';

import React, { useRef, useEffect } from 'react';
import { Copy, Trash2, Edit2, Layers } from 'lucide-react';
import { useArchitectureStore } from '@/store/architecture-store';

interface ContextMenuProps {
  x: number;
  y: number;
  nodeId?: string;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, nodeId, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { selectNode, removeNode, addNode, nodes, selectedNode } = useArchitectureStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleDuplicate = () => {
    if (!nodeId) return;

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Create a new node with offset position
    const newNode = {
      ...node,
      id: `${node.type}-${Date.now()}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
    };

    addNode(newNode);
    selectNode(newNode.id);
    onClose();
  };

  const handleDelete = () => {
    if (!nodeId) return;

    if (window.confirm('Delete this component and its connections?')) {
      removeNode(nodeId);
      onClose();
    }
  };

  const handleEdit = () => {
    if (nodeId) {
      selectNode(nodeId);
    }
    onClose();
  };

  const menuItems = nodeId
    ? [
        {
          label: 'Edit Properties',
          icon: Edit2,
          onClick: handleEdit,
        },
        {
          label: 'Duplicate',
          icon: Copy,
          onClick: handleDuplicate,
          dividerAfter: true,
        },
        {
          label: 'Delete',
          icon: Trash2,
          onClick: handleDelete,
          className: 'text-red-600 hover:bg-red-50',
        },
      ]
    : [
        {
          label: 'Arrange',
          icon: Layers,
          onClick: () => onClose(),
          disabled: true,
        },
      ];

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-lg shadow-xl border border-slate-200 z-50 py-1 min-w-max"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {menuItems.map((item, idx) => (
        <div key={idx}>
          <button
            onClick={() => !item.disabled && item.onClick()}
            disabled={item.disabled}
            className={`w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-100 transition-colors ${
              item.className || ''
            } ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <item.icon size={16} />
            {item.label}
          </button>
          {item.dividerAfter && <div className="h-px bg-slate-200 my-1" />}
        </div>
      ))}
    </div>
  );
};

export default ContextMenu;
