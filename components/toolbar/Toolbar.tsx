'use client';

import { useRef, useCallback, useState } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import {
  exportToJSON,
  exportToPNG,
  importFromJSON,
  saveProjectToLocalStorage,
  loadProjectsFromLocalStorage,
} from '@/utils/export';
import type { ValidationIssue } from '@/types';

export default function Toolbar() {
  const {
    projectName,
    setProjectName,
    getProject,
    loadProject,
    clearCanvas,
    undo,
    redo,
    history,
    future,
    validate,
    dismissValidation,
    validationIssues,
    showValidation,
    theme,
    toggleTheme,
  } = useCanvasStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = useCallback(() => {
    const project = getProject();
    saveProjectToLocalStorage(project);
    showToast(`"${project.name}" saved`);
  }, [getProject]);

  const handleLoad = useCallback(() => {
    const saved = loadProjectsFromLocalStorage();
    if (saved.length === 0) {
      showToast('No saved projects found');
      return;
    }
    const names = saved.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
    const choice = window.prompt(`Saved projects:\n${names}\n\nEnter number to load:`);
    if (!choice) return;
    const idx = parseInt(choice, 10) - 1;
    if (isNaN(idx) || idx < 0 || idx >= saved.length) {
      showToast('Invalid selection');
      return;
    }
    loadProject(saved[idx]);
    showToast(`Loaded "${saved[idx].name}"`);
  }, [loadProject]);

  const handleExportJSON = useCallback(() => {
    exportToJSON(getProject());
  }, [getProject]);

  const handleExportPNG = useCallback(async () => {
    showToast('Exporting PNG…');
    await exportToPNG('architecture-canvas', projectName);
  }, [projectName]);

  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const project = await importFromJSON(file);
        loadProject(project);
        showToast(`Imported "${project.name}"`);
      } catch {
        showToast('Import failed — invalid file');
      }
      e.target.value = '';
    },
    [loadProject]
  );

  const handleClear = useCallback(() => {
    if (window.confirm('Clear the entire canvas? This can be undone.')) {
      clearCanvas();
    }
  }, [clearCanvas]);

  return (
    <header className="h-11 flex-shrink-0 bg-gray-900 border-b border-gray-700/50 flex items-center px-3 gap-1 relative z-20">
      {/* Brand */}
      <div className="flex items-center gap-1.5 mr-2 flex-shrink-0">
        <span className="text-base">🏗️</span>
        <span className="text-sm font-bold text-white tracking-tight">SysVis</span>
      </div>

      <div className="h-4 w-px bg-gray-700 mx-1" />

      {/* Project name */}
      <input
        type="text"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        className="bg-transparent border-b border-gray-700 hover:border-gray-500 focus:border-blue-500
          px-1 py-0.5 text-xs font-medium text-white w-44
          focus:outline-none transition-colors"
      />

      <div className="h-4 w-px bg-gray-700 mx-1" />

      {/* Undo / Redo */}
      <Btn onClick={undo} disabled={history.length === 0} title="Undo (Del node: Delete key)">
        ↩ Undo
      </Btn>
      <Btn onClick={redo} disabled={future.length === 0} title="Redo">
        ↪ Redo
      </Btn>

      <div className="h-4 w-px bg-gray-700 mx-1" />

      {/* File ops */}
      <Btn onClick={handleSave} title="Save to browser storage">💾 Save</Btn>
      <Btn onClick={handleLoad} title="Load saved project">📂 Load</Btn>
      <Btn onClick={handleExportJSON} title="Download as JSON">⬇ JSON</Btn>
      <Btn onClick={handleExportPNG} title="Download as PNG">🖼 PNG</Btn>
      <label className="px-2 py-1 rounded text-xs text-gray-500 hover:text-white hover:bg-gray-800 cursor-pointer transition-all duration-150">
        ⬆ Import
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
      </label>

      <div className="h-4 w-px bg-gray-700 mx-1" />

      <Btn onClick={validate} title="Check for architecture issues">✅ Validate</Btn>
      <Btn onClick={handleClear} title="Clear canvas">🗑 Clear</Btn>

      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="px-2 py-1 rounded text-xs text-gray-500 hover:text-white hover:bg-gray-800 transition-all duration-150"
        title="Toggle light/dark mode"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 text-gray-200 text-xs px-3 py-1.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* Validation panel */}
      {showValidation && (
        <ValidationPanel issues={validationIssues} onClose={dismissValidation} />
      )}
    </header>
  );
}

function Btn({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="px-2 py-1 rounded text-xs text-gray-500 hover:text-white hover:bg-gray-800
        disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150 whitespace-nowrap"
    >
      {children}
    </button>
  );
}

function ValidationPanel({
  issues,
  onClose,
}: {
  issues: ValidationIssue[];
  onClose: () => void;
}) {
  return (
    <div className="absolute top-12 right-3 z-50 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-700">
        <span className="text-xs font-semibold text-white">Validation Results</span>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none">
          ×
        </button>
      </div>
      <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
        {issues.length === 0 ? (
          <p className="text-xs text-green-400">✅ No issues found — architecture looks good!</p>
        ) : (
          issues.map((issue, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg ${
                issue.severity === 'error'
                  ? 'bg-red-900/30 text-red-300 border border-red-900/40'
                  : 'bg-yellow-900/20 text-yellow-300 border border-yellow-900/30'
              }`}
            >
              <span className="flex-shrink-0 mt-0.5">
                {issue.severity === 'error' ? '❌' : '⚠️'}
              </span>
              <span>{issue.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
