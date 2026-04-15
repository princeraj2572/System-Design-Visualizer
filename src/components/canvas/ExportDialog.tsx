'use client';

import React, { useState } from 'react';
import { X, Copy, Download, Info } from 'lucide-react';
import {
  exportArchitecture,
  getSupportedFormats,
  ExportFormat,
} from '@/lib/exporters';
import { downloadFile, copyToClipboard } from '@/lib/exporters/export-utils';
import { useArchitectureValidation } from '@/lib/validators/validation-hooks';
import { ValidationBanner } from '@/components/validation/ValidationMessages';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: any[];
  edges: any[];
  projectName?: string;
}

/**
 * ExportDialog - Multi-format export dialog with live preview
 */
export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
  projectName = 'architecture',
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('yaml');
  const [exportContent, setExportContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { validate: validateArchitecture, result: validationResult } = useArchitectureValidation();

  // Generate export when format changes
  React.useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate architecture before export
      const validation = validateArchitecture({ nodes, edges });
      
      if (!validation.valid) {
        setError('Validation failed: ' + validation.errors.map(e => e.message).join(', '));
        setExportContent('');
        setIsLoading(false);
        return;
      }

      const result = exportArchitecture(selectedFormat, nodes, edges, projectName);
      setExportContent(result.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      setExportContent('');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFormat, isOpen, nodes, edges, projectName, validateArchitecture]);

  const handleCopy = async () => {
    if (exportContent) {
      const success = await copyToClipboard(exportContent);
      if (success) {
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      }
    }
  };

  const handleDownload = () => {
    if (exportContent) {
      const extensionMap: Record<ExportFormat, string> = {
        yaml: 'yaml',
        plantuml: 'puml',
        terraform: 'tf',
        cloudformation: 'json',
        mermaid: 'mmd',
        c4: 'puml',
      };
      const extension = extensionMap[selectedFormat] || 'txt';
      downloadFile(exportContent, `architecture-export-${Date.now()}.${extension}`);
    }
  };

  if (!isOpen) return null;

  const supportedFormats = getSupportedFormats();
  const currentFormat = supportedFormats.find((f) => f.id === selectedFormat);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-11/12 h-5/6 max-w-6xl flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900">Export Architecture</h2>
            <p className="text-sm text-slate-500 mt-1">{projectName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition p-2"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Format Info Banner */}
        {currentFormat && (
          <div className="px-8 py-4 bg-cyan-50 border-b border-cyan-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-cyan-900">{currentFormat.name}</p>
              <p className="text-sm text-cyan-800 mt-1">{currentFormat.description}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Format Tabs */}
          <div className="w-48 border-r border-slate-200 bg-slate-50 overflow-y-auto">
            <div className="p-4 space-y-2">
              {supportedFormats.map((format) => {
                return (
                  <button
                    key={format.id}
                    onClick={() => {
                      setSelectedFormat(format.id as ExportFormat);
                      // Trigger export when format changes
                      setIsLoading(true);
                      setError(null);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                      selectedFormat === format.id
                        ? 'bg-cyan-100 text-cyan-900 border-2 border-cyan-500'
                        : 'text-slate-700 hover:bg-slate-100 border-2 border-transparent'
                    }`}
                  >
                    <span className="text-lg w-4 flex-shrink-0">{format.icon}</span>
                    <span className="text-sm font-medium truncate">{format.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center - Preview Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {validationResult && !validationResult.valid && (
              <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                <ValidationBanner result={validationResult} />
              </div>
            )}
            
            {error && (
              <div className="p-4 bg-red-50 border-b border-red-200 text-red-800 text-sm">
                <p className="font-semibold">Export Error</p>
                <p className="mt-1">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 mb-4">
                    <div className="w-6 h-6 border-2 border-cyan-300 border-t-cyan-600 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-slate-600">Generating export...</p>
                </div>
              </div>
            ) : (
              <textarea
                value={exportContent}
                readOnly
                className="flex-1 p-6 font-mono text-sm text-slate-700 bg-white border-0 focus:outline-none resize-none"
                style={{ fontFamily: 'Fira Code, Monaco, Courier New, monospace' }}
                spellCheck="false"
              />
            )}
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="px-8 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 transition font-medium"
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            disabled={isLoading || !exportContent}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:bg-slate-300 transition font-medium flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            {copyFeedback ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            disabled={isLoading || !exportContent}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-cyan-300 transition font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
