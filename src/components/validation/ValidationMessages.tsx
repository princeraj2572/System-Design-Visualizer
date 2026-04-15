/**
 * Validation Error UI Components
 * Display validation errors, warnings, and info messages to users
 */

'use client';

import React from 'react';
import { ValidationError } from '@/lib/validators/validation-engine';
import type { ValidationResult } from '@/lib/validators/validation-engine';

interface ValidationMessageProps {
  error: ValidationError;
  onDismiss?: () => void;
}

/**
 * Single validation error message
 */
export function ValidationMessage({ error, onDismiss }: ValidationMessageProps) {
  const getSeverityIcon = () => {
    switch (error.severity) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '•';
    }
  };

  const getSeverityColor = () => {
    switch (error.severity) {
      case 'error':
        return 'border-red-500 bg-red-50 dark:bg-red-950';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      case 'info':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-900';
    }
  };

  const getSeverityTextColor = () => {
    switch (error.severity) {
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'text-blue-800 dark:text-blue-200';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className={`border-l-4 ${getSeverityColor()} p-3 rounded flex items-start gap-3`}>
      <span className="text-lg flex-shrink-0">{getSeverityIcon()}</span>
      <div className="flex-1 min-w-0">
        <div className={`font-mono text-sm font-semibold ${getSeverityTextColor()}`}>
          [{error.code}]
        </div>
        <p className={`text-sm ${getSeverityTextColor()} mt-1`}>{error.message}</p>
        {error.line && (
          <p className={`text-xs ${getSeverityTextColor()} opacity-75 mt-1`}>Line {error.line}</p>
        )}
        {error.field && (
          <p className={`text-xs ${getSeverityTextColor()} opacity-75 mt-1`}>Field: {error.field}</p>
        )}
        {error.suggestion && (
          <p className={`text-xs ${getSeverityTextColor()} opacity-90 mt-2 italic border-l-2 border-current pl-2`}>
            💡 {error.suggestion}
          </p>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`flex-shrink-0 text-xl leading-none ${getSeverityTextColor()} hover:opacity-70 transition-opacity`}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}

interface ValidationMessageListProps {
  result: ValidationResult;
  showErrors?: boolean;
  showWarnings?: boolean;
  showInfo?: boolean;
  onDismissError?: (index: number) => void;
  onDismissWarning?: (index: number) => void;
  onDismissInfo?: (index: number) => void;
}

/**
 * List of validation messages
 */
export function ValidationMessageList({
  result,
  showErrors = true,
  showWarnings = true,
  showInfo = false,
  onDismissError,
  onDismissWarning,
  onDismissInfo,
}: ValidationMessageListProps) {
  if (result.valid && result.errors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {showErrors &&
        result.errors.map((error, index) => (
          <ValidationMessage
            key={`error-${index}`}
            error={error}
            onDismiss={onDismissError ? () => onDismissError(index) : undefined}
          />
        ))}
      {showWarnings &&
        result.warnings.map((warning, index) => (
          <ValidationMessage
            key={`warning-${index}`}
            error={warning}
            onDismiss={onDismissWarning ? () => onDismissWarning(index) : undefined}
          />
        ))}
      {showInfo &&
        result.info.map((info, index) => (
          <ValidationMessage
            key={`info-${index}`}
            error={info}
            onDismiss={onDismissInfo ? () => onDismissInfo(index) : undefined}
          />
        ))}
    </div>
  );
}

interface ValidationSummaryProps {
  result: ValidationResult;
  showSummary?: boolean;
  expandByDefault?: boolean;
}

/**
 * Validation Summary card
 */
export function ValidationSummary({
  result,
  showSummary = true,
  expandByDefault = false,
}: ValidationSummaryProps) {
  const [expanded, setExpanded] = React.useState(expandByDefault);

  const errorCount = result.errors.length;
  const warningCount = result.warnings.length;
  const infoCount = result.info.length;
  const totalIssues = errorCount + warningCount + infoCount;

  if (!showSummary || totalIssues === 0) {
    return null;
  }

  const getStatusColor = () => {
    if (errorCount > 0) return 'text-red-600 dark:text-red-400';
    if (warningCount > 0) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getBackgroundColor = () => {
    if (errorCount > 0) return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
    if (warningCount > 0) return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
    return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
  };

  return (
    <div className={`border rounded-lg p-4 ${getBackgroundColor()} transition-all`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between cursor-pointer ${getStatusColor()} font-semibold hover:opacity-80 transition-opacity`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">
            {errorCount > 0 ? '❌' : warningCount > 0 ? '⚠️' : '✅'}
          </span>
          <span>
            {errorCount > 0
              ? `${errorCount} error${errorCount !== 1 ? 's' : ''}`
              : warningCount > 0
                ? `${warningCount} warning${warningCount !== 1 ? 's' : ''}`
                : 'All valid'}
          </span>
          {warningCount > 0 && errorCount === 0 && <span className="text-sm opacity-75">({warningCount})</span>}
        </div>
        <span className="text-lg">{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-2">
          {errorCount > 0 && (
            <div>
              <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">Errors</h4>
              <div className="space-y-1">
                {result.errors.map((error, index) => (
                  <div key={`error-${index}`} className="text-sm text-red-600 dark:text-red-400">
                    • {error.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {warningCount > 0 && (
            <div>
              <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Warnings</h4>
              <div className="space-y-1">
                {result.warnings.map((warning, index) => (
                  <div key={`warning-${index}`} className="text-sm text-yellow-600 dark:text-yellow-400">
                    • {warning.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {infoCount > 0 && (
            <div>
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Info</h4>
              <div className="space-y-1">
                {result.info.map((info, index) => (
                  <div key={`info-${index}`} className="text-sm text-blue-600 dark:text-blue-400">
                    • {info.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ValidationBannerProps {
  result: ValidationResult | null;
  onDismiss?: () => void;
}

/**
 * Full-width validation banner (for errors)
 */
export function ValidationBanner({ result, onDismiss }: ValidationBannerProps) {
  if (!result || (result.valid && result.errors.length === 0)) {
    return null;
  }

  return (
    <div className="bg-red-100 dark:bg-red-950 border-b-2 border-red-500 dark:border-red-700 p-4">
      <div className="max-w-full mx-auto flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-red-800 dark:text-red-200 mb-2">Validation Failed</h3>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            {result.errors.slice(0, 3).map((error, index) => (
              <li key={`error-${index}`}>
                <span className="font-mono text-xs text-red-600 dark:text-red-400">[{error.code}]</span> {error.message}
              </li>
            ))}
          </ul>
          {result.errors.length > 3 && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              +{result.errors.length - 3} more error{result.errors.length - 3 !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-2xl text-red-600 dark:text-red-400 hover:opacity-70 transition-opacity leading-none"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

interface ValidationIndicatorProps {
  result: ValidationResult | null;
  compact?: boolean;
}

/**
 * Compact validation indicator (for status display)
 */
export function ValidationIndicator({ result, compact = true }: ValidationIndicatorProps) {
  if (!result) {
    return <span className="text-gray-500">-</span>;
  }

  if (result.valid && result.errors.length === 0) {
    return (
      <span className="text-green-600 dark:text-green-400 font-semibold">
        {compact ? '✓' : '✓ Valid'}
      </span>
    );
  }

  const errorCount = result.errors.length;
  const warningCount = result.warnings.length;

  if (errorCount > 0) {
    return (
      <span className="text-red-600 dark:text-red-400 font-semibold">
        {compact ? `✗ ${errorCount}` : `✗ ${errorCount} error${errorCount !== 1 ? 's' : ''}`}
      </span>
    );
  }

  if (warningCount > 0) {
    return (
      <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
        {compact ? `⚠ ${warningCount}` : `⚠ ${warningCount} warning${warningCount !== 1 ? 's' : ''}`}
      </span>
    );
  }

  return <span className="text-gray-500">−</span>;
}
