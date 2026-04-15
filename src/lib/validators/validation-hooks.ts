/**
 * Validation Hooks
 * React hooks for validation at runtime, especially for import/export operations
 */

'use client';

import { useCallback, useState } from 'react';
import {
  validationEngine,
  ValidationResult,
  Architecture,
  ArchitectureNode,
  ArchitectureEdge,
} from './validation-engine';
import { ExportFormat } from '../exporters';

export interface ValidationState {
  isValidating: boolean;
  result: ValidationResult | null;
  error: string | null;
}

/**
 * Hook for validating architecture data
 */
export function useArchitectureValidation() {
  const [state, setState] = useState<ValidationState>({
    isValidating: false,
    result: null,
    error: null,
  });

  const validate = useCallback((architecture: Architecture) => {
    setState({ isValidating: true, result: null, error: null });

    try {
      const result = validationEngine.validateArchitecture(architecture);
      setState({ isValidating: false, result, error: null });
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown validation error';
      setState({ isValidating: false, result: null, error: errorMsg });
      return {
        valid: false,
        errors: [
          {
            code: 'VALIDATION_ERROR',
            severity: 'error' as const,
            message: errorMsg,
          },
        ],
        warnings: [],
        info: [],
      };
    }
  }, []);

  return { ...state, validate };
}

/**
 * Hook for validating nodes
 */
export function useNodeValidation() {
  const [state, setState] = useState<ValidationState>({
    isValidating: false,
    result: null,
    error: null,
  });

  const validate = useCallback((node: ArchitectureNode) => {
    setState({ isValidating: true, result: null, error: null });

    try {
      const result = validationEngine.validateNode(node);
      setState({ isValidating: false, result, error: null });
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown validation error';
      setState({ isValidating: false, result: null, error: errorMsg });
      return {
        valid: false,
        errors: [
          {
            code: 'VALIDATION_ERROR',
            severity: 'error' as const,
            message: errorMsg,
          },
        ],
        warnings: [],
        info: [],
      };
    }
  }, []);

  return { ...state, validate };
}

/**
 * Hook for validating edges
 */
export function useEdgeValidation() {
  const [state, setState] = useState<ValidationState>({
    isValidating: false,
    result: null,
    error: null,
  });

  const validate = useCallback((edge: ArchitectureEdge, nodes: ArchitectureNode[]) => {
    setState({ isValidating: true, result: null, error: null });

    try {
      const result = validationEngine.validateEdge(edge, nodes);
      setState({ isValidating: false, result, error: null });
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown validation error';
      setState({ isValidating: false, result: null, error: errorMsg });
      return {
        valid: false,
        errors: [
          {
            code: 'VALIDATION_ERROR',
            severity: 'error' as const,
            message: errorMsg,
          },
        ],
        warnings: [],
        info: [],
      };
    }
  }, []);

  return { ...state, validate };
}

/**
 * Hook for validating import data
 */
export function useImportValidation() {
  const [state, setState] = useState<ValidationState>({
    isValidating: false,
    result: null,
    error: null,
  });

  const validate = useCallback((format: ExportFormat, content: string) => {
    setState({ isValidating: true, result: null, error: null });

    try {
      const result = validationEngine.validateByFormat(format, content);
      setState({ isValidating: false, result, error: null });
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown validation error';
      setState({ isValidating: false, result: null, error: errorMsg });
      return {
        valid: false,
        errors: [
          {
            code: 'VALIDATION_ERROR',
            severity: 'error' as const,
            message: errorMsg,
          },
        ],
        warnings: [],
        info: [],
      };
    }
  }, []);

  return { ...state, validate };
}

/**
 * Hook for validating export data
 */
export function useExportValidation() {
  const [state, setState] = useState<ValidationState>({
    isValidating: false,
    result: null,
    error: null,
  });

  const validate = useCallback((format: ExportFormat, content: string) => {
    setState({ isValidating: true, result: null, error: null });

    try {
      // For now, use import validation (same rules)
      // In future, could use format-specific exporters to re-export and validate
      const result = validationEngine.validateByFormat(format, content);
      setState({ isValidating: false, result, error: null });
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown validation error';
      setState({ isValidating: false, result: null, error: errorMsg });
      return {
        valid: false,
        errors: [
          {
            code: 'VALIDATION_ERROR',
            severity: 'error' as const,
            message: errorMsg,
          },
        ],
        warnings: [],
        info: [],
      };
    }
  }, []);

  return { ...state, validate };
}

/**
 * Utility function: Check if validation result has errors
 */
export function hasValidationErrors(result: ValidationResult | null): boolean {
  return !result || !result.valid || result.errors.length > 0;
}

/**
 * Utility function: Check if validation result has warnings
 */
export function hasValidationWarnings(result: ValidationResult | null): boolean {
  return result ? result.warnings.length > 0 : false;
}

/**
 * Utility function: Get formatted validation message for display
 */
export function getValidationMessage(result: ValidationResult | null): string {
  if (!result) return '';

  if (result.valid && result.errors.length === 0) {
    if (result.warnings.length > 0) {
      return `✅ Valid (${result.warnings.length} warning(s))`;
    }
    if (result.info.length > 0) {
      return `✅ Valid (${result.info.length} info)`;
    }
    return '✅ Valid';
  }

  if (result.errors.length > 0) {
    return `❌ ${result.errors.length} error(s)${result.warnings.length > 0 ? `, ${result.warnings.length} warning(s)` : ''}`;
  }

  return 'Unknown validation state';
}

/**
 * Utility function: Get first error message
 */
export function getFirstErrorMessage(result: ValidationResult | null): string | null {
  if (!result || result.errors.length === 0) return null;
  return result.errors[0].message;
}

/**
 * Utility function: Get all error messages
 */
export function getAllErrorMessages(result: ValidationResult | null): string[] {
  if (!result) return [];
  return result.errors.map((e) => e.message);
}
