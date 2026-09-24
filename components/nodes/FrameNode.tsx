'use client';

import { memo, useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { NodeResizer, type NodeProps } from 'reactflow';
import type { FrameData } from '@/types';
import { useCanvasStore } from '@/store/useCanvasStore';

export const FRAME_MIN_WIDTH = 160;
export const FRAME_MIN_HEIGHT = 120;
export const FRAME_COLOR_PRESETS = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#0ea5e9', '#a855f7'];

function FrameNode({ id, data, selected }: NodeProps<FrameData>) {
  const { title, color, width, height } = data;
  const updateFrameData = useCanvasStore((s) => s.updateFrameData);
  const setSelectedFrame = useCanvasStore((s) => s.setSelectedFrame);
  const snapshot = useCanvasStore((s) => s.snapshot);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleClick = useCallback((e: ReactMouseEvent) => {
    e.stopPropagation();
    setSelectedFrame(id);
  }, [id, setSelectedFrame]);

  const startEditTitle = useCallback((e: ReactMouseEvent) => {
    e.stopPropagation();
    setDraftTitle(title);
    setIsEditingTitle(true);
  }, [title]);

  const commitTitle = useCallback(() => {
    setIsEditingTitle(false);
    if (draftTitle !== title) {
      snapshot();
      updateFrameData(id, { title: draftTitle });
    }
  }, [draftTitle, title, id, snapshot, updateFrameData]);

  const pickColor = useCallback((next: string, e: ReactMouseEvent) => {
    e.stopPropagation();
    if (next === color) return;
    snapshot();
    updateFrameData(id, { color: next });
  }, [color, id, snapshot, updateFrameData]);

  return (
    <div onClick={handleClick} className="relative" style={{ width, height }}>
      <NodeResizer
        color={color}
        isVisible={selected}
        minWidth={FRAME_MIN_WIDTH}
        minHeight={FRAME_MIN_HEIGHT}
        onResizeEnd={(_, params) => {
          snapshot();
          updateFrameData(id, { width: params.width, height: params.height });
        }}
      />

      <div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{ border: `1.5px dashed ${color}`, background: `${color}14` }}
      />

      <div className="absolute -top-7 left-0 flex items-center gap-2">
        {isEditingTitle ? (
          <input
            ref={inputRef}
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') commitTitle();
              if (e.key === 'Escape') { setIsEditingTitle(false); setDraftTitle(title); }
            }}
            style={{ color, width: 140 }}
            className="bg-transparent outline-none border-b border-current text-[11px] font-semibold"
          />
        ) : (
          <span
            onDoubleClick={startEditTitle}
            style={{ color }}
            className="text-[11px] font-semibold select-none cursor-text"
          >
            {title || 'Untitled Frame'}
          </span>
        )}

        {selected && !isEditingTitle && (
          <div className="flex items-center gap-1">
            {FRAME_COLOR_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={(e) => pickColor(preset, e)}
                title={preset}
                className="w-3 h-3 rounded-full border border-white/40"
                style={{ background: preset, outline: preset === color ? '1.5px solid currentColor' : undefined }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(FrameNode);
