'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { AlertTriangle } from 'lucide-react';
import type { NodeData } from '@/types';
import { NODE_CONFIG } from './nodeConfig';
import { useCanvasStore } from '@/store/useCanvasStore';

function CustomNode({ id, data, selected }: NodeProps<NodeData>) {
  const config = NODE_CONFIG[data.nodeType];
  const { Icon } = config;
  const setSelectedNode = useCanvasStore((s) => s.setSelectedNode);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const snapshot = useCanvasStore((s) => s.snapshot);
  const theme = useCanvasStore((s) => s.theme);
  const issue = useCanvasStore((s) => s.validationIssues.find((i) => i.nodeId === id));
  const handleBorderColor = theme === 'dark' ? '#27272a' : '#ffffff';

  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(data.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming) { inputRef.current?.focus(); inputRef.current?.select(); }
  }, [isRenaming]);

  const handleClick = useCallback(() => setSelectedNode(id), [id, setSelectedNode]);
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedNode(id);
    }
  }, [id, setSelectedNode]);

  const startRename = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDraftName(data.name);
    setIsRenaming(true);
  }, [data.name]);

  const commitRename = useCallback(() => {
    setIsRenaming(false);
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== data.name) {
      snapshot();
      updateNodeData(id, { name: trimmed });
    }
  }, [draftName, data.name, id, snapshot, updateNodeData]);

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${data.name || config.defaultName} (${config.label})`}
      title={data.description || config.description}
      className="relative flex flex-col w-40 rounded-xl cursor-pointer select-none
        bg-white dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700/70
        shadow-sm hover:shadow-md dark:shadow-black/30
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-zinc-950"
      style={{
        borderColor: selected ? config.accent : issue ? '#f59e0b' : undefined,
        boxShadow: selected
          ? `0 0 0 3px ${config.accent}25, 0 4px 20px rgba(0,0,0,0.15)`
          : issue
          ? '0 0 0 2px rgba(245,158,11,0.3)'
          : undefined,
        transition: 'border-color 0.12s ease, box-shadow 0.12s ease',
      }}
    >
      {/*
        Clipping (rounded corners for the accent strip) lives on this inner
        wrapper, NOT the outer node div — Handles below are positioned half
        outside the node box, and overflow-hidden on their ancestor would
        clip their hit-testable area along with their paint.
      */}
      <div className="flex flex-col overflow-hidden rounded-[11px]">
        {/* Accent top strip */}
        <div className="h-[3px] w-full flex-shrink-0" style={{ backgroundColor: config.accent }}/>

        {/* Validation badge */}
        {issue && (
          <div
            className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center z-10"
            style={{ backgroundColor: issue.severity === 'error' ? '#ef4444' : '#f59e0b' }}
            title={issue.message}
          >
            <AlertTriangle size={10} className="text-white" strokeWidth={2.5}/>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col items-center px-3 pt-3 pb-3 gap-2">
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${config.accent}18` }}
          >
            <Icon size={20} style={{ color: config.accent }} strokeWidth={1.75}/>
          </div>

          {/* Name */}
          {isRenaming ? (
            <input
              ref={inputRef}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onBlur={commitRename}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') { setIsRenaming(false); setDraftName(data.name); }
              }}
              className="w-full text-[11px] font-semibold text-center leading-tight bg-transparent
                text-slate-800 dark:text-zinc-100 border-b border-indigo-400 focus:outline-none"
            />
          ) : (
            <span
              onDoubleClick={startRename}
              className="text-[11px] font-semibold text-center leading-tight w-full truncate px-1
                text-slate-800 dark:text-zinc-100"
            >
              {data.name || config.defaultName}
            </span>
          )}

          {/* Technology badge */}
          {data.technology && (
            <span
              className="text-[9px] font-medium px-2 py-0.5 rounded-full max-w-[92%] truncate"
              style={{
                backgroundColor: `${config.accent}15`,
                color: config.accent,
                border: `1px solid ${config.accent}30`,
              }}
            >
              {data.technology}
            </span>
          )}
        </div>
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !border-2 !-top-[5px]"
        style={{ backgroundColor: config.accent, borderColor: handleBorderColor }}/>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !border-2 !-bottom-[5px]"
        style={{ backgroundColor: config.accent, borderColor: handleBorderColor }}/>
      <Handle type="target" position={Position.Left} id="left" className="!w-2 !h-2 !border-2 !-left-[5px]"
        style={{ backgroundColor: config.accent, borderColor: handleBorderColor }}/>
      <Handle type="source" position={Position.Right} id="right" className="!w-2 !h-2 !border-2 !-right-[5px]"
        style={{ backgroundColor: config.accent, borderColor: handleBorderColor }}/>
    </div>
  );
}

export default memo(CustomNode);
