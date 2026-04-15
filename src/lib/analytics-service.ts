import { NodeData, Edge } from '@/types/architecture'

export interface ArchitectureMetrics {
  nodeCount: number
  edgeCount: number
  averageConnectivity: number
  maxConnectivity: number
  minConnectivity: number
  cyclomaticComplexity: number
  avgPathLength: number
  graphDensity: number
  componentClusters: number
}

export interface NodeMetrics {
  id: string
  label: string
  inDegree: number
  outDegree: number
  betweennessCentrality: number
  importance: 'critical' | 'high' | 'medium' | 'low'
}

export interface TrendData {
  timestamp: Date
  nodeCount: number
  edgeCount: number
  complexity: number
  healthScore: number
}

export interface AnalyticsReport {
  projectId: string
  generatedAt: Date
  metrics: ArchitectureMetrics
  nodeMetrics: NodeMetrics[]
  trends: TrendData[]
  recommendations: string[]
  bottlenecks: string[]
}

/**
 * Analytics Service for architecture analysis and metrics calculation
 */
export class AnalyticsService {
  /**
   * Calculate comprehensive architecture metrics
   */
  static calculateMetrics(nodes: NodeData[], edges: Edge[]): ArchitectureMetrics {
    const nodeCount = nodes.length
    const edgeCount = edges.length

    // Calculate connectivity metrics
    const connectivity = this.calculateConnectivity(nodes, edges)
    const averageConnectivity = connectivity.sum / nodeCount || 0
    const maxConnectivity = Math.max(...connectivity.perNode)
    const minConnectivity = Math.min(...connectivity.perNode)

    // Calculate cyclomatic complexity (simplified)
    const cyclomaticComplexity = edgeCount - nodeCount + 2

    // Calculate average path length
    const avgPathLength = this.calculateAveragePathLength(nodes, edges)

    // Calculate graph density
    const maxPossibleEdges = (nodeCount * (nodeCount - 1)) / 2
    const graphDensity = maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0

    // Detect component clusters
    const componentClusters = this.detectClusters(nodes, edges)

    return {
      nodeCount,
      edgeCount,
      averageConnectivity,
      maxConnectivity,
      minConnectivity,
      cyclomaticComplexity,
      avgPathLength,
      graphDensity,
      componentClusters,
    }
  }

  /**
   * Calculate node-level metrics
   */
  static calculateNodeMetrics(nodes: NodeData[], edges: Edge[]): NodeMetrics[] {
    return nodes.map((node) => {
      const inDegree = edges.filter((e) => e.target === node.id).length
      const outDegree = edges.filter((e) => e.source === node.id).length
      const totalDegree = inDegree + outDegree

      // Betweenness centrality (simplified)
      const betweennessCentrality = (totalDegree / (nodes.length - 1)) * 100

      // Importance based on connectivity
      let importance: 'critical' | 'high' | 'medium' | 'low'
      if (betweennessCentrality > 75) importance = 'critical'
      else if (betweennessCentrality > 50) importance = 'high'
      else if (betweennessCentrality > 25) importance = 'medium'
      else importance = 'low'

      return {
        id: node.id,
        label: node.metadata.name,
        inDegree,
        outDegree,
        betweennessCentrality,
        importance,
      }
    })
  }

  /**
   * Identify bottlenecks in architecture
   */
  static identifyBottlenecks(nodeMetrics: NodeMetrics[]): string[] {
    const bottlenecks: string[] = []

    // Critical nodes with high in-degree (single points of failure)
    const criticalHubs = nodeMetrics.filter((m) => m.importance === 'critical' && m.inDegree > 5)
    if (criticalHubs.length > 0) {
      bottlenecks.push(
        `⚠️ Critical bottlenecks detected: ${criticalHubs.map((m) => m.label).join(', ')} handle multiple incoming connections`,
      )
    }

    // Nodes with no outgoing connections (potential dead ends)
    const deadEnds = nodeMetrics.filter((m) => m.outDegree === 0 && m.inDegree > 2)
    if (deadEnds.length > 0) {
      bottlenecks.push(`🔴 Potential dead ends: ${deadEnds.map((m) => m.label).join(', ')} receive data but don't send`)
    }

    // Highly connected components (high coupling)
    const highCoupling = nodeMetrics.filter((m) => m.outDegree > 8 || m.inDegree > 8)
    if (highCoupling.length > 0) {
      bottlenecks.push(`🟠 High coupling detected in: ${highCoupling.map((m) => m.label).join(', ')}`)
    }

    return bottlenecks
  }

  /**
   * Generate recommendations based on analysis
   */
  static generateRecommendations(
    metrics: ArchitectureMetrics,
  ): string[] {
    const recommendations: string[] = []

    // Complexity recommendations
    if (metrics.cyclomaticComplexity > 20) {
      recommendations.push('🎯 Consider breaking down the architecture - high cyclomatic complexity detected')
    }

    if (metrics.graphDensity > 0.7) {
      recommendations.push('🎯 High graph density suggests tightly coupled components - consider modularity')
    }

    // Connectivity recommendations
    if (metrics.maxConnectivity > 10) {
      recommendations.push('🎯 Some components have very high connectivity - consider load balancing')
    }

    if (metrics.avgPathLength > metrics.nodeCount / 2) {
      recommendations.push('🎯 Long average path length - consider hierarchical organization')
    }

    // Cluster recommendations
    if (metrics.componentClusters > 3) {
      recommendations.push(`🎯 ${metrics.componentClusters} clusters detected - consider explicit microservices`)
    } else if (metrics.componentClusters === 1 && metrics.nodeCount > 15) {
      recommendations.push('🎯 Single cluster with many nodes - consider service decomposition')
    }

    return recommendations
  }

  /**
   * Calculate 30-day trend (simulated)
   */
  static calculateTrends(
    metrics: ArchitectureMetrics,
    healthScore: number,
  ): TrendData[] {
    const trends: TrendData[] = []
    const today = new Date()

    // Generate 30 days of simulated trend data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // Simulate gradual growth with some variance
      const dayIndex = 30 - i
      const growthFactor = 0.95 + (dayIndex / 30) * 0.1
      const variance = (Math.random() - 0.5) * 0.1

      trends.push({
        timestamp: date,
        nodeCount: Math.round(metrics.nodeCount * growthFactor * (1 + variance)),
        edgeCount: Math.round(metrics.edgeCount * growthFactor * (1 + variance)),
        complexity: metrics.cyclomaticComplexity * growthFactor,
        healthScore: Math.min(100, healthScore + (Math.random() - 0.5) * 10),
      })
    }

    return trends
  }

  /**
   * Generate comprehensive analytics report
   */
  static generateReport(
    projectId: string,
    nodes: NodeData[],
    edges: Edge[],
    healthScore: number,
  ): AnalyticsReport {
    const metrics = this.calculateMetrics(nodes, edges)
    const nodeMetrics = this.calculateNodeMetrics(nodes, edges)
    const bottlenecks = this.identifyBottlenecks(nodeMetrics)
    const recommendations = this.generateRecommendations(metrics)
    const trends = this.calculateTrends(metrics, healthScore)

    return {
      projectId,
      generatedAt: new Date(),
      metrics,
      nodeMetrics,
      trends,
      recommendations,
      bottlenecks,
    }
  }

  // Private helper methods

  private static calculateConnectivity(nodes: NodeData[], edges: Edge[]) {
    const perNode = nodes.map((node) => {
      const degree = edges.filter((e) => e.source === node.id || e.target === node.id).length
      return degree
    })

    return {
      perNode,
      sum: perNode.reduce((a, b) => a + b, 0),
    }
  }

  private static calculateAveragePathLength(nodes: NodeData[], edges: Edge[]): number {
    if (nodes.length === 0) return 0

    // Simplified: use node count as approximation
    // In production: use Floyd-Warshall or Dijkstra
    const avgDegree = (edges.length * 2) / nodes.length
    return Math.log(nodes.length) / Math.log(avgDegree) || 1
  }

  private static detectClusters(nodes: NodeData[], edges: Edge[]): number {
    if (nodes.length === 0) return 0

    const visited = new Set<string>()
    let clusters = 0

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        clusters++
        this.dfs(node.id, edges, visited)
      }
    }

    return clusters
  }

  private static dfs(nodeId: string, edges: Edge[], visited: Set<string>) {
    visited.add(nodeId)

    const connectedEdges = edges.filter((e) => e.source === nodeId || e.target === nodeId)
    for (const edge of connectedEdges) {
      const nextNodeId = edge.source === nodeId ? edge.target : edge.source
      if (!visited.has(nextNodeId)) {
        this.dfs(nextNodeId, edges, visited)
      }
    }
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService()
