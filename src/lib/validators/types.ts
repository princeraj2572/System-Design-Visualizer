/**
 * Validation Types & Interfaces
 * Defines all validation rule structures and result types
 */

export type ValidationLevel = 'error' | 'warning' | 'info';
export type ValidationCategory = 'architecture' | 'performance' | 'security' | 'best-practice' | 'pattern';

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: ValidationCategory;
  level: ValidationLevel;
  enabled: boolean;
  custom: boolean;
  checkFunction: (nodes: any[], edges: any[]) => ValidationViolation[];
}

export interface ValidationViolation {
  ruleId: string;
  ruleName: string;
  level: ValidationLevel;
  message: string;
  nodeIds?: string[];
  edgeIds?: string[];
  suggestion?: string;
  details?: Record<string, any>;
}

export interface ValidationResult {
  violations: ValidationViolation[];
  passed: boolean;
  summary: {
    total: number;
    errors: number;
    warnings: number;
    info: number;
  };
  timestamp: number;
  duration: number;
}

export interface ArchitecturePattern {
  id: string;
  name: string;
  description: string;
  detectionRules: PatternDetectionRule[];
  recommendations: string[];
  antiPatterns: string[];
}

export interface PatternDetectionRule {
  matcher: (nodes: any[], edges: any[]) => boolean;
  confidence: number; // 0-1
}

export interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  standards: ComplianceStandard[];
}

export interface ComplianceStandard {
  id: string;
  name: string;
  checks: ComplianceCheck[];
}

export interface ComplianceCheck {
  id: string;
  requirement: string;
  validator: (nodes: any[], edges: any[]) => boolean;
  remediation: string;
}

export interface SOLIDPrincipleCheckResult {
  principle: 'S' | 'O' | 'L' | 'I' | 'D';
  name: string;
  violated: boolean;
  issues: string[];
  score: number; // 0-100
}

export interface ArchitectureMetrics {
  complexity: number;
  coupling: number;
  cohesion: number;
  modularity: number;
  scalabilityScore: number;
  securityScore: number;
}

export interface ValidationConfig {
  enabledRules: string[];
  enabledFrameworks: string[];
  enabledPatterns: string[];
  strictMode: boolean;
  failOnWarnings: boolean;
  customRules?: ValidationRule[];
}
