/**
 * Built-in Validation Rules
 * Pre-configured rules for common architecture issues
 */

import { ValidationRule, ValidationViolation } from './types';

export function getBuiltInRules(): ValidationRule[] {
  return [
    {
      id: 'no-frontend-to-db',
      name: 'No Direct Frontend to Database',
      description: 'Frontend applications should not directly connect to databases. Use APIs instead.',
      category: 'architecture',
      level: 'error',
      enabled: true,
      custom: false,
      checkFunction: checkNoFrontendToDatabase,
    },
    {
      id: 'frontend-must-have-api',
      name: 'Frontend Must Have Backend',
      description: 'Each frontend application should connect to at least one backend service.',
      category: 'best-practice',
      level: 'warning',
      enabled: true,
      custom: false,
      checkFunction: checkFrontendHasBackend,
    },
    {
      id: 'api-needs-auth',
      name: 'API Gateway Should Have Authentication',
      description: 'API Gateways should be configured with authentication mechanisms.',
      category: 'security',
      level: 'warning',
      enabled: true,
      custom: false,
      checkFunction: checkAPIHasAuth,
    },
    {
      id: 'database-needs-backup',
      name: 'Databases Should Have Backup Strategy',
      description: 'Production databases should have backup and disaster recovery configured.',
      category: 'architecture',
      level: 'warning',
      enabled: true,
      custom: false,
      checkFunction: checkDatabaseBackup,
    },
    {
      id: 'no-circular-dependencies',
      name: 'No Circular Dependencies',
      description: 'Services should not have circular dependencies - maintains clear architecture.',
      category: 'architecture',
      level: 'error',
      enabled: true,
      custom: false,
      checkFunction: checkNoCircularDependencies,
    },
    {
      id: 'microservices-need-messaging',
      name: 'Microservices Need Communication',
      description: 'Microservices should communicate through APIs or message queues, not direct DB access.',
      category: 'architecture',
      level: 'warning',
      enabled: true,
      custom: false,
      checkFunction: checkMicroservicesCommunication,
    },
    {
      id: 'cache-behind-api',
      name: 'Cache Should Be Behind API',
      description: 'Caches should not be directly accessed by frontend - go through API layer.',
      category: 'best-practice',
      level: 'warning',
      enabled: true,
      custom: false,
      checkFunction: checkCacheBehindAPI,
    },
    {
      id: 'single-point-of-failure',
      name: 'Avoid Single Points of Failure',
      description: 'Critical components should have redundancy (load balancers, failover).',
      category: 'architecture',
      level: 'warning',
      enabled: true,
      custom: false,
      checkFunction: checkSinglePointOfFailure,
    },
  ];
}

/**
 * Frontend should not directly connect to databases
 */
function checkNoFrontendToDatabase(nodes: any[], edges: any[]): ValidationViolation[] {
  const frontendTypes = ['web-frontend', 'mobile-app', 'client', 'desktop-app'];
  const databaseTypes = ['sql-database', 'nosql-database', 'graph-database', 'data-warehouse'];

  const violations: ValidationViolation[] = [];

  const frontendNodes = nodes.filter((n) => frontendTypes.includes(n.type));
  const databaseNodes = nodes.filter((n) => databaseTypes.includes(n.type));

  frontendNodes.forEach((frontend) => {
    databaseNodes.forEach((database) => {
      const directConnection = edges.some(
        (e) =>
          (e.source === frontend.id && e.target === database.id) ||
          (e.source === database.id && e.target === frontend.id)
      );

      if (directConnection) {
        violations.push({
          ruleId: 'no-frontend-to-db',
          ruleName: 'No Direct Frontend to Database',
          level: 'error',
          message: `${frontend.metadata?.name || frontend.type} directly connects to ${database.metadata?.name || database.type}`,
          nodeIds: [frontend.id, database.id],
          suggestion: 'Add an API Gateway or Backend Service between frontend and database',
        });
      }
    });
  });

  return violations;
}

/**
 * Frontend should have backend connection
 */
function checkFrontendHasBackend(nodes: any[], edges: any[]): ValidationViolation[] {
  const frontendTypes = ['web-frontend', 'mobile-app', 'client', 'desktop-app'];
  const backendTypes = ['backend-service', 'microservice', 'api-gateway', 'rest-api', 'graphql-server'];

  const violations: ValidationViolation[] = [];

  const frontendNodes = nodes.filter((n) => frontendTypes.includes(n.type));

  frontendNodes.forEach((frontend) => {
    const hasBackendConnection = edges.some((e) => {
      const target = nodes.find((n) => n.id === e.target);
      return e.source === frontend.id && target && backendTypes.includes(target.type);
    });

    if (!hasBackendConnection) {
      violations.push({
        ruleId: 'frontend-must-have-api',
        ruleName: 'Frontend Must Have Backend',
        level: 'warning',
        message: `${frontend.metadata?.name || frontend.type} has no backend connection`,
        nodeIds: [frontend.id],
        suggestion: 'Connect frontend to API Gateway or Backend Service',
      });
    }
  });

  return violations;
}

/**
 * API Gateway should have authentication
 */
function checkAPIHasAuth(nodes: any[], edges: any[]): ValidationViolation[] {
  const violations: ValidationViolation[] = [];

  const apiGateways = nodes.filter((n) => n.type === 'api-gateway');
  const authServices = nodes.filter((n) =>
    ['auth-service', 'identity-provider', 'oauth-server', 'sso'].includes(n.type)
  );

  apiGateways.forEach((api) => {
    const hasAuthConnection = edges.some(
      (e) =>
        (e.source === api.id && authServices.some((a) => a.id === e.target)) ||
        (e.target === api.id && authServices.some((a) => a.id === e.source))
    );

    if (!hasAuthConnection) {
      violations.push({
        ruleId: 'api-needs-auth',
        ruleName: 'API Gateway Should Have Authentication',
        level: 'warning',
        message: `${api.metadata?.name || 'API Gateway'} is not connected to authentication service`,
        nodeIds: [api.id],
        suggestion: 'Connect API Gateway to Auth Service, OAuth Server, or SSO provider',
      });
    }
  });

  return violations;
}

/**
 * Databases should have backup strategy
 */
function checkDatabaseBackup(nodes: any[], edges: any[]): ValidationViolation[] {
  const violations: ValidationViolation[] = [];

  const databases = nodes.filter((n) =>
    ['sql-database', 'nosql-database', 'graph-database', 'data-warehouse'].includes(n.type)
  );

  const backupServices = nodes.filter((n) =>
    ['backup-service', 'disaster-recovery', 'replication-service'].includes(n.type)
  );

  databases.forEach((db) => {
    const hasBackupConnection = edges.some(
      (e) =>
        (e.source === db.id && backupServices.some((b) => b.id === e.target)) ||
        (e.target === db.id && backupServices.some((b) => b.id === e.source))
    );

    if (!hasBackupConnection && backupServices.length > 0) {
      violations.push({
        ruleId: 'database-needs-backup',
        ruleName: 'Databases Should Have Backup Strategy',
        level: 'warning',
        message: `${db.metadata?.name || db.type} has no backup or replication service`,
        nodeIds: [db.id],
        suggestion: 'Add backup service or database replication',
      });
    }
  });

  return violations;
}

/**
 * No circular dependencies
 */
function checkNoCircularDependencies(nodes: any[], edges: any[]): ValidationViolation[] {
  const violations: ValidationViolation[] = [];

  const findCycles = (nodeId: string, visited = new Set(), path: string[] = []): string[] | null => {
    if (visited.has(nodeId)) {
      if (path.includes(nodeId)) {
        return [...path, nodeId];
      }
      return null;
    }

    visited.add(nodeId);
    path.push(nodeId);

    const outgoing = edges.filter((e) => e.source === nodeId).map((e) => e.target);

    for (const next of outgoing) {
      const cycle = findCycles(next, new Set(visited), [...path]);
      if (cycle) return cycle;
    }

    return null;
  };

  const foundCycles = new Set<string>();

  nodes.forEach((node) => {
    const cycle = findCycles(node.id);
    if (cycle) {
      const cycleKey = cycle.slice(0, -1).sort().join('->');
      if (!foundCycles.has(cycleKey)) {
        foundCycles.add(cycleKey);
        violations.push({
          ruleId: 'no-circular-dependencies',
          ruleName: 'No Circular Dependencies',
          level: 'error',
          message: `Circular dependency detected: ${cycle
            .map((id) => nodes.find((n) => n.id === id)?.metadata?.name || id)
            .join(' → ')}`,
          nodeIds: cycle.slice(0, -1),
          suggestion: 'Refactor architecture to break the cycle - consider introducing a mediator or event bus',
        });
      }
    }
  });

  return violations;
}

/**
 * Microservices need proper communication
 */
function checkMicroservicesCommunication(nodes: any[], edges: any[]): ValidationViolation[] {
  const violations: ValidationViolation[] = [];

  const microservices = nodes.filter((n) => n.type === 'microservice');
  const validChannels = ['api-gateway', 'message-queue', 'pub-sub', 'event-bus', 'grpc-server'];

  microservices.forEach((ms) => {
    const connectsToOtherMS = edges.some((e) => {
      const target = nodes.find((n) => n.id === e.target);
      return e.source === ms.id && target && target.type === 'microservice';
    });

    if (connectsToOtherMS) {
      const directConnection = edges.some((e) => {
        const target = nodes.find((n) => n.id === e.target);
        return (
          e.source === ms.id &&
          target &&
          target.type === 'microservice' &&
          !validChannels.includes(e.type)
        );
      });

      if (directConnection) {
        violations.push({
          ruleId: 'microservices-need-messaging',
          ruleName: 'Microservices Need Communication',
          level: 'warning',
          message: `${ms.metadata?.name || 'Microservice'} directly connects to another microservice`,
          nodeIds: [ms.id],
          suggestion:
            'Use API Gateway, Message Queue, or Event Bus for microservice communication',
        });
      }
    }
  });

  return violations;
}

/**
 * Cache should be behind API
 */
function checkCacheBehindAPI(nodes: any[], edges: any[]): ValidationViolation[] {
  const frontendTypes = ['web-frontend', 'mobile-app', 'client'];
  const cacheTypes = ['cache', 'redis', 'memcached'];

  const violations: ValidationViolation[] = [];

  const frontendNodes = nodes.filter((n) => frontendTypes.includes(n.type));
  const cacheNodes = nodes.filter((n) => cacheTypes.includes(n.type));

  frontendNodes.forEach((frontend) => {
    cacheNodes.forEach((cache) => {
      const directConnection = edges.some(
        (e) =>
          (e.source === frontend.id && e.target === cache.id) ||
          (e.source === cache.id && e.target === frontend.id)
      );

      if (directConnection) {
        violations.push({
          ruleId: 'cache-behind-api',
          ruleName: 'Cache Should Be Behind API',
          level: 'warning',
          message: `${frontend.metadata?.name || frontend.type} directly accesses cache`,
          nodeIds: [frontend.id, cache.id],
          suggestion: 'Route cache access through API Gateway or Backend Service',
        });
      }
    });
  });

  return violations;
}

/**
 * Avoid single points of failure
 */
function checkSinglePointOfFailure(nodes: any[], edges: any[]): ValidationViolation[] {
  const violations: ValidationViolation[] = [];

  const criticalTypes = ['api-gateway', 'database', 'auth-service'];
  const criticalNodes = nodes.filter((n) =>
    criticalTypes.some((type) => n.type.includes(type))
  );

  criticalNodes.forEach((node) => {
    const redundantNodes = nodes.filter(
      (n) => n.type === node.type && n.id !== node.id
    );

    if (redundantNodes.length === 0) {
      const incomingConnections = edges.filter((e) => e.target === node.id).length;

      if (incomingConnections > 2) {
        violations.push({
          ruleId: 'single-point-of-failure',
          ruleName: 'Avoid Single Points of Failure',
          level: 'warning',
          message: `${node.metadata?.name || node.type} is a single point of failure with ${incomingConnections} incoming connections`,
          nodeIds: [node.id],
          suggestion: 'Add redundancy with load balancer or add multiple instances of this component',
        });
      }
    }
  });

  return violations;
}
