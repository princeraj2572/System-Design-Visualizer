import { NodeData, Edge } from '@/types/architecture'

export interface Dependency {
  from: string
  to: string
  strength: number // 1-5
  type: 'direct' | 'indirect'
  depth: number
}

export interface CircularDependency {
  nodes: string[]
  cycle: string[]
}

export interface CouplingMetrics {
  afferent: number // incoming connections
  efferent: number // outgoing connections
  instability: number // 0-1, 0 = stable, 1 = unstable
  abstractness: number // 0-1, 0 = concrete, 1 = abstract
}

/**
 * Relationship Analyzer Service
 * Analyzes dependencies and relationships between components
 */
export class RelationshipAnalyzerService {
  /**
   * Find all dependencies for a component
   */
  static findDependencies(componentId: string, edges: Edge[]): Dependency[] {
    const dependencies: Dependency[] = []
    const visited = new Set<string>()
    const queue: [string, number, 'direct' | 'indirect'][] = [[componentId, 0, 'direct']]

    while (queue.length > 0) {
      const [currentId, depth] = queue.shift()!
      if (visited.has(currentId) || depth > 3) continue
      visited.add(currentId)

      const outgoing = edges.filter((e) => e.source === currentId)
      for (const edge of outgoing) {
        dependencies.push({
          from: currentId,
          to: edge.target,
          strength: Math.min(5, Math.max(1, (edge as any).metadata?.strength || 3)),
          type: depth === 0 ? 'direct' : 'indirect',
          depth,
        })

        if (depth < 2) {
          queue.push([edge.target, depth + 1, 'indirect'])
        }
      }
    }

    return dependencies
  }

  /**
   * Detect circular dependencies (cycles in the graph)
   */
  static detectCircularDependencies(nodes: NodeData[], edges: Edge[]): CircularDependency[] {
    const cycles: CircularDependency[] = []
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const dfs = (nodeId: string, path: string[]) => {
      visited.add(nodeId)
      recursionStack.add(nodeId)
      path.push(nodeId)

      const outgoing = edges.filter((e) => e.source === nodeId)

      for (const edge of outgoing) {
        const targetId = edge.target

        if (!visited.has(targetId)) {
          dfs(targetId, [...path])
        } else if (recursionStack.has(targetId)) {
          // Found a cycle
          const cycleStart = path.indexOf(targetId)
          if (cycleStart !== -1) {
            const cycle = path.slice(cycleStart)
            cycle.push(targetId) // Complete the cycle
            cycles.push({
              nodes: [nodeId, ...path],
              cycle,
            })
          }
        }
      }

      recursionStack.delete(nodeId)
    }

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id, [])
      }
    }

    return cycles
  }

  /**
   * Calculate coupling metrics for a component
   */
  static calculateCouplingMetrics(
    componentId: string,
    nodes: NodeData[],
    edges: Edge[],
  ): CouplingMetrics {
    const afferent = edges.filter((e) => e.target === componentId).length
    const efferent = edges.filter((e) => e.source === componentId).length

    // Instability = efferent / (afferent + efferent)
    // 0 = stable (depended upon), 1 = unstable (depends on others)
    const instability = afferent + efferent > 0 ? efferent / (afferent + efferent) : 0.5

    // Abstractness (simplified) - based on node type
    const node = nodes.find((n) => n.id === componentId)
    const abstractness = (node?.type === 'api-gateway' || node?.type === 'rest-api' || node?.type === 'service') ? 0.8 : 0.2

    return {
      afferent,
      efferent,
      instability,
      abstractness,
    }
  }

  /**
   * Identify tightly coupled components
   */
  static identifyTightCoupling(edges: Edge[]): Array<{ components: string[]; strength: number }> {
    const coupling: Map<string, number> = new Map()

    for (const edge of edges) {
      const key = [edge.source, edge.target].sort().join(':')
      const bidirectional = edges.some(
        (e) => e.source === edge.target && e.target === edge.source,
      )
      const strength = bidirectional ? 2 : 1
      coupling.set(key, (coupling.get(key) || 0) + strength)
    }

    return Array.from(coupling.entries())
      .filter(([_, strength]) => strength >= 2)
      .map(([key, strength]) => ({
        components: key.split(':'),
        strength,
      }))
      .sort((a, b) => b.strength - a.strength)
  }

  /**
   * Find components with high coupling that could be decoupled
   */
  static findDecouplingOpportunities(nodes: NodeData[], edges: Edge[]): string[] {
    const opportunities: string[] = []
    const tightCoupling = this.identifyTightCoupling(edges)

    if (tightCoupling.length > 0) {
      opportunities.push(`💡 Decouple: ${tightCoupling[0].components.join(' ↔ ')} (bidirectional dependency)`)
    }

    const cycles = this.detectCircularDependencies(nodes, edges)
    if (cycles.length > 0) {
      opportunities.push(`⚠️ Break cycle: ${cycles[0].cycle.slice(0, -1).join(' → ')}`)
    }

    return opportunities
  }

  /**
   * Analyze dependency layers
   */
  static analyzeDependencyLayers(nodes: NodeData[], edges: Edge[]): Map<string, number> {
    const layers = new Map<string, number>()
    const visited = new Set<string>()
    const queue: [string, number][] = []

    // Find nodes with no dependencies (tier 0)
    for (const node of nodes) {
      const hasIncoming = edges.some((e) => e.target === node.id)
      if (!hasIncoming) {
        queue.push([node.id, 0])
        layers.set(node.id, 0)
      }
    }

    // BFS to assign layers
    while (queue.length > 0) {
      const [nodeId, currentLayer] = queue.shift()!
      if (visited.has(nodeId)) continue
      visited.add(nodeId)

      const outgoing = edges.filter((e) => e.source === nodeId)
      for (const edge of outgoing) {
        const targetLayer = Math.max(currentLayer + 1, layers.get(edge.target) || 0)
        layers.set(edge.target, targetLayer)

        if (!visited.has(edge.target)) {
          queue.push([edge.target, targetLayer])
        }
      }
    }

    // Assign remaining nodes
    for (const node of nodes) {
      if (!layers.has(node.id)) {
        layers.set(node.id, 0)
      }
    }

    return layers
  }

  /**
   * Calculate metrics across entire architecture
   */
  static calculateGlobalDependencyMetrics(nodes: NodeData[], edges: Edge[]) {
    const metrics = {
      totalDependencies: edges.length,
      averageDependenciesPerNode: edges.length / nodes.length,
      maxDependencies: 0,
      minDependencies: Infinity,
      circularDependencies: 0,
      tightCouplings: 0,
    }

    for (const node of nodes) {
      const dependencies = edges.filter(
        (e) => e.source === node.id || e.target === node.id,
      ).length
      metrics.maxDependencies = Math.max(metrics.maxDependencies, dependencies)
      metrics.minDependencies = Math.min(metrics.minDependencies, dependencies)
    }

    metrics.circularDependencies = this.detectCircularDependencies(nodes, edges).length
    metrics.tightCouplings = this.identifyTightCoupling(edges).length

    return metrics
  }
}

// Create singleton instance
export const relationshipAnalyzerService = new RelationshipAnalyzerService()
