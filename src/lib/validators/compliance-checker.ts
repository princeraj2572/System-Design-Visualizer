/**
 * Compliance Checker
 * Validates architecture against industry standards and frameworks
 */

import { ValidationViolation, ComplianceFramework } from './types';

export function checkComplianceStandards(
  nodes: any[],
  frameworks: string[]
): ValidationViolation[] {
  const violations: ValidationViolation[] = [];

  if (frameworks.includes('12-factor')) {
    violations.push(...check12FactorApp(nodes));
  }

  if (frameworks.includes('cloud-native')) {
    violations.push(...checkCloudNative(nodes));
  }

  if (frameworks.includes('privacy-first')) {
    violations.push(...checkPrivacyFirst(nodes));
  }

  if (frameworks.includes('resilience')) {
    violations.push(...checkResilience(nodes));
  }

  return violations;
}

/**
 * 12-Factor App Methodology
 */
function check12FactorApp(nodes: any[]): ValidationViolation[] {
  const violations: ValidationViolation[] = [];

  // Factor 1: Codebase - check for version control indication
  // Factor 2: Dependencies - check for package managers
  // Factor 3: Config - check for environment-specific config services
  const hasConfigService = nodes.some((n) =>
    (n.metadata?.name || '').toLowerCase().includes('config') ||
    n.type === 'config-server'
  );

  if (!hasConfigService) {
    violations.push({
      ruleId: 'compliance-12factor-config',
      ruleName: '12-Factor: Externalized Configuration',
      level: 'warning',
      message: 'No configuration service detected - violates 12-Factor principle #3',
      suggestion: 'Add Config Server or similar service for externalized configuration',
    });
  }

  // Factor 4: Backing Services - check for external service connections
  const backingServices = nodes.filter(
    (n) =>
      ['database', 'cache', 'message-queue', 'monitoring'].some((t) =>
        n.type.includes(t)
      ) || n.type === 'external-api'
  );

  if (backingServices.length === 0) {
    violations.push({
      ruleId: 'compliance-12factor-services',
      ruleName: '12-Factor: Backing Services',
      level: 'info',
      message: 'No backing services detected - ensure external services are treated as attached resources',
    });
  }

  // Factor 5: Build/Release/Run - check for logging
  const hasLogging = nodes.some(
    (n) =>
      n.type === 'logging' ||
      (n.metadata?.description || '').toLowerCase().includes('log')
  );

  if (!hasLogging) {
    violations.push({
      ruleId: 'compliance-12factor-logs',
      ruleName: '12-Factor: Logs as Event Stream',
      level: 'warning',
      message: 'No logging service detected - violates 12-Factor principle #11',
      suggestion: 'Add centralized logging (ELK, Datadog, CloudWatch, etc.)',
    });
  }

  // Factor 9: Disposability - check for graceful shutdown support
  // This is more about implementation than architecture, documented as info
  violations.push({
    ruleId: 'compliance-12factor-disposability',
    ruleName: '12-Factor: Disposability',
    level: 'info',
    message: 'Ensure all services support fast startup and graceful shutdown',
    suggestion: 'Document startup/shutdown procedures in service implementations',
  });

  return violations;
}

/**
 * Cloud Native Architecture
 */
function checkCloudNative(nodes: any[]): ValidationViolation[] {
  const violations: ValidationViolation[] = [];

  // Containerization
  const hasContainers = nodes.some((n) => n.type === 'container' || n.type === 'docker');

  if (!hasContainers) {
    violations.push({
      ruleId: 'compliance-cloud-native-containers',
      ruleName: 'Cloud Native: Containerization',
      level: 'warning',
      message: 'No containers detected - cloud-native apps are typically containerized',
      suggestion: 'Consider containerizing services with Docker/Kubernetes',
    });
  }

  // Orchestration
  const hasOrchestration = nodes.some(
    (n) =>
      n.type === 'kubernetes' ||
      n.type === 'orchestration' ||
      (n.metadata?.description || '').toLowerCase().includes('kubernetes')
  );

  if (!hasOrchestration && hasContainers) {
    violations.push({
      ruleId: 'compliance-cloud-native-orchestration',
      ruleName: 'Cloud Native: Container Orchestration',
      level: 'warning',
      message: 'Containers detected but no orchestration platform - consider Kubernetes',
      suggestion: 'Add Kubernetes for container orchestration and management',
    });
  }

  // Monitoring & Observability
  const hasMonitoring = nodes.some(
    (n) =>
      n.type === 'monitoring' ||
      ['prometheus', 'datadog', 'newrelic'].some((m) =>
        (n.metadata?.name || '').toLowerCase().includes(m)
      )
  );

  const hasTracing = nodes.some(
    (n) =>
      (n.metadata?.description || '').toLowerCase().includes('tracing') ||
      n.type === 'tracing'
  );

  if (!hasMonitoring || !hasTracing) {
    violations.push({
      ruleId: 'compliance-cloud-native-observability',
      ruleName: 'Cloud Native: Observability',
      level: 'warning',
      message: 'Missing monitoring or tracing - cloud-native applications need full observability',
      suggestion: 'Implement monitoring, logging, and distributed tracing',
    });
  }

  // Scalability
  const hasLoadBalancer = nodes.some((n) => n.type === 'load-balancer');
  const hasAutoScaling = nodes.some(
    (n) =>
      (n.metadata?.description || '').toLowerCase().includes('autoscal') ||
      n.type === 'autoscaling'
  );

  if (!hasLoadBalancer) {
    violations.push({
      ruleId: 'compliance-cloud-native-loadbalancing',
      ruleName: 'Cloud Native: Load Balancing',
      level: 'warning',
      message: 'No load balancer detected - needed for scaling cloud-native applications',
      suggestion: 'Add load balancer for traffic distribution',
    });
  }

  if (!hasAutoScaling) {
    violations.push({
      ruleId: 'compliance-cloud-native-autoscaling',
      ruleName: 'Cloud Native: Auto-Scaling',
      level: 'info',
      message: 'No auto-scaling policy detected - consider implementing for cost efficiency',
      suggestion: 'Configure auto-scaling based on metrics (CPU, memory, requests)',
    });
  }

  return violations;
}

/**
 * Privacy-First Architecture
 */
function checkPrivacyFirst(nodes: any[]): ValidationViolation[] {
  const violations: ValidationViolation[] = [];

  // Encryption
  const hasEncryption = nodes.some(
    (n) =>
      n.type === 'encryption-service' ||
      (n.metadata?.description || '').toLowerCase().includes('encrypt')
  );

  if (!hasEncryption) {
    violations.push({
      ruleId: 'compliance-privacy-encryption',
      ruleName: 'Privacy-First: Encryption',
      level: 'warning',
      message: 'No encryption service detected - sensitive data should be encrypted',
      suggestion: 'Add encryption service for data at rest and in transit',
    });
  }

  // Data Access Control
  const hasAuthService = nodes.some(
    (n) =>
      n.type === 'auth-service' ||
      n.type === 'identity-provider' ||
      (n.metadata?.description || '').toLowerCase().includes('auth')
  );

  if (!hasAuthService) {
    violations.push({
      ruleId: 'compliance-privacy-auth',
      ruleName: 'Privacy-First: Authentication & Authorization',
      level: 'error',
      message: 'No authentication service detected',
      suggestion: 'Add authentication service to control data access',
    });
  }

  // Data Minimization
  violations.push({
    ruleId: 'compliance-privacy-minimization',
    ruleName: 'Privacy-First: Data Minimization',
    level: 'info',
    message: 'Ensure only necessary personal data is collected and processed',
    suggestion: 'Document data retention policies and implement purging mechanisms',
  });

  // Privacy by Design
  violations.push({
    ruleId: 'compliance-privacy-bydesign',
    ruleName: 'Privacy-First: Privacy by Design',
    level: 'info',
    message: 'Privacy considerations should be built into architecture from the start',
    suggestion:
      'Implement Privacy Impact Assessment (PIA) and regular privacy audits',
  });

  return violations;
}

/**
 * Resilience & Fault Tolerance
 */
function checkResilience(nodes: any[]): ValidationViolation[] {
  const violations: ValidationViolation[] = [];

  // Circuit Breakers
  const hasCircuitBreaker = nodes.some(
    (n) =>
      (n.metadata?.description || '').toLowerCase().includes('circuit breaker') ||
      n.type === 'circuit-breaker'
  );

  if (!hasCircuitBreaker) {
    violations.push({
      ruleId: 'compliance-resilience-circuit-breaker',
      ruleName: 'Resilience: Circuit Breakers',
      level: 'warning',
      message: 'No circuit breaker detected - helps prevent cascading failures',
      suggestion: 'Implement circuit breakers for service dependencies',
    });
  }

  // Retries & Backoff
  violations.push({
    ruleId: 'compliance-resilience-retries',
    ruleName: 'Resilience: Retry Logic',
    level: 'info',
    message: 'Implement exponential backoff for transient failures',
    suggestion: 'Add retry policies with exponential backoff to service calls',
  });

  // Timeouts
  violations.push({
    ruleId: 'compliance-resilience-timeouts',
    ruleName: 'Resilience: Timeouts',
    level: 'warning',
    message: 'Set aggressive timeouts to prevent resource exhaustion',
    suggestion: 'Configure timeouts at all service boundaries',
  });

  // Bulkheads (Resource Isolation)
  violations.push({
    ruleId: 'compliance-resilience-bulkheads',
    ruleName: 'Resilience: Bulkheads',
    level: 'info',
    message: 'Isolate critical resources to prevent system-wide failures',
    suggestion:
      'Use thread pools, connection pools, and resource quotas to implement bulkheads',
  });

  // Health Checks
  const hasHealthChecks = nodes.some(
    (n) =>
      (n.metadata?.description || '').toLowerCase().includes('health') ||
      n.type === 'health-check'
  );

  if (!hasHealthChecks && nodes.length >= 3) {
    violations.push({
      ruleId: 'compliance-resilience-health-checks',
      ruleName: 'Resilience: Health Checks',
      level: 'warning',
      message: 'No explicit health checking - needed for automated recovery',
      suggestion: 'Implement liveness and readiness probes for all services',
    });
  }

  return violations;
}

/**
 * Known compliance frameworks
 */
export const COMPLIANCE_FRAMEWORKS: Record<string, ComplianceFramework> = {
  '12-factor': {
    id: '12-factor',
    name: '12-Factor App',
    description: 'Methodology for building SaaS applications',
    standards: [
      {
        id: 'codebase',
        name: 'Codebase',
        checks: [],
      },
      {
        id: 'dependencies',
        name: 'Dependencies',
        checks: [],
      },
      {
        id: 'config',
        name: 'Configuration',
        checks: [],
      },
      {
        id: 'backing-services',
        name: 'Backing Services',
        checks: [],
      },
    ],
  },
  'cloud-native': {
    id: 'cloud-native',
    name: 'Cloud Native',
    description: 'Cloud-native architecture principles',
    standards: [],
  },
  'privacy-first': {
    id: 'privacy-first',
    name: 'Privacy-First',
    description: 'Privacy and data protection architecture',
    standards: [],
  },
  'resilience': {
    id: 'resilience',
    name: 'Resilience & Fault Tolerance',
    description: 'Building resilient, fault-tolerant systems',
    standards: [],
  },
};
