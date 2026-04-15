/**
 * Performance Monitoring Service
 * Tracks and analyzes application performance metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  category: 'rendering' | 'network' | 'memory' | 'interaction';
  threshold?: number;
  warning?: boolean;
}

export interface PerformanceReport {
  timestamp: Date;
  duration: number; // in ms
  metrics: PerformanceMetric[];
  summary: {
    avgRenderTime: number;
    avgNetworkTime: number;
    memoryUsage: number;
    avgInteractionTime: number;
    performanceScore: number; // 0-100
  };
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private marks: Map<string, number> = new Map();
  private performanceThresholds = {
    renderTime: 16.67, // 60 FPS
    networkTime: 200,
    interactionTime: 100,
    memoryUsage: 100 * 1024 * 1024, // 100MB
  };

  /**
   * Mark performance point
   */
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * Measure performance between marks
   */
  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();

    if (!start) {
      console.warn(`Start mark "${startMark}" not found`);
      return 0;
    }

    const duration = (end || performance.now()) - start;

    this.metrics.push({
      name,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      category: this.categorizeMetric(name),
      threshold: this.getThreshold(name),
      warning: duration > (this.getThreshold(name) || Infinity),
    });

    return duration;
  }

  /**
   * Record rendering performance
   */
  recordRenderTime(componentName: string, duration: number): void {
    this.metrics.push({
      name: `render_${componentName}`,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      category: 'rendering',
      threshold: this.performanceThresholds.renderTime,
      warning: duration > this.performanceThresholds.renderTime,
    });
  }

  /**
   * Record network latency
   */
  recordNetworkLatency(endpoint: string, duration: number): void {
    this.metrics.push({
      name: `network_${endpoint}`,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      category: 'network',
      threshold: this.performanceThresholds.networkTime,
      warning: duration > this.performanceThresholds.networkTime,
    });
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage(): void {
    const perfObj = performance as unknown as { memory?: { usedJSHeapSize: number } };
    if (perfObj.memory) {
      const memoryUsageMB = perfObj.memory.usedJSHeapSize / 1024 / 1024;
      this.metrics.push({
        name: 'memory_heap_used',
        value: memoryUsageMB,
        unit: 'MB',
        timestamp: new Date(),
        category: 'memory',
        threshold: 100, // 100MB
        warning: memoryUsageMB > 100,
      });
    }
  }

  /**
   * Record interaction time
   */
  recordInteractionTime(action: string, duration: number): void {
    this.metrics.push({
      name: `interaction_${action}`,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      category: 'interaction',
      threshold: this.performanceThresholds.interactionTime,
      warning: duration > this.performanceThresholds.interactionTime,
    });
  }

  /**
   * Get performance report
   */
  getReport(): PerformanceReport {
    const avgRenderTime = this.getAverageMetricByCategory('rendering');
    const avgNetworkTime = this.getAverageMetricByCategory('network');
    const memoryUsage = this.getLatestMetricByCategory('memory');
    const avgInteractionTime = this.getAverageMetricByCategory('interaction');

    const performanceScore = this.calculatePerformanceScore(
      avgRenderTime,
      avgNetworkTime,
      memoryUsage,
      avgInteractionTime
    );

    return {
      timestamp: new Date(),
      duration: this.calculateTotalDuration(),
      metrics: this.metrics,
      summary: {
        avgRenderTime,
        avgNetworkTime,
        memoryUsage,
        avgInteractionTime,
        performanceScore,
      },
    };
  }

  /**
   * Get average of metric category
   */
  private getAverageMetricByCategory(category: string): number {
    const categoryMetrics = this.metrics.filter((m) => m.category === category);
    if (categoryMetrics.length === 0) return 0;

    const sum = categoryMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / categoryMetrics.length;
  }

  /**
   * Get latest metric by category
   */
  private getLatestMetricByCategory(category: string): number {
    const categoryMetrics = this.metrics.filter((m) => m.category === category);
    if (categoryMetrics.length === 0) return 0;

    return categoryMetrics[categoryMetrics.length - 1].value;
  }

  /**
   * Calculate performance score (0-100)
   */
  private calculatePerformanceScore(
    renderTime: number,
    networkTime: number,
    memoryUsage: number,
    interactionTime: number
  ): number {
    let score = 100;

    // Deduct for slow rendering
    if (renderTime > this.performanceThresholds.renderTime) {
      score -= Math.min(30, (renderTime / this.performanceThresholds.renderTime) * 10);
    }

    // Deduct for slow network
    if (networkTime > this.performanceThresholds.networkTime) {
      score -= Math.min(30, (networkTime / this.performanceThresholds.networkTime) * 10);
    }

    // Deduct for high memory usage
    if (memoryUsage > this.performanceThresholds.memoryUsage / 1024 / 1024) {
      score -= Math.min(20, (memoryUsage / 100) * 5);
    }

    // Deduct for slow interactions
    if (interactionTime > this.performanceThresholds.interactionTime) {
      score -= Math.min(20, (interactionTime / this.performanceThresholds.interactionTime) * 10);
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Calculate total duration
   */
  private calculateTotalDuration(): number {
    if (this.metrics.length === 0) return 0;
    const first = this.metrics[0].timestamp.getTime();
    const last = this.metrics[this.metrics.length - 1].timestamp.getTime();
    return last - first;
  }

  /**
   * Categorize metric
   */
  private categorizeMetric(name: string): 'rendering' | 'network' | 'memory' | 'interaction' {
    if (name.startsWith('render')) return 'rendering';
    if (name.startsWith('network')) return 'network';
    if (name.startsWith('memory')) return 'memory';
    if (name.startsWith('interaction')) return 'interaction';
    return 'interaction';
  }

  /**
   * Get threshold for metric
   */
  private getThreshold(name: string): number | undefined {
    if (name.startsWith('render')) return this.performanceThresholds.renderTime;
    if (name.startsWith('network')) return this.performanceThresholds.networkTime;
    if (name.startsWith('memory')) return this.performanceThresholds.memoryUsage / 1024 / 1024;
    if (name.startsWith('interaction')) return this.performanceThresholds.interactionTime;
    return undefined;
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics = [];
    this.marks.clear();
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics with warnings
   */
  getWarnings(): PerformanceMetric[] {
    return this.metrics.filter((m) => m.warning);
  }

  /**
   * Export metrics as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify(this.getReport(), null, 2);
  }

  /**
   * Export metrics as CSV
   */
  exportAsCSV(): string {
    const headers = ['Name', 'Value', 'Unit', 'Category', 'Threshold', 'Warning', 'Timestamp'];
    const rows = this.metrics.map((m) => [
      m.name,
      m.value.toFixed(2),
      m.unit,
      m.category,
      m.threshold?.toFixed(2) || 'N/A',
      m.warning ? 'Yes' : 'No',
      m.timestamp.toISOString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    return csv;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();
