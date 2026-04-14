/**
 * Import Dialog Component
 */

import { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { parseJSONImport, parseYAMLImport, ImportResult } from '@/lib/import-service';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (data: any) => void;
}

export function ImportDialog({ isOpen, onClose, onImportSuccess }: ImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [pasteContent, setPasteContent] = useState('');
  const [importMode, setImportMode] = useState<'file' | 'paste'>('file');

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsImporting(true);

    try {
      const content = await file.text();
      const filename = file.name.toLowerCase();

      let result: ImportResult;
      if (filename.endsWith('.json')) {
        result = parseJSONImport(content);
      } else if (filename.endsWith('.yaml') || filename.endsWith('.yml')) {
        result = parseYAMLImport(content);
      } else {
        result = {
          success: false,
          errors: [`Unsupported file format: ${filename}`],
          warnings: [],
        };
      }

      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: false,
        errors: [`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handlePaste = () => {
    if (!pasteContent.trim()) return;

    setIsImporting(true);
    const result = pasteContent.trim().startsWith('{')
      ? parseJSONImport(pasteContent)
      : parseYAMLImport(pasteContent);

    setImportResult(result);
    setIsImporting(false);
  };

  const handleConfirmImport = () => {
    if (importResult?.success && importResult.project) {
      onImportSuccess(importResult.project);
      handleClose();
    }
  };

  const handleClose = () => {
    setImportResult(null);
    setPasteContent('');
    setImportMode('file');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Import Project</h2>
          <p className="text-sm text-gray-600 mt-1">
            Upload a JSON or YAML export file to import a saved architecture
          </p>
        </div>

        {!importResult ? (
          <div className="p-6 space-y-6">
            {/* Mode selector */}
            <div className="flex gap-4">
              <button
                onClick={() => setImportMode('file')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                  importMode === 'file'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => setImportMode('paste')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                  importMode === 'paste'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                Paste Content
              </button>
            </div>

            {importMode === 'file' && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileSelect(e.dataTransfer.files);
                }}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-700 font-medium">Drag and drop your file here</p>
                <p className="text-xs text-gray-500 mt-1">or click to select</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.yaml,.yml"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Select File
                </button>
              </div>
            )}

            {importMode === 'paste' && (
              <div className="space-y-3">
                <textarea
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder="Paste your JSON or YAML content here..."
                  className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handlePaste}
                  disabled={isImporting || !pasteContent.trim()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  {isImporting ? 'Importing...' : 'Import'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* Import result */}
            {importResult.success ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-900">Import Successful</h3>
                    <p className="text-sm text-green-800 mt-1">
                      Ready to import: <strong>{importResult.project?.name}</strong>
                    </p>
                  </div>
                </div>

                {/* Project summary */}
                {importResult.project && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-600">Components:</span>{' '}
                      <span className="font-medium">{importResult.project.nodes.length}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Connections:</span>{' '}
                      <span className="font-medium">{importResult.project.edges.length}</span>
                    </p>
                    {importResult.project.groups && importResult.project.groups.length > 0 && (
                      <p className="text-sm">
                        <span className="text-gray-600">Groups:</span>{' '}
                        <span className="font-medium">{importResult.project.groups.length}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Warnings */}
                {importResult.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-1">
                    <p className="text-sm font-medium text-yellow-900">Warnings:</p>
                    {importResult.warnings.map((warning, idx) => (
                      <p key={idx} className="text-xs text-yellow-800">
                        • {warning}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-900">Import Failed</h3>
                    {importResult.errors.length > 0 && (
                      <ul className="text-sm text-red-800 mt-2 space-y-1">
                        {importResult.errors.map((error, idx) => (
                          <li key={idx}>• {error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          {importResult?.success ? (
            <button
              onClick={handleConfirmImport}
              disabled={isImporting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
            >
              {isImporting ? 'Importing...' : 'Confirm Import'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
