/**
 * Performance optimization utilities for canvas rendering
 * Implements debouncing, memoization, and efficient state management
 */

/**
 * Debounce function to delay expensive operations
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle function to limit function call frequency
 * @param fn - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generate grid background SVG for better performance
 * @param gridSize - Size of grid cells
 * @returns SVG data URL
 */
export function generateGridSVG(gridSize: number): string {
  const svg = `<svg width='${gridSize}' height='${gridSize}' xmlns='http://www.w3.org/2000/svg'>
    <defs>
      <pattern id='grid' width='${gridSize}' height='${gridSize}' patternUnits='userSpaceOnUse'>
        <path d='M ${gridSize} 0 L 0 0 0 ${gridSize}' fill='none' stroke='%23cbd5e1' stroke-width='0.5'/>
      </pattern>
    </defs>
    <rect width='100%' height='100%' fill='url(%23grid)' />
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Batch DOM updates to avoid layout thrashing
 * @param updates - Array of update functions
 */
export function batchDOMUpdates(updates: (() => void)[]): void {
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(() => {
      updates.forEach((update) => update());
    });
  } else {
    updates.forEach((update) => update());
  }
}

/**
 * Check if node should be rendered based on viewport
 * @param nodeX - Node X position
 * @param nodeY - Node Y position
 * @param zoom - Current zoom level
 * @param viewportWidth - Viewport width
 * @param viewportHeight - Viewport height
 * @param padding - Extra padding for off-screen nodes
 * @returns True if node should be visible
 */
export function isNodeInViewport(
  nodeX: number,
  nodeY: number,
  zoom: number,
  viewportWidth: number,
  viewportHeight: number,
  padding: number = 200
): boolean {
  const nodeSize = 150; // Approximate node size
  const scaledSize = nodeSize * zoom;
  
  return (
    nodeX + scaledSize + padding > 0 &&
    nodeX - padding < viewportWidth &&
    nodeY + scaledSize + padding > 0 &&
    nodeY - padding < viewportHeight
  );
}

/**
 * Calculate visible nodes for viewport rendering
 * @param nodes - All nodes
 * @param zoom - Current zoom level
 * @param viewportX - Viewport X position
 * @param viewportY - Viewport Y position
 * @param viewportWidth - Viewport width
 * @param viewportHeight - Viewport height
 * @returns Array of visible node IDs
 */
export function getVisibleNodeIds(
  nodes: Array<{ id: string; position: { x: number; y: number } }>,
  zoom: number,
  viewportX: number,
  viewportY: number,
  viewportWidth: number,
  viewportHeight: number
): Set<string> {
  const visibleIds = new Set<string>();
  const nodeSize = 150;
  const scaledSize = nodeSize * zoom;
  const padding = 200;

  nodes.forEach((node) => {
    const nodeScreenX = node.position.x * zoom - viewportX;
    const nodeScreenY = node.position.y * zoom - viewportY;

    if (
      nodeScreenX + scaledSize + padding > 0 &&
      nodeScreenX - padding < viewportWidth &&
      nodeScreenY + scaledSize + padding > 0 &&
      nodeScreenY - padding < viewportHeight
    ) {
      visibleIds.add(node.id);
    }
  });

  return visibleIds;
}

/**
 * Memoize expensive calculations
 */
interface MemoCache<T> {
  value: T;
  key: string;
}

export function createMemo<T>(
  fn: (...args: any[]) => T,
  keyGenerator: (...args: any[]) => string
) {
  let cache: MemoCache<T> | null = null;

  return (...args: any[]): T => {
    const key = keyGenerator(...args);
    if (cache && cache.key === key) {
      return cache.value;
    }
    const value = fn(...args);
    cache = { value, key };
    return value;
  };
}

/**
 * Performance metrics collector
 */
export class PerformanceMetrics {
  private static metrics: Map<string, { start: number; duration: number }> = new Map();

  static start(label: string): void {
    this.metrics.set(label, { start: performance.now(), duration: 0 });
  }

  static end(label: string): number {
    const metric = this.metrics.get(label);
    if (metric) {
      metric.duration = performance.now() - metric.start;
      if (metric.duration > 16) {
        // Longer than one frame
        console.warn(
          `⚠️ Slow operation: ${label} took ${metric.duration.toFixed(2)}ms`
        );
      }
      return metric.duration;
    }
    return 0;
  }

  static getMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      result[key] = value.duration;
    });
    return result;
  }

  static reset(): void {
    this.metrics.clear();
  }
}

/**
 * Worker pool for offloading expensive calculations
 * TODO: Implement actual worker pool for expensive computations
 */
export class ComputeWorker {
  private taskQueue: Array<{
    fn: string;
    args: any[];
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(workerCount: number = 2) {
    // Placeholder for future worker pool implementation
    void workerCount; // Suppress unused parameter warning
  }

  async compute(fn: string, args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      // Queue task for worker processing
      this.taskQueue.push({ fn, args, resolve, reject });
    });
  }
}
