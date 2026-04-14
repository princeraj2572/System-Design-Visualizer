/**
 * SOLID Principles Validator
 * Checks architecture against SOLID design principles
 */

import { SOLIDPrincipleCheckResult } from './types';

export function validateSOLIDPrinciples(nodes: any[], edges: any[]): SOLIDPrincipleCheckResult[] {
  return [
    checkSingleResponsibility(nodes, edges),
    checkOpenClosed(nodes, edges),
    checkLiskovSubstitution(nodes, edges),
    checkInterfaceSegregation(nodes, edges),
    checkDependencyInversion(nodes, edges),
  ];
}

/**
 * S: Single Responsibility Principle
 * Each service should have a single, well-defined responsibility
 */
function checkSingleResponsibility(nodes: any[], edges: any[]): SOLIDPrincipleCheckResult {
  const issues: string[] = [];
  let score = 100;

  // Check for overly connected nodes (doing too much)
  const connectionMap = new Map<string, number>();
  edges.forEach((edge) => {
    connectionMap.set(edge.source, (connectionMap.get(edge.source) || 0) + 1);
    connectionMap.set(edge.target, (connectionMap.get(edge.target) || 0) + 1);
  });

  nodes.forEach((node) => {
    const connections = connectionMap.get(node.id) || 0;
    const isCluster = ['microservice', 'backend-service', 'lambda', 'container'].includes(node.type);

    // Heuristic: if a service has too many connections, it might be handling too much
    if (isCluster && connections > 8) {
      issues.push(`${node.metadata?.name || node.type} has ${connections} connections - might violate SRP`);
      score -= 10;
    }
  });

  // Check for mixed-responsibility types (e.g., service doing auth AND data processing)
  const multiRespTypes = nodes.filter((n) => {
    const desc = (n.metadata?.description || '').toLowerCase();
    const hasMultipleKeywords =
      (desc.includes('auth') ? 1 : 0) +
      (desc.includes('process') ? 1 : 0) +
      (desc.includes('cache') ? 1 : 0) +
      (desc.includes('log') ? 1 : 0);
    return hasMultipleKeywords > 1;
  });

  if (multiRespTypes.length > 0) {
    issues.push(
      `${multiRespTypes.length} service(s) appear to have multiple responsibilities based on description`
    );
    score -= 15 * Math.min(multiRespTypes.length, 3);
  }

  return {
    principle: 'S',
    name: 'Single Responsibility Principle',
    violated: score < 80,
    issues,
    score: Math.max(0, score),
  };
}

/**
 * O: Open/Closed Principle
 * Architecture should be open for extension but closed for modification
 */
function checkOpenClosed(nodes: any[], _edges: any[]): SOLIDPrincipleCheckResult {
  const issues: string[] = [];
  let score = 100;

  // Check for extensibility (plugin system, plugin architecture)
  const hasPluginSystem = nodes.some((n) =>
    (n.metadata?.description || '').toLowerCase().includes('plugin')
  );

  if (!hasPluginSystem && nodes.length > 5) {
    issues.push('No obvious plugin or extension system detected');
    score -= 20;
  }

  // Check for API versioning
  const apiNodes = nodes.filter(
    (n) =>
      n.type.includes('api') ||
      n.type === 'rest-api' ||
      n.type === 'graphql-server'
  );

  if (apiNodes.length > 0) {
    const hasBadgeVersioning = apiNodes.some((n) =>
      (n.metadata?.description || '').includes('v1') ||
      (n.metadata?.description || '').includes('v2')
    );

    if (!hasBadgeVersioning && apiNodes.some((n) => n.metadata?.description?.length > 0)) {
      issues.push('Consider explicit API versioning for backward compatibility');
      score -= 10;
    }
  }

  // Check for abstraction layers
  const hasAbstractionLayers = nodes.some(
    (n) =>
      n.type === 'api-gateway' ||
      (n.metadata?.description || '').toLowerCase().includes('facade')
  );

  if (!hasAbstractionLayers) {
    issues.push('Consider adding abstraction layers (API Gateway, Facade) for extension points');
    score -= 15;
  }

  return {
    principle: 'O',
    name: 'Open/Closed Principle',
    violated: score < 70,
    issues,
    score: Math.max(0, score),
  };
}

/**
 * L: Liskov Substitution Principle
 * Substituting derived services should not break the system
 */
function checkLiskovSubstitution(nodes: any[], edges: any[]): SOLIDPrincipleCheckResult {
  const issues: string[] = [];
  let score = 100;

  // Check for type inconsistencies in connections
  const typeConnections: Record<string, Set<string>> = {};

  edges.forEach((edge) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (sourceNode && targetNode) {
      const key = `${sourceNode.type}→${targetNode.type}`;
      if (!typeConnections[key]) {
        typeConnections[key] = new Set();
      }
      typeConnections[key].add(edge.type || 'unknown');
    }
  });

  // Find inconsistent connection patterns
  Object.entries(typeConnections).forEach(([key, types]) => {
    if (types.size > 2) {
      issues.push(
        `Interface inconsistency: ${key} uses ${types.size} different connection types - consider normalizing`
      );
      score -= 10;
    }
  });

  return {
    principle: 'L',
    name: 'Liskov Substitution Principle',
    violated: score < 75,
    issues,
    score: Math.max(0, score),
  };
}

/**
 * I: Interface Segregation Principle
 * Services should depend on fine-grained interfaces, not broad ones
 */
function checkInterfaceSegregation(nodes: any[], edges: any[]): SOLIDPrincipleCheckResult {
  const issues: string[] = [];
  let score = 100;

  // Check if there's a single monolithic API
  const apiEndpoints = nodes.filter((n) => ['api-gateway', 'rest-api'].includes(n.type));

  if (apiEndpoints.length === 1 && nodes.length > 8) {
    const incomingConnections = edges.filter(
      (e) => e.target === apiEndpoints[0].id
    ).length;

    if (incomingConnections > 10) {
      issues.push(
        'Single API Gateway/Endpoint receiving many connections - consider API segmentation'
      );
      score -= 20;
    }
  }

  // Check for domain-specific interfaces
  const domainCountByPrefix: Record<string, number> = {};

  nodes.forEach((n) => {
    const name = n.metadata?.name || n.id;
    const prefix = name.split('-')[0];
    domainCountByPrefix[prefix] = (domainCountByPrefix[prefix] || 0) + 1;
  });

  const hasDomaginatedDesign = Object.values(domainCountByPrefix).some((count) => count >= 2);

  if (!hasDomaginatedDesign && nodes.length > 5) {
    issues.push('Consider organizing services around domain boundaries');
    score -= 10;
  }

  return {
    principle: 'I',
    name: 'Interface Segregation Principle',
    violated: score < 70,
    issues,
    score: Math.max(0, score),
  };
}

/**
 * D: Dependency Inversion Principle
 * Depend on abstractions, not concretions
 */
function checkDependencyInversion(nodes: any[], edges: any[]): SOLIDPrincipleCheckResult {
  const issues: string[] = [];
  let score = 100;

  // Check for direct dependencies on data stores
  const datastores = nodes.filter((n) => ['sql-database', 'nosql-database'].includes(n.type));
  const businessServices = nodes.filter((n) =>
    ['backend-service', 'microservice', 'lambda'].includes(n.type)
  );

  businessServices.forEach((service) => {
    const directDbAccess = edges.some(
      (e) =>
        (e.source === service.id && datastores.some((d) => d.id === e.target)) ||
        (e.target === service.id && datastores.some((d) => d.id === e.source))
    );

    if (directDbAccess) {
      issues.push(
        `${service.metadata?.name || service.type} directly depends on database - consider abstraction layer`
      );
      score -= 15;
    }
  });

  // Check for abstraction layers (repository pattern, DAOs)
  const hasAbstractionLayer = nodes.some(
    (n) =>
      (n.metadata?.description || '').toLowerCase().includes('repository') ||
      (n.metadata?.description || '').toLowerCase().includes('dao') ||
      n.type === 'data-access-layer'
  );

  if (!hasAbstractionLayer && datastores.length > 0 && businessServices.length > 0) {
    issues.push('Consider adding data access abstraction layer (Repository, DAO)');
    score -= 10;
  }

  return {
    principle: 'D',
    name: 'Dependency Inversion Principle',
    violated: score < 70,
    issues,
    score: Math.max(0, score),
  };
}
