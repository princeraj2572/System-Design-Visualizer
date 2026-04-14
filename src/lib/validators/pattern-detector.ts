/**
 * Architecture Pattern Detection
 * Identifies and classifies architecture patterns
 */

import { ValidationViolation, ArchitecturePattern } from './types';

export function detectArchitecturePatterns(nodes: any[], edges: any[]): ValidationViolation[] {
  const violations: ValidationViolation[] = [];

  // Detect patterns
  const microservicesPattern = detectMicroservicesPattern(nodes, edges);
  const monolithPattern = detectMonolithPattern(nodes, edges);
  const serverlessPattern = detectServerlessPattern(nodes, edges);
  const monolithWithMicroservicesPattern = detectMixedPattern(nodes, edges);

  if (microservicesPattern.detected) {
    violations.push({
      ruleId: 'pattern-microservices',
      ruleName: 'Architecture: Microservices Pattern Detected',
      level: 'info',
      message: `Microservices architecture detected with ${microservicesPattern.count} services`,
      details: microservicesPattern,
    });
  }

  if (monolithPattern.detected) {
    violations.push({
      ruleId: 'pattern-monolith',
      ruleName: 'Architecture: Monolithic Pattern Detected',
      level: 'info',
      message: `Monolithic architecture detected`,
      details: monolithPattern,
    });
  }

  if (serverlessPattern.detected) {
    violations.push({
      ruleId: 'pattern-serverless',
      ruleName: 'Architecture: Serverless Pattern Detected',
      level: 'info',
      message: `Serverless functions detected: ${serverlessPattern.functionCount}`,
      details: serverlessPattern,
    });
  }

  if (monolithWithMicroservicesPattern.detected) {
    violations.push({
      ruleId: 'pattern-mixed',
      ruleName: 'Architecture: Mixed Pattern Detected',
      level: 'warning',
      message: 'Mixed monolith and microservices pattern - consider refactoring',
      suggestion: 'Consider full migration to microservices or consolidating to monolith',
      details: monolithWithMicroservicesPattern,
    });
  }

  return violations;
}

/**
 * Detect microservices architecture pattern
 */
function detectMicroservicesPattern(nodes: any[], _edges: any[]) {
  const microservices = nodes.filter((n) => n.type === 'microservice');
  const apiGateway = nodes.some((n) => n.type === 'api-gateway');
  const messageQueue = nodes.some((n) =>
    ['message-queue', 'pub-sub', 'event-bus'].includes(n.type)
  );

  const isMicroservices =
    microservices.length >= 3 && apiGateway;

  return {
    detected: isMicroservices,
    count: microservices.length,
    hasApiGateway: apiGateway,
    hasMessageQueue: messageQueue,
    confidence: microservices.length >= 5 ? 0.9 : 0.7,
  };
}

/**
 * Detect monolithic architecture pattern
 */
function detectMonolithPattern(nodes: any[], _edges: any[]) {
  const backendServices = nodes.filter((n) => n.type === 'backend-service');
  const microservices = nodes.filter((n) => n.type === 'microservice');
  const databases = nodes.filter((n) =>
    ['sql-database', 'nosql-database'].includes(n.type)
  );
  const singleDatabase = databases.length === 1;

  const isMonolith =
    backendServices.length === 1 &&
    microservices.length === 0 &&
    singleDatabase;

  return {
    detected: isMonolith,
    serviceCount: backendServices.length,
    databaseCount: databases.length,
    singleDatabase,
    confidence: isMonolith ? 0.95 : 0,
  };
}

/**
 * Detect serverless architecture pattern
 */
function detectServerlessPattern(nodes: any[], _edges: any[]) {
  const functions = nodes.filter((n) => n.type === 'lambda');
  const managedServices = nodes.filter((n) =>
    ['managed-service', 'apigateway', 'dynamodb', 's3'].includes(n.type)
  );

  const isServerless = functions.length > 0 && managedServices.length >= 2;

  return {
    detected: isServerless,
    functionCount: functions.length,
    managedServiceCount: managedServices.length,
    confidence: functions.length >= 3 ? 0.85 : 0.6,
  };
}

/**
 * Detect mixed monolith + microservices pattern (anti-pattern)
 */
function detectMixedPattern(nodes: any[], _edges: any[]) {
  const backendServices = nodes.filter((n) => n.type === 'backend-service');
  const microservices = nodes.filter((n) => n.type === 'microservice');

  const isMixed =
    backendServices.length > 0 &&
    microservices.length > 0;

  return {
    detected: isMixed,
    backendServices: backendServices.length,
    microservices: microservices.length,
    recommendation: 'Consider either consolidating to monolith or fully migrating to microservices',
    confidence: isMixed ? 0.8 : 0,
  };
}

/**
 * Get pattern descriptions
 */
export const PATTERNS: Record<string, ArchitecturePattern> = {
  microservices: {
    id: 'microservices',
    name: 'Microservices Architecture',
    description: 'Multiple independent services communicating via APIs or message queues',
    detectionRules: [
      {
        matcher: (nodes, _edges) => nodes.filter((n) => n.type === 'microservice').length >= 3,
        confidence: 0.8,
      },
    ],
    recommendations: [
      'Use API Gateway for external communication',
      'Implement service discovery',
      'Use message queues for async communication',
      'Implement distributed tracing',
      'Plan for eventual consistency',
    ],
    antiPatterns: [
      'Data sharing between services',
      'Synchronous calls for non-critical operations',
      'Shared database across services',
    ],
  },
  monolith: {
    id: 'monolith',
    name: 'Monolithic Architecture',
    description: 'Single or few tightly-coupled services with shared database',
    detectionRules: [
      {
        matcher: (nodes, _edges) =>
          nodes.filter((n) => n.type === 'backend-service').length === 1 &&
          nodes.filter((n) => n.type === 'microservice').length === 0,
        confidence: 0.9,
      },
    ],
    recommendations: [
      'Organize code into clear modules',
      'Use dependency injection',
      'Implement comprehensive logging',
      'Plan for monitoring',
      'Consider migration path to microservices',
    ],
    antiPatterns: [
      'God classes',
      'Circular dependencies',
      'Tight coupling across domains',
    ],
  },
  serverless: {
    id: 'serverless',
    name: 'Serverless/FaaS Architecture',
    description: 'Event-driven functions with managed backend services',
    detectionRules: [
      {
        matcher: (nodes, _edges) => nodes.filter((n) => n.type === 'lambda').length > 0,
        confidence: 0.7,
      },
    ],
    recommendations: [
      'Use managed databases (DynamoDB, etc.)',
      'Implement cold start optimization',
      'Use event sources effectively',
      'Monitor execution time and costs',
      'Plan for function timeout scenarios',
    ],
    antiPatterns: [
      'Long-running functions',
      'Functions with shared state',
      'Avoiding managed services',
    ],
  },
};
