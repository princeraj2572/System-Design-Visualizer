/**
 * Validators Module - Index
 * Exports all validation systems and utilities
 */

// Legacy validation system
export { ArchitectureValidator, createValidator, default } from './architecture-validator';
export type {
  ValidationRule,
  ValidationResult,
  ValidationViolation,
  ValidationLevel,
  ValidationCategory,
  ValidationConfig,
  ArchitecturePattern,
  ComplianceFramework,
  SOLIDPrincipleCheckResult,
  ArchitectureMetrics,
} from './types';
export { getBuiltInRules } from './rule-builder';
export { detectArchitecturePatterns, PATTERNS } from './pattern-detector';
export { validateSOLIDPrinciples } from './solid-validator';
export { checkComplianceStandards, COMPLIANCE_FRAMEWORKS } from './compliance-checker';

// Phase 8 Validation Engine - Import/Export/Architecture Validation
export {
  ValidationEngine,
  validationEngine,
  type ValidationError,
  type ValidationResult as ValidationEngineResult,
  type ArchitectureNode,
  type ArchitectureEdge,
  type Architecture,
} from './validation-engine';

export {
  useArchitectureValidation,
  useNodeValidation,
  useEdgeValidation,
  useImportValidation,
  useExportValidation,
  hasValidationErrors,
  hasValidationWarnings,
  getValidationMessage,
  getFirstErrorMessage,
  getAllErrorMessages,
  type ValidationState,
} from './validation-hooks';

export { validationTests, generateValidationTestSummary } from './validation-tests';
