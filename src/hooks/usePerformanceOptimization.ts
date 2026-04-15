/**
 * Performance Optimization Hook
 * Implements viewport culling and virtual rendering for large architectures
 * 
 * Features:
 * - Culls nodes/edges outside viewport
 * - Memoizes visible nodes/edges to prevent re-renders
 * - Tracks render time and node count
 * - Provides performance metrics
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { Node, Edge } from 'reactflow';

export interface PerformanceMetrics {
  totalNodes: number;
  visibleNodes: number;
  totalEdges: number;
  visibleEdges: number;
  culledPercentage: number;
  lastRenderTime: number;
  averageRenderTime: number;
}

interface ViewportBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  padding: number; // Extra padding to render nodes slightly outside viewport
}

/**
 * Hook for viewport culling and performance optimization
 */
export function useViewportCulling(
  allNodes: Node[],
  allEdges: Edge[],
  viewportBounds: ViewportBounds,
  enabled: boolean = true
) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalNodes: allNodes.length,
    visibleNodes: 0,
    totalEdges: allEdges.length,
    visibleEdges: 0,
    culledPercentage: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
  });

  const renderTimesRef = useRef<number[]>([]);
  const visibleNodeIdsRef = useRef<Set<string>>(new Set());

  // Calculate which nodes are in viewport
  const visibleNodes = useMemo(() => {
    const startTime = performance.now();

    if (!enabled || allNodes.length === 0) {
      return allNodes;
    }

    const { x, y, width, height, padding } = viewportBounds;
    const culledNodes = allNodes.filter((node) => {
      const nodeX = node.position.x;
      const nodeY = node.position.y;
      const nodeWidth = node.width || 200;
      const nodeHeight = node.height || 120;

      // Check if node is within viewport bounds + padding
      return (
        nodeX + nodeWidth + padding >= x &&
        nodeX - padding <= x + width &&
        nodeY + nodeHeight + padding >= y &&
        nodeY - padding <= y + height
      );
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Track render times (keep last 30)
    renderTimesRef.current.push(renderTime);
    if (renderTimesRef.current.length > 30) {
      renderTimesRef.current.shift();
    }

    // Update visible node IDs for edge filtering
    visibleNodeIdsRef.current = new Set(culledNodes.map((n) => n.id));

    // Update metrics
    const averageRenderTime =
      renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length;
    const culledPercentage =
      allNodes.length > 0 ? Math.round(((allNodes.length - culledNodes.length) / allNodes.length) * 100) : 0;

    setMetrics({
      totalNodes: allNodes.length,
      visibleNodes: culledNodes.length,
      totalEdges: allEdges.length,
      visibleEdges: 0, // Will be updated when filtering edges
      culledPercentage,
      lastRenderTime: renderTime,
      averageRenderTime,
    });

    return culledNodes;
  }, [allNodes, viewportBounds, enabled]);

  // Calculate which edges to render (only edges between visible nodes)
  const visibleEdges = useMemo(() => {
    if (!enabled || allEdges.length === 0) {
      return allEdges;
    }

    const culledEdges = allEdges.filter(
      (edge) => visibleNodeIdsRef.current.has(edge.source) && visibleNodeIdsRef.current.has(edge.target)
    );

    // Update metrics with visible edges count
    setMetrics((prev) => ({
      ...prev,
      visibleEdges: culledEdges.length,
    }));

    return culledEdges;
  }, [allEdges, enabled]);

  // Calculate edge culling percentage
  const edgeCullingPercentage = useMemo(() => {
    return allEdges.length > 0 ? Math.round(((allEdges.length - metrics.visibleEdges) / allEdges.length) * 100) : 0;
  }, [allEdges.length, metrics.visibleEdges]);

  return {
    visibleNodes,
    visibleEdges,
    metrics: {
      ...metrics,
      edgeCullingPercentage,
    },
    shouldRender: enabled,
  };
}

/**
 * Hook to track viewport position and size for culling
 */
export function useViewportBounds(
  zoom: number,
  panX: number,
  panY: number,
  windowWidth: number,
  windowHeight: number,
  padding: number = 100
) {
  return useMemo(
    () => ({
      x: -panX / zoom,
      y: -panY / zoom,
      width: windowWidth / zoom,
      height: windowHeight / zoom,
      padding: padding / zoom,
    }),
    [zoom, panX, panY, windowWidth, windowHeight, padding]
  );
}

/**
 * Simple performance monitor hook
 */
export function usePerformanceMonitor(enabled: boolean = true) {
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;

      if (delta >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / delta);
        setFps(currentFps);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
    }, 100);

    // Count frames using requestAnimationFrame
    const countFrames = () => {
      frameCountRef.current++;
      requestAnimationFrame(countFrames);
    };
    countFrames();

    return () => {
      clearInterval(interval);
    };
  }, [enabled]);

  return { fps };
}
