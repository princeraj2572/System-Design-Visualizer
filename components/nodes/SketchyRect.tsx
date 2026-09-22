'use client';

import { useMemo } from 'react';
import rough from 'roughjs';

const generator = rough.generator();

/** Cheap stable string hash — used to seed the sketch so a node's hand-drawn
 * jitter stays the same across re-renders instead of re-randomizing every
 * paint, while still differing from node to node. */
function seedFrom(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

function roundedRectPath(w: number, h: number, r: number): string {
  return `M${r},0 L${w - r},0 A${r},${r} 0 0 1 ${w},${r} L${w},${h - r} A${r},${r} 0 0 1 ${w - r},${h} L${r},${h} A${r},${r} 0 0 1 0,${h - r} L0,${r} A${r},${r} 0 0 1 ${r},0 Z`;
}

interface SketchyRectProps {
  width: number;
  height: number;
  seed: string;
  radius?: number;
  stroke: string;
  strokeWidth?: number;
  fill?: string;
  roughness?: number;
  className?: string;
}

export function SketchyRect({
  width,
  height,
  seed,
  radius = 14,
  stroke,
  strokeWidth = 1.5,
  fill,
  roughness = 1.4,
  className,
}: SketchyRectProps) {
  const paths = useMemo(() => {
    const drawable = generator.path(roundedRectPath(width, height, radius), {
      roughness,
      seed: seedFrom(seed),
      stroke,
      strokeWidth,
      fill,
      fillStyle: 'solid',
      bowing: 1,
    });
    return generator.toPaths(drawable);
  }, [width, height, radius, seed, stroke, strokeWidth, fill, roughness]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
    >
      {paths.map((p, i) => (
        <path key={i} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill={p.fill} fillRule="nonzero"/>
      ))}
    </svg>
  );
}
