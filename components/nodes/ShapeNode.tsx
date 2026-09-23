'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NodeProps } from 'reactflow';
import rough from 'roughjs';
import type { ShapeData } from '@/types';
import { useCanvasStore } from '@/store/useCanvasStore';

const generator = rough.generator();

function seedFrom(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

/** Two short angled strokes forming a hand-drawn arrowhead at (x2,y2),
 * pointing away from (x1,y1). */
function arrowHeadLines(x1: number, y1: number, x2: number, y2: number): [number, number, number, number][] {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = 10;
  const spread = 0.5;
  return [
    [x2, y2, x2 - len * Math.cos(angle - spread), y2 - len * Math.sin(angle - spread)],
    [x2, y2, x2 - len * Math.cos(angle + spread), y2 - len * Math.sin(angle + spread)],
  ];
}

function ShapeNode({ id, data, selected }: NodeProps<ShapeData>) {
  const { kind, stroke, fill, width, height, points } = data;
  const updateShapeData = useCanvasStore((s) => s.updateShapeData);
  const setSelectedShape = useCanvasStore((s) => s.setSelectedShape);
  const snapshot = useCanvasStore((s) => s.snapshot);
  const [isEditingText, setIsEditingText] = useState(kind === 'text' && !data.text);
  const [draftText, setDraftText] = useState(data.text ?? '');
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingText) { textRef.current?.focus(); textRef.current?.select(); }
  }, [isEditingText]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedShape(id);
  }, [id, setSelectedShape]);

  const startEditText = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDraftText(data.text ?? '');
    setIsEditingText(true);
  }, [data.text]);

  const commitText = useCallback(() => {
    setIsEditingText(false);
    if (draftText !== data.text) {
      snapshot();
      updateShapeData(id, { text: draftText });
    }
  }, [draftText, data.text, id, snapshot, updateShapeData]);

  const svgPaths = useMemo(() => {
    const seed = seedFrom(id);
    const opts = { roughness: 1.4, seed, stroke, strokeWidth: 1.75, bowing: 1 };

    if (kind === 'rectangle') {
      const r = Math.min(14, width / 4, height / 4);
      const d = `M${r},0 L${width - r},0 A${r},${r} 0 0 1 ${width},${r} L${width},${height - r} A${r},${r} 0 0 1 ${width - r},${height} L${r},${height} A${r},${r} 0 0 1 0,${height - r} L0,${r} A${r},${r} 0 0 1 ${r},0 Z`;
      const drawable = generator.path(d, { ...opts, fill, fillStyle: 'solid' });
      return generator.toPaths(drawable);
    }
    if (kind === 'ellipse') {
      const drawable = generator.ellipse(width / 2, height / 2, width, height, { ...opts, fill, fillStyle: 'solid' });
      return generator.toPaths(drawable);
    }
    if ((kind === 'line' || kind === 'arrow') && points && points.length >= 2) {
      const [p1, p2] = points;
      const linePaths = generator.toPaths(generator.line(p1.x, p1.y, p2.x, p2.y, opts));
      if (kind === 'arrow') {
        const heads = arrowHeadLines(p1.x, p1.y, p2.x, p2.y);
        const headPaths = heads.flatMap(([x1, y1, x2, y2]) =>
          generator.toPaths(generator.line(x1, y1, x2, y2, { ...opts, seed: seed + 1 }))
        );
        return [...linePaths, ...headPaths];
      }
      return linePaths;
    }
    return [];
  }, [kind, width, height, stroke, fill, points, id]);

  const pencilD = useMemo(() => {
    if (kind !== 'pencil' || !points || points.length < 2) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  }, [kind, points]);

  return (
    <div
      onClick={handleClick}
      className="node-appear relative"
      style={{ width, height, cursor: 'move' }}
    >
      {selected && (
        <div
          className="absolute pointer-events-none rounded-sm"
          style={{ inset: -4, border: '1.5px dashed #6366f1' }}
        />
      )}

      {kind !== 'text' && (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
          style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          {kind === 'pencil'
            ? <path d={pencilD} stroke={stroke} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            : svgPaths.map((p, i) => (
                <path key={i} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill={p.fill} fillRule="nonzero"/>
              ))}
        </svg>
      )}

      {kind === 'text' && (
        isEditingText ? (
          <textarea
            ref={textRef}
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={commitText}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Escape') { setIsEditingText(false); setDraftText(data.text ?? ''); }
            }}
            style={{ width, height, color: stroke }}
            className="bg-transparent resize-none outline-none text-[13px] font-medium leading-snug"
          />
        ) : (
          <div
            onDoubleClick={startEditText}
            style={{ width, height, color: stroke }}
            className="text-[13px] font-medium leading-snug whitespace-pre-wrap break-words select-none"
          >
            {data.text || 'Double-click to edit'}
          </div>
        )
      )}
    </div>
  );
}

export default memo(ShapeNode);
