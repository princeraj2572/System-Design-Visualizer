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

// ── Inline SVG icons ──────────────────────────────────────────────────────────
function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5 flex-shrink-0"
    >
      {children}
    </svg>
  );
}

const UndoIcon = () => (
  <Icon>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
  </Icon>
);
const RedoIcon = () => (
  <Icon>
    <path d="m15 14 5-5-5-5" />
    <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13" />
  </Icon>
);
const SaveIcon = () => (
  <Icon>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </Icon>
);
const FolderIcon = () => (
  <Icon>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </Icon>
);
const CodeIcon = () => (
  <Icon>
    <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1" />
    <path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />
  </Icon>
);
const ImageIcon = () => (
  <Icon>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </Icon>
);
const UploadIcon = () => (
  <Icon>
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </Icon>
);
const ValidateIcon = () => (
  <Icon>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </Icon>
);
const TrashIcon = () => (
  <Icon>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </Icon>
);
const SunIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </Icon>
);
const MoonIcon = () => (
  <Icon>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </Icon>
);

// ── Brand mark ────────────────────────────────────────────────────────────────
function BrandMark() {
  return (
    <div className="flex items-center gap-2 mr-2 select-none flex-shrink-0">
      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
          <circle cx="3" cy="8" r="1.75" stroke="white" strokeWidth="1.25" />
          <circle cx="13" cy="3.5" r="1.5" stroke="white" strokeWidth="1.25" />
          <circle cx="13" cy="12.5" r="1.5" stroke="white" strokeWidth="1.25" />
          <line x1="4.75" y1="7.2" x2="11.5" y2="4.5" stroke="white" strokeWidth="1" opacity="0.85" />
          <line x1="4.75" y1="8.8" x2="11.5" y2="11.5" stroke="white" strokeWidth="1" opacity="0.85" />
        </svg>
      </div>
      <span className="text-[13px] font-bold text-white tracking-tight">SysVis</span>
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider() {
  return <div className="h-4 w-px bg-gray-700/80 mx-0.5" />;
}

// ── Toolbar button ────────────────────────────────────────────────────────────
function Btn({
  onClick,
  disabled,
  title,
  children,
  variant = 'default',
}: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
}) {
  const base =
    'flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap';
  const variants = {
    default:
      'text-gray-400 hover:text-gray-100 hover:bg-gray-800/80',
    danger:
      'text-gray-400 hover:text-red-400 hover:bg-red-950/40',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
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
    <header
      className="h-11 flex-shrink-0 border-b border-gray-800 flex items-center px-3 gap-0.5 relative z-20"
      style={{ background: 'linear-gradient(180deg, #0f1628 0%, #0b1020 100%)' }}
    >
      <BrandMark />
      <Divider />

      {/* Project name */}
      <input
        type="text"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        className="bg-transparent rounded-md px-2 py-1 text-[12px] font-medium text-gray-200 w-44
          border border-transparent hover:border-gray-700 focus:border-indigo-500/70
          focus:bg-gray-800/60 focus:outline-none transition-all duration-150 placeholder-gray-600"
        placeholder="Untitled Architecture"
      />

      <Divider />

      {/* Undo / Redo */}
      <Btn onClick={undo} disabled={history.length === 0} title="Undo (Ctrl+Z)">
        <UndoIcon /> Undo
      </Btn>
      <Btn onClick={redo} disabled={future.length === 0} title="Redo (Ctrl+Shift+Z)">
        <RedoIcon /> Redo
      </Btn>

      <Divider />

      {/* File ops */}
      <Btn onClick={handleSave} title="Save to browser storage">
        <SaveIcon /> Save
      </Btn>
      <Btn onClick={handleLoad} title="Load saved project">
        <FolderIcon /> Load
      </Btn>
      <Btn onClick={handleExportJSON} title="Download as JSON">
        <CodeIcon /> JSON
      </Btn>
      <Btn onClick={handleExportPNG} title="Download as PNG">
        <ImageIcon /> PNG
      </Btn>
      <label
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium
          text-gray-400 hover:text-gray-100 hover:bg-gray-800/80 cursor-pointer transition-all duration-150"
        title="Import JSON project"
      >
        <UploadIcon /> Import
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </label>

      <Divider />

      <Btn onClick={validate} title="Check for architecture issues">
        <ValidateIcon /> Validate
      </Btn>
      <Btn onClick={handleClear} title="Clear canvas" variant="danger">
        <TrashIcon /> Clear
      </Btn>

      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center w-7 h-7 rounded-md text-gray-400
          hover:text-gray-100 hover:bg-gray-800/80 transition-all duration-150"
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-[-44px] left-1/2 -translate-x-1/2 bg-gray-800/95 border border-gray-700/80 text-gray-200 text-[11px] font-medium px-3.5 py-2 rounded-lg shadow-xl backdrop-blur-sm whitespace-nowrap">
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

function ValidationPanel({
  issues,
  onClose,
}: {
  issues: ValidationIssue[];
  onClose: () => void;
}) {
  return (
    <div className="absolute top-12 right-3 z-50 w-80 bg-gray-900/95 border border-gray-700/80 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-700/60">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${issues.length === 0 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span className="text-[11px] font-semibold text-gray-200 tracking-wide">Validation Results</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-300 transition-colors text-lg leading-none w-5 h-5 flex items-center justify-center rounded"
        >
          ×
        </button>
      </div>
      <div className="p-3 space-y-1.5 max-h-72 overflow-y-auto">
        {issues.length === 0 ? (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-emerald-950/40 border border-emerald-900/40">
            <span className="text-emerald-400 text-sm">✓</span>
            <p className="text-[11px] text-emerald-300">No issues found — architecture looks good!</p>
          </div>
        ) : (
          issues.map((issue, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 text-[11px] px-3 py-2.5 rounded-lg ${
                issue.severity === 'error'
                  ? 'bg-red-950/40 text-red-300 border border-red-900/40'
                  : 'bg-amber-950/30 text-amber-300 border border-amber-900/30'
              }`}
            >
              <span className="flex-shrink-0 mt-px text-[10px] font-bold">
                {issue.severity === 'error' ? 'ERR' : 'WRN'}
              </span>
              <span className="leading-relaxed">{issue.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
