/**
 * Architecture Validation Engine
 * Core validator coordinating all validation types
 */

import {
  ValidationRule,
  ValidationResult,
  ValidationViolation,
  ValidationConfig,
  ValidationLevel,
} from './types';
import { getBuiltInRules } from './rule-builder';
import { detectArchitecturePatterns } from './pattern-detector';
import { checkComplianceStandards } from './compliance-checker';
import { validateSOLIDPrinciples } from './solid-validator';

export class ArchitectureValidator {
  private rules: Map<string, ValidationRule> = new Map();
  private config: ValidationConfig;

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = {
      enabledRules: [],
      enabledFrameworks: [],
      enabledPatterns: [],
      strictMode: false,
      failOnWarnings: false,
      ...config,
    };

    // Load built-in rules
    this.loadBuiltInRules();
  }

  /**
   * Load all built-in validation rules
   */
  private loadBuiltInRules(): void {
    const builtInRules = getBuiltInRules();
    builtInRules.forEach((rule) => {
      this.rules.set(rule.id, rule);
    });
  }

  /**
   * Add custom validation rule
   */
  addCustomRule(rule: ValidationRule): void {
    rule.custom = true;
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove validation rule
   */
  removeRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule && !rule.custom) {
      console.warn(`Cannot remove built-in rule: ${ruleId}`);
      return;
    }
    this.rules.delete(ruleId);
  }

  /**
   * Enable/disable rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  /**
   * Get all available rules
   */
  getAllRules(): ValidationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Validate architecture, checking all configured validators
   */
  validate(nodes: any[], edges: any[]): ValidationResult {
    const startTime = Date.now();
    const violations: ValidationViolation[] = [];

    // Run enabled validation rules
    const enabledRules = Array.from(this.rules.values()).filter((r) => r.enabled);
    for (const rule of enabledRules) {
      try {
        const ruleViolations = rule.checkFunction(nodes, edges);
        violations.push(...ruleViolations);
      } catch (error) {
        console.error(`Error running rule ${rule.id}:`, error);
        violations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          level: 'error',
          message: `Validation rule failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: { error: String(error) },
        });
      }
    }

    // Run pattern detection
    if (this.config.enabledPatterns.length > 0) {
      try {
        const patternResults = detectArchitecturePatterns(nodes, edges);
        violations.push(...patternResults);
      } catch (error) {
        console.error('Pattern detection failed:', error);
      }
    }

    // Run compliance checks
    if (this.config.enabledFrameworks.length > 0) {
      try {
        const complianceResults = checkComplianceStandards(
          nodes,
          this.config.enabledFrameworks
        );
        violations.push(...complianceResults);
      } catch (error) {
        console.error('Compliance check failed:', error);
      }
    }

    // Run SOLID principles validation
    try {
      const solidResults = validateSOLIDPrinciples(nodes, edges);
      violations.push(
        ...solidResults
          .filter((r) => r.violated)
          .map((r) => ({
            ruleId: `solid-${r.principle}`,
            ruleName: `SOLID: ${r.name}`,
            level: 'warning' as ValidationLevel,
            message: r.issues.join('; '),
            details: { score: r.score },
          }))
      );
    } catch (error) {
      console.error('SOLID validation failed:', error);
    }

    // Filter and sort violations
    let filteredViolations = violations;

    if (!this.config.strictMode) {
      // Remove duplicates
      filteredViolations = this.deduplicateViolations(violations);
    }

    if (!this.config.failOnWarnings) {
      // Still report but don't fail validation
      filteredViolations = filteredViolations.filter((v) => v.level === 'error');
    }

    // Sort by severity
    filteredViolations.sort((a, b) => {
      const levelOrder = { error: 0, warning: 1, info: 2 };
      return levelOrder[a.level] - levelOrder[b.level];
    });

    const duration = Date.now() - startTime;
    const summary = this.summarizeViolations(filteredViolations);

    return {
      violations: filteredViolations,
      passed: summary.errors === 0 && (summary.warnings === 0 || !this.config.failOnWarnings),
      summary,
      timestamp: Date.now(),
      duration,
    };
  }

  /**
   * Deduplicate violations by ruleId and nodeIds
   */
  private deduplicateViolations(violations: ValidationViolation[]): ValidationViolation[] {
    const seen = new Set<string>();
    return violations.filter((v) => {
      const key = `${v.ruleId}-${(v.nodeIds || []).sort().join(',')}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Summarize violations by level
   */
  private summarizeViolations(violations: ValidationViolation[]) {
    return {
      total: violations.length,
      errors: violations.filter((v) => v.level === 'error').length,
      warnings: violations.filter((v) => v.level === 'warning').length,
      info: violations.filter((v) => v.level === 'info').length,
    };
  }

  /**
   * Get validation report as formatted string
   */
  getReportAsText(result: ValidationResult): string {
    let report = '=== Architecture Validation Report ===\n\n';
    report += `Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
    report += `Duration: ${result.duration}ms\n`;
    report += `Time: ${new Date(result.timestamp).toISOString()}\n\n`;

    report += `Summary:\n`;
    report += `  Total Issues: ${result.summary.total}\n`;
    report += `  Errors: ${result.summary.errors}\n`;
    report += `  Warnings: ${result.summary.warnings}\n`;
    report += `  Info: ${result.summary.info}\n\n`;

    if (result.violations.length === 0) {
      report += 'No violations found!\n';
    } else {
      report += 'Violations:\n';
      result.violations.forEach((v, i) => {
        report += `\n${i + 1}. [${v.level.toUpperCase()}] ${v.ruleName}\n`;
        report += `   Message: ${v.message}\n`;
        if (v.suggestion) {
          report += `   Suggestion: ${v.suggestion}\n`;
        }
        if (v.nodeIds?.length) {
          report += `   Affected Nodes: ${v.nodeIds.join(', ')}\n`;
        }
      });
    }

    return report;
  }
}

/**
 * Create and export default validator instance
 */
export const createValidator = (config?: Partial<ValidationConfig>): ArchitectureValidator => {
  return new ArchitectureValidator(config);
};

export default ArchitectureValidator;
