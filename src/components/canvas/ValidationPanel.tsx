'use client';

import React, { useState } from 'react';
import { ChevronDown, AlertCircle, InfoIcon, CheckCircle } from 'lucide-react';
import { ValidationResult } from '@/lib/validators/validation-engine';

interface ValidationPanelProps {
  validationResult: ValidationResult | null;
  isLoading?: boolean;
  onClose?: () => void;
}

/**
 * ValidationPanel - Real-time validation feedback for ArchitectureCanvas
 * Shows errors, warnings, and info messages as users edit
 */
export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  validationResult,
  isLoading = false,
  onClose,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!validationResult || (validationResult.errors.length === 0 && validationResult.warnings.length === 0 && validationResult.info.length === 0)) {
    return null;
  }

  const hasErrors = validationResult.errors.length > 0;
  const hasWarnings = validationResult.warnings.length > 0;
  const hasInfo = validationResult.info.length > 0;

  const bgColor = hasErrors ? 'bg-red-50' : hasWarnings ? 'bg-amber-50' : 'bg-blue-50';
  const borderColor = hasErrors ? 'border-red-200' : hasWarnings ? 'border-amber-200' : 'border-blue-200';
  const titleColor = hasErrors ? 'text-red-900' : hasWarnings ? 'text-amber-900' : 'text-blue-900';
  const buttonBgColor = hasErrors ? 'bg-red-100 hover:bg-red-200' : hasWarnings ? 'bg-amber-100 hover:bg-amber-200' : 'bg-blue-100 hover:bg-blue-200';

  const getIcon = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
      case 'info':
        return <InfoIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />;
    }
  };

  const getAllMessages = () => {
    return [
      ...validationResult.errors.map(e => ({ ...e, severity: 'error' as const })),
      ...validationResult.warnings.map(w => ({ ...w, severity: 'warning' as const })),
      ...validationResult.info.map(i => ({ ...i, severity: 'info' as const })),
    ];
  };

  return (
    <div className={`absolute bottom-4 right-4 w-96 max-h-96 rounded-lg shadow-xl border-2 ${borderColor} ${bgColor} z-40 flex flex-col`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between border-b ${borderColor}`}>
        <div className="flex items-center gap-2">
          {hasErrors && (
            <>
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className={`font-semibold ${titleColor}`}>Validation Errors ({validationResult.errors.length})</span>
            </>
          )}
          {!hasErrors && hasWarnings && (
            <>
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className={`font-semibold ${titleColor}`}>Validation Warnings ({validationResult.warnings.length})</span>
            </>
          )}
          {!hasErrors && !hasWarnings && hasInfo && (
            <>
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className={`font-semibold ${titleColor}`}>Validation Info ({validationResult.info.length})</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1 rounded transition-colors ${buttonBgColor}`}
            aria-label="Toggle"
          >
            <ChevronDown
              className="w-4 h-4"
              style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}
            />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className={`p-1 rounded transition-colors ${buttonBgColor} text-slate-600 hover:text-slate-800`}
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {isExpanded && (
        <div className="overflow-y-auto max-h-80 px-4 py-3 space-y-3">
          {getAllMessages().length === 0 ? (
            <div className="flex items-center gap-2 text-slate-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">No issues found</span>
            </div>
          ) : (
            getAllMessages().map((msg, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-2 border-b border-slate-200 last:border-b-0">
                {getIcon(msg.severity)}
                <div className="flex-1">
                  <div className={`text-sm font-medium ${
                    msg.severity === 'error' ? 'text-red-900' : 
                    msg.severity === 'warning' ? 'text-amber-900' : 
                    'text-blue-900'
                  }`}>
                    {msg.message}
                  </div>
                  {msg.suggestion && (
                    <div className={`text-xs mt-1 ${
                      msg.severity === 'error' ? 'text-red-700' : 
                      msg.severity === 'warning' ? 'text-amber-700' : 
                      'text-blue-700'
                    }`}>
                      💡 {msg.suggestion}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Footer Stats */}
      <div className={`px-4 py-2 border-t ${borderColor} bg-opacity-50 flex gap-4 text-xs text-slate-600`}>
        {validationResult.errors.length > 0 && (
          <span className="text-red-700 font-medium">🔴 {validationResult.errors.length} Error{validationResult.errors.length !== 1 ? 's' : ''}</span>
        )}
        {validationResult.warnings.length > 0 && (
          <span className="text-amber-700 font-medium">🟡 {validationResult.warnings.length} Warning{validationResult.warnings.length !== 1 ? 's' : ''}</span>
        )}
        {validationResult.info.length > 0 && (
          <span className="text-blue-700 font-medium">ℹ️ {validationResult.info.length} Info{validationResult.info.length !== 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  );
};
