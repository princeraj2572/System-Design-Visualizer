/**
 * Collision Detection - spec-aligned for @xyflow/react
 * Grid snapping and collision-free node placement
 */

import { Node } from '@xyflow/react';

const GRID_SIZE = 20;
const NODE_DEFAULT_WIDTH = 140;
const NODE_DEFAULT_HEIGHT = 70;
const PADDING = 16; // minimum gap between nodes

/**
 * Snap a value to the nearest grid increment
 */
export function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

/**
 * Check if two rectangles collide
 */
function collidesWithAny(
  pos: { x: number; y: number },
  nodes: Node[]
): boolean {
  return nodes.some(node => {
    const nw = (node.style?.width as number) ?? NODE_DEFAULT_WIDTH;
    const nh = (node.style?.height as number) ?? NODE_DEFAULT_HEIGHT;
    return !(
      pos.x + NODE_DEFAULT_WIDTH + PADDING < node.position.x ||
      pos.x > node.position.x + nw + PADDING ||
      pos.y + NODE_DEFAULT_HEIGHT + PADDING < node.position.y ||
      pos.y > node.position.y + nh + PADDING
    );
  });
}

/**
 * Get next position in spiral search pattern
 */
function nextSpiralPosition(
  current: { x: number; y: number },
  attempt: number
): { x: number; y: number } {
  const step = NODE_DEFAULT_WIDTH + PADDING;
  const directions = [
    { x: step, y: 0 },     // right
    { x: 0, y: step },     // down
    { x: -step, y: 0 },    // left
    { x: 0, y: -step },    // up
  ];
  const dir = directions[attempt % 4];
  return {
    x: snapToGrid(current.x + dir.x),
    y: snapToGrid(current.y + dir.y),
  };
}

/**
 * Find a collision-free position for a dropped node
 * Searches in spiral pattern outward from drop position
 */
export function findFreePosition(
  dropPosition: { x: number; y: number },
  existingNodes: Node[]
): { x: number; y: number } {
  let candidate = {
    x: snapToGrid(dropPosition.x),
    y: snapToGrid(dropPosition.y),
  };

  const MAX_ATTEMPTS = 50;
  let attempt = 0;

  while (attempt < MAX_ATTEMPTS) {
    if (!collidesWithAny(candidate, existingNodes)) {
      return candidate;
    }
    candidate = nextSpiralPosition(candidate, attempt);
    attempt++;
  }

  // Fallback: place at safe offset
  return {
    x: snapToGrid(dropPosition.x + 200),
    y: snapToGrid(dropPosition.y),
  };
}
