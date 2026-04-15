import { ArchitectureMetrics, NodeMetrics } from './analytics-service'

export interface HealthReport {
  score: number // 0-100
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  scalability: number
  maintainability: number
  reliability: number
  security: number
  performance: number
  costEfficiency: number
  issues: HealthIssue[]
  suggestions: string[]
}

export interface HealthIssue {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  description: string
  impact: string
  resolution: string
}

/**
 * Architecture Health Scoring Service
 * Evaluates overall system health based on multiple factors
 */
export class HealthScoringService {
  /**
   * Calculate overall health score (0-100)
   */
  static calculateHealthScore(metrics: ArchitectureMetrics, nodeMetrics: NodeMetrics[]): number {
    const scores = {
      scalability: this.scoreScalability(metrics),
      maintainability: this.scoreMaintainability(metrics, nodeMetrics),
      reliability: this.scoreReliability(metrics, nodeMetrics),
      security: this.scoreSecurity(nodeMetrics),
      performance: this.scorePerformance(metrics),
      costEfficiency: this.scoreCostEfficiency(metrics),
    }

    // Weighted average
    const overallScore =
      scores.scalability * 0.2 +
      scores.maintainability * 0.25 +
      scores.reliability * 0.2 +
      scores.security * 0.15 +
      scores.performance * 0.1 +
      scores.costEfficiency * 0.1

    return Math.round(overallScore)
  }

  /**
   * Determine health status from score
   */
  static getStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (score >= 90) return 'excellent'
    if (score >= 75) return 'good'
    if (score >= 60) return 'fair'
    if (score >= 40) return 'poor'
    return 'critical'
  }

  /**
   * Generate comprehensive health report
   */
  static generateHealthReport(
    metrics: ArchitectureMetrics,
    nodeMetrics: NodeMetrics[],
  ): HealthReport {
    const score = this.calculateHealthScore(metrics, nodeMetrics)
    const status = this.getStatus(score)

    const scores = {
      scalability: this.scoreScalability(metrics),
      maintainability: this.scoreMaintainability(metrics, nodeMetrics),
      reliability: this.scoreReliability(metrics, nodeMetrics),
      security: this.scoreSecurity(nodeMetrics),
      performance: this.scorePerformance(metrics),
      costEfficiency: this.scoreCostEfficiency(metrics),
    }

    const issues = this.detectIssues(metrics, nodeMetrics, scores)
    const suggestions = this.generateSuggestions(scores)

    return {
      score,
      status,
      scalability: scores.scalability,
      maintainability: scores.maintainability,
      reliability: scores.reliability,
      security: scores.security,
      performance: scores.performance,
      costEfficiency: scores.costEfficiency,
      issues,
      suggestions,
    }
  }

  // Scoring methods (0-100)

  private static scoreScalability(metrics: ArchitectureMetrics): number {
    let score = 100

    // Modularity check
    if (metrics.componentClusters < 2) score -= 20
    if (metrics.componentClusters > 8) score -= 10

    // Complexity check
    if (metrics.cyclomaticComplexity > 30) score -= 30
    if (metrics.cyclomaticComplexity > 50) score -= 20

    // Connectivity check
    if (metrics.averageConnectivity > 8) score -= 15

    return Math.max(0, score)
  }

  private static scoreMaintainability(metrics: ArchitectureMetrics, nodeMetrics: NodeMetrics[]): number {
    let score = 100

    // Check for code smells
    const highCouplingNodes = nodeMetrics.filter((m) => m.outDegree > 8 || m.inDegree > 8)
    if (highCouplingNodes.length > 3) score -= 25

    // Circular dependency check (simplified)
    if (metrics.cyclomaticComplexity > 20) score -= 20

    // Size check
    if (metrics.nodeCount > 50) score -= 15

    // Connectivity distribution
    if (metrics.maxConnectivity > metrics.averageConnectivity * 3) score -= 10

    return Math.max(0, score)
  }

  private static scoreReliability(metrics: ArchitectureMetrics, nodeMetrics: NodeMetrics[]): number {
    let score = 100

    // Single point of failure detection
    const criticalNodes = nodeMetrics.filter((m) => m.importance === 'critical')
    if (criticalNodes.length > 3) score -= 30

    // Check for isolated components
    const isolatedNodes = nodeMetrics.filter((m) => m.inDegree === 0 && m.outDegree === 0)
    if (isolatedNodes.length > nodeMetrics.length * 0.1) score -= 15

    // Redundancy check (inverse of density)
    if (metrics.graphDensity < 0.3) score -= 20

    return Math.max(0, score)
  }

  private static scoreSecurity(nodeMetrics: NodeMetrics[]): number {
    let score = 100

    // Check for over-privileged nodes (high degree)
    const overPrivileged = nodeMetrics.filter((m) => m.outDegree > 10 || m.inDegree > 10)
    if (overPrivileged.length > 0) score -= 25

    // Assume 50 base points (security needs manual review)
    return Math.max(30, score)
  }

  private static scorePerformance(metrics: ArchitectureMetrics): number {
    let score = 100

    // Average path length (latency proxy)
    if (metrics.avgPathLength > 5) score -= 20
    if (metrics.avgPathLength > 10) score -= 20

    // Graph density (traffic congestion proxy)
    if (metrics.graphDensity > 0.8) score -= 30

    // Connectivity balance
    if (metrics.maxConnectivity > metrics.averageConnectivity * 5) score -= 15

    return Math.max(0, score)
  }

  private static scoreCostEfficiency(metrics: ArchitectureMetrics): number {
    let score = 100

    // More clusters = higher operational costs
    if (metrics.componentClusters > 5) score -= 25
    if (metrics.componentClusters > 10) score -= 25

    // High node count = higher resource usage
    if (metrics.nodeCount > 50) score -= 20

    // Low graph density = inefficient resource usage
    if (metrics.graphDensity < 0.2) score -= 15

    return Math.max(0, score)
  }

  private static detectIssues(
    metrics: ArchitectureMetrics,
    nodeMetrics: NodeMetrics[],
    scores: Record<string, number>,
  ): HealthIssue[] {
    const issues: HealthIssue[] = []

    // Scalability issues
    if (scores.scalability < 70) {
      issues.push({
        id: 'scalability-001',
        severity: 'high',
        category: 'Scalability',
        description: 'Architecture may have limited scalability',
        impact: 'Difficult to scale horizontally',
        resolution: 'Refactor into microservices or service mesh',
      })
    }

    // Maintainability issues
    if (scores.maintainability < 70) {
      const highCouplingNodes = nodeMetrics.filter((m) => m.outDegree > 8)
      if (highCouplingNodes.length > 0) {
        issues.push({
          id: 'maintainability-001',
          severity: 'high',
          category: 'Maintainability',
          description: `High coupling detected in ${highCouplingNodes[0].label}`,
          impact: 'Changes cascade through system',
          resolution: 'Apply dependency inversion principle (DIP)',
        })
      }
    }

    // Reliability issues
    if (scores.reliability < 70) {
      const criticalNodes = nodeMetrics.filter((m) => m.importance === 'critical')
      if (criticalNodes.length > 0) {
        issues.push({
          id: 'reliability-001',
          severity: 'critical',
          category: 'Reliability',
          description: `Single point of failure: ${criticalNodes[0].label}`,
          impact: 'System fails if component fails',
          resolution: 'Add redundancy and failover mechanisms',
        })
      }
    }

    // Performance issues
    if (scores.performance < 70) {
      if (metrics.avgPathLength > 5) {
        issues.push({
          id: 'performance-001',
          severity: 'medium',
          category: 'Performance',
          description: 'High average path length increases latency',
          impact: 'Requests traverse many hops',
          resolution: 'Optimize communication patterns and add caching',
        })
      }
    }

    // Cost efficiency issues
    if (scores.costEfficiency < 70) {
      issues.push({
        id: 'cost-001',
        severity: 'medium',
        category: 'Cost',
        description: 'Architecture is resource-intensive',
        impact: 'High operational costs',
        resolution: 'Consolidate or re-architect for efficiency',
      })
    }

    return issues
  }

  private static generateSuggestions(scores: Record<string, number>): string[] {
    const suggestions: string[] = []

    if (scores.scalability < 80) {
      suggestions.push('💡 Implement service mesh for better scalability')
      suggestions.push('💡 Consider API gateway pattern')
    }

    if (scores.maintainability < 80) {
      suggestions.push('💡 Apply SOLID principles to reduce coupling')
      suggestions.push('💡 Implement event-driven architecture for decoupling')
    }

    if (scores.reliability < 80) {
      suggestions.push('💡 Add circuit breakers for fault tolerance')
      suggestions.push('💡 Implement health checks and monitoring')
    }

    if (scores.performance < 80) {
      suggestions.push('💡 Implement caching strategy (Redis, CDN)')
      suggestions.push('💡 Add load balancing across components')
    }

    if (scores.costEfficiency < 80) {
      suggestions.push('💡 Evaluate serverless for variable workloads')
      suggestions.push('💡 Implement auto-scaling policies')
    }

    return suggestions.slice(0, 5) // Top 5 suggestions
  }
}

// Create singleton instance
export const healthScoringService = new HealthScoringService()
