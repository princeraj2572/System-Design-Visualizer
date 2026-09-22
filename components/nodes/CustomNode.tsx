'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { AlertTriangle } from 'lucide-react';
import type { NodeData } from '@/types';
import { NODE_CONFIG } from './nodeConfig';
import { useCanvasStore } from '@/store/useCanvasStore';
import { SketchyRect } from './SketchyRect';

const NODE_WIDTH = 160;
const NODE_HEIGHT = 116;

function CustomNode({ id, data, selected }: NodeProps<NodeData>) {
  const config = NODE_CONFIG[data.nodeType];
  const { Icon } = config;
  const setSelectedNode = useCanvasStore((s) => s.setSelectedNode);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const snapshot = useCanvasStore((s) => s.snapshot);
  const theme = useCanvasStore((s) => s.theme);
  const issue = useCanvasStore((s) => s.validationIssues.find((i) => i.nodeId === id));
  const isDark = theme === 'dark';
  const handleBorderColor = isDark ? '#27272a' : '#ffffff';

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

  // Hand-drawn border/fill, à la Eraser/Excalidraw: a sketchy stroke in the
  // node's accent color (or the issue/selected color), over a soft pastel
  // tint of that same accent instead of a flat white/gray card background.
  const strokeColor = selected ? config.accent : issue ? (issue.severity === 'error' ? '#ef4444' : '#f59e0b') : (isDark ? '#71717a' : '#334155');
  const fillColor = `${config.accent}${isDark ? '26' : '16'}`;

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${data.name || config.defaultName} (${config.label})`}
      title={data.description || config.description}
      className="relative flex flex-col cursor-pointer select-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-zinc-950 rounded-2xl"
      style={{ width: NODE_WIDTH, height: NODE_HEIGHT }}
    >
      <SketchyRect
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        seed={id}
        stroke={strokeColor}
        strokeWidth={selected ? 2.25 : issue ? 2 : 1.5}
        fill={fillColor}
      />

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
      <div className="relative flex flex-col items-center px-3 pt-3 pb-3 gap-2 h-full justify-center">
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
