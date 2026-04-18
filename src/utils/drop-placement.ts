/**
 * Drop Placement Utilities
 * Handles grid snapping and collision detection for dropped nodes
 */

import { NodeData } from '@/types/architecture';

export interface PlacementOptions {
  gridSize?: number;
  nodeWidth?: number;
  nodeHeight?: number;
  maxAttempts?: number;
  padding?: number; // Extra space between nodes
}

const DEFAULT_OPTIONS: Required<PlacementOptions> = {
  gridSize: 20,
  nodeWidth: 140,
  nodeHeight: 100,
  maxAttempts: 20,
  padding: 10,
};

/**
 * Snap position to grid
 */
export function snapToGrid(
  x: number,
  y: number,
  gridSize: number = DEFAULT_OPTIONS.gridSize
): { x: number; y: number } {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  };
}

/**
 * Check if a position collides with any existing nodes
 */
export function checkCollision(
  position: { x: number; y: number },
  existingNodes: NodeData[],
  nodeWidth: number,
  nodeHeight: number,
  padding: number
): boolean {
  const testRect = {
    left: position.x - padding,
    right: position.x + nodeWidth + padding,
    top: position.y - padding,
    bottom: position.y + nodeHeight + padding,
  };

  return existingNodes.some((node) => {
    const nodeRect = {
      left: node.position.x - padding,
      right: node.position.x + nodeWidth + padding,
      top: node.position.y - padding,
      bottom: node.position.y + nodeHeight + padding,
    };

    // Check for rectangle overlap using AABB (Axis-Aligned Bounding Box)
    return !(
      testRect.right < nodeRect.left ||
      testRect.left > nodeRect.right ||
      testRect.bottom < nodeRect.top ||
      testRect.top > nodeRect.bottom
    );
  });
}

/**
 * Find a collision-free position for a new node
 * Uses spiral search pattern to find nearest available spot
 */
export function findAvailablePosition(
  initialPosition: { x: number; y: number },
  existingNodes: NodeData[],
  options: PlacementOptions = {}
): { x: number; y: number } {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Snap initial position to grid
  let position = snapToGrid(initialPosition.x, initialPosition.y, opts.gridSize);

  // If no collision, return snapped position
  if (!checkCollision(position, existingNodes, opts.nodeWidth, opts.nodeHeight, opts.padding)) {
    return position;
  }

  // Spiral search: try positions in expanding spiral pattern
  const searchRadius = opts.gridSize * 2;
  for (let attempt = 1; attempt < opts.maxAttempts; attempt++) {
    const angle = (attempt * Math.PI) / 4; // 45-degree increments
    const distance = searchRadius * Math.sqrt(attempt);

    const testX = initialPosition.x + Math.cos(angle) * distance;
    const testY = initialPosition.y + Math.sin(angle) * distance;
    const testPos = snapToGrid(testX, testY, opts.gridSize);

    if (!checkCollision(testPos, existingNodes, opts.nodeWidth, opts.nodeHeight, opts.padding)) {
      return testPos;
    }
  }

  // Fallback: grid-based search if spiral fails
  // Move down and to the right in grid steps
  for (let gridY = 0; gridY < 10; gridY++) {
    for (let gridX = 0; gridX < 10; gridX++) {
      const testPos = {
        x: initialPosition.x + gridX * (opts.nodeWidth + opts.gridSize),
        y: initialPosition.y + gridY * (opts.nodeHeight + opts.gridSize),
      };

      if (!checkCollision(testPos, existingNodes, opts.nodeWidth, opts.nodeHeight, opts.padding)) {
        return testPos;
      }
    }
  }

  // Last resort: just place it with offset below the last collision
  return {
    x: position.x,
    y: position.y + opts.nodeHeight + opts.gridSize,
  };
}

/**
 * Batch place multiple nodes with collision avoidance
 */
export function batchPlace(
  initialPositions: Array<{ x: number; y: number }>,
  existingNodes: NodeData[],
  options: PlacementOptions = {}
): Array<{ x: number; y: number }> {
  let workingNodes = [...existingNodes];
  const results: Array<{ x: number; y: number }> = [];

  for (const pos of initialPositions) {
    const availablePos = findAvailablePosition(pos, workingNodes, options);

    // Add to working set for next iteration
    workingNodes.push({
      id: `temp-${Date.now()}-${results.length}`,
      type: 'temp',
      position: availablePos,
      metadata: { name: '', description: '', technology: '' },
    });

    results.push(availablePos);
  }

  return results;
}
