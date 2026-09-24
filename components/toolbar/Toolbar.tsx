'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { useCanvasStore, snapshotKey } from '@/store/useCanvasStore';
import {
  exportToJSON,
  exportToPNG,
  exportToMermaid,
  importFromJSON,
  saveProjectToLocalStorage,
  loadProjectsFromLocalStorage,
  deleteProjectFromLocalStorage,
} from '@/utils/export';
import type { Project, ValidationIssue } from '@/types';
import { Modal, ConfirmDialog } from '@/components/common/Modal';
import { Trash2 } from 'lucide-react';

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 flex-shrink-0">
      {children}
    </svg>
  );
}

const UndoIcon = () => <Icon><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></Icon>;
const RedoIcon = () => <Icon><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"/></Icon>;
const SaveIcon = () => <Icon><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></Icon>;
const FolderIcon = () => <Icon><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></Icon>;
const CodeIcon = () => <Icon><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/></Icon>;
const ImageIcon = () => <Icon><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></Icon>;
const UploadIcon = () => <Icon><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></Icon>;
const ValidateIcon = () => <Icon><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Icon>;
const TrashIcon = () => <Icon><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></Icon>;
const MermaidIcon = () => <Icon><path d="M3 12h4l3-9 4 18 3-9h4"/></Icon>;
const LayoutIcon = () => <Icon><rect x="3" y="4" width="7" height="16" rx="1"/><rect x="14" y="4" width="7" height="7" rx="1"/><rect x="14" y="15" width="7" height="5" rx="1"/></Icon>;
const SunIcon = () => <Icon><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></Icon>;
const MoonIcon = () => <Icon><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></Icon>;

function BrandMark() {
  return (
    <div className="flex items-center gap-2 mr-2 select-none flex-shrink-0">
      <div className="w-6 h-6 rounded-md bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
          <circle cx="3" cy="8" r="1.75" stroke="white" strokeWidth="1.25"/>
          <circle cx="13" cy="3.5" r="1.5" stroke="white" strokeWidth="1.25"/>
          <circle cx="13" cy="12.5" r="1.5" stroke="white" strokeWidth="1.25"/>
          <line x1="4.75" y1="7.2" x2="11.5" y2="4.5" stroke="white" strokeWidth="1" opacity="0.85"/>
          <line x1="4.75" y1="8.8" x2="11.5" y2="11.5" stroke="white" strokeWidth="1" opacity="0.85"/>
        </svg>
      </div>
      <span className="text-[13px] font-bold text-slate-900 dark:text-white tracking-tight">SysVis</span>
    </div>
  );
}

function Divider() {
  return <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 mx-0.5"/>;
}

function Btn({ onClick, disabled, title, children, variant = 'default' }: {
  onClick: () => void; disabled?: boolean; title?: string;
  children: React.ReactNode; variant?: 'default' | 'danger';
}) {
  const base = 'flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap';
  const variants = {
    default: 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800',
    danger:  'text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40',
  };
  return (
    <button onClick={onClick} disabled={disabled} title={title} className={`${base} ${variants[variant]}`}>
      {children}
    </button>
  );
}

export default function Toolbar() {
  const {
    projectName, setProjectName, getProject, loadProject, clearCanvas,
    undo, redo, history, future, validate, dismissValidation,
    validationIssues, showValidation, theme, toggleTheme,
    nodes, edges, shapes, frames, documentContent, savedSnapshot, markSaved,
    selectedNodeId, duplicateNode, nudgeNode, copyNode, pasteNode, autoLayout,
    viewMode, setViewMode,
  } = useCanvasStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const isDirty = snapshotKey(nodes, edges, shapes, frames, documentContent) !== savedSnapshot;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const handleSave = useCallback(() => {
    const p = getProject();
    saveProjectToLocalStorage(p);
    markSaved();
    showToast(`"${p.name}" saved`);
  }, [getProject, markSaved]);
  const handleExportJSON = useCallback(() => exportToJSON(getProject()), [getProject]);
  const handleExportPNG = useCallback(async () => { showToast('Exporting…'); await exportToPNG('architecture-canvas', projectName); }, [projectName]);
  const handleExportMermaid = useCallback(() => { exportToMermaid(getProject()); showToast('Mermaid diagram exported'); }, [getProject]);
  const handleAutoLayout = useCallback(() => { autoLayout(); showToast('Layout arranged'); }, [autoLayout]);
  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { const p = await importFromJSON(file); loadProject(p); showToast(`Imported "${p.name}"`); }
    catch { showToast('Import failed — invalid file'); }
    e.target.value = '';
  }, [loadProject]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditable = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
        return;
      }
      if (isEditable) return;

      if (mod && e.key.toLowerCase() === 'd') {
        if (selectedNodeId) { e.preventDefault(); duplicateNode(selectedNodeId); }
        return;
      }
      if (mod && e.key.toLowerCase() === 'c') {
        if (selectedNodeId) copyNode(selectedNodeId);
        return;
      }
      if (mod && e.key.toLowerCase() === 'v') {
        pasteNode();
        return;
      }
      if (selectedNodeId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        nudgeNode(selectedNodeId, dx, dy);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selectedNodeId, duplicateNode, nudgeNode, copyNode, pasteNode, handleSave]);

  return (
    <header className="h-11 flex-shrink-0 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center px-3 gap-0.5 relative z-20">
      <BrandMark />
      <Divider />

      <input
        type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)}
        placeholder="Untitled Architecture"
        className="bg-transparent rounded px-1.5 py-1 text-[12px] font-medium
          text-slate-800 dark:text-zinc-200 w-44 border border-transparent
          hover:border-slate-200 dark:hover:border-zinc-700
          focus:border-indigo-400 dark:focus:border-indigo-500 focus:outline-none
          placeholder-slate-400 dark:placeholder-zinc-600 transition-colors"
      />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
        flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
        {(['document', 'both', 'canvas'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-colors ${
              viewMode === mode
                ? 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-sm'
                : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="flex-1"/>

      <Btn onClick={undo} disabled={history.length === 0} title="Undo (Ctrl+Z)"><UndoIcon/> Undo</Btn>
      <Btn onClick={redo} disabled={future.length === 0} title="Redo"><RedoIcon/> Redo</Btn>

      <Divider />

      <Btn onClick={handleSave} title="Save to browser storage (Ctrl+S)">
        <SaveIcon/> Save
        {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" title="Unsaved changes"/>}
      </Btn>
      <Btn onClick={() => setShowLoadDialog(true)} title="Load saved project"><FolderIcon/> Load</Btn>
      <Btn onClick={handleExportJSON} title="Download as JSON"><CodeIcon/> JSON</Btn>
      <Btn onClick={handleExportPNG} title="Download as PNG"><ImageIcon/> PNG</Btn>
      <Btn onClick={handleExportMermaid} title="Download as Mermaid diagram"><MermaidIcon/> Mermaid</Btn>
      <label className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium
        text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100
        hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
        <UploadIcon/> Import
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport}/>
      </label>

      <Divider />

      <Btn onClick={handleAutoLayout} title="Auto-arrange nodes"><LayoutIcon/> Auto Layout</Btn>
      <Btn onClick={validate} title="Validate architecture"><ValidateIcon/> Validate</Btn>
      <Btn onClick={() => setShowClearConfirm(true)} title="Clear canvas" variant="danger"><TrashIcon/> Clear</Btn>

      <Divider />

      <button onClick={toggleTheme}
        className="flex items-center justify-center w-7 h-7 rounded-md text-slate-400 dark:text-zinc-500
          hover:text-slate-700 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
        {theme === 'dark' ? <SunIcon/> : <MoonIcon/>}
      </button>

      {toast && (
        <div className="absolute bottom-[-42px] left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-zinc-800 text-slate-100 dark:text-zinc-200 text-[11px] font-medium px-3.5 py-2 rounded-lg shadow-lg border border-slate-700 dark:border-zinc-700 whitespace-nowrap z-50">
          {toast}
        </div>
      )}

      {showValidation && <ValidationPanel issues={validationIssues} onClose={dismissValidation}/>}

      {showLoadDialog && (
        <LoadDialog
          onClose={() => setShowLoadDialog(false)}
          onLoad={(p) => { loadProject(p); showToast(`Loaded "${p.name}"`); setShowLoadDialog(false); }}
          onDeleted={(name) => showToast(`Deleted "${name}"`)}
        />
      )}

      {showClearConfirm && (
        <ConfirmDialog
          title="Clear canvas?"
          message="This removes every component and connection from the canvas. You can undo it with Ctrl+Z afterward."
          confirmLabel="Clear"
          danger
          onConfirm={() => { clearCanvas(); setShowClearConfirm(false); showToast('Canvas cleared'); }}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
    </header>
  );
}

function LoadDialog({
  onClose,
  onLoad,
  onDeleted,
}: {
  onClose: () => void;
  onLoad: (project: Project) => void;
  onDeleted: (name: string) => void;
}) {
  const [projects, setProjects] = useState<Project[]>(() => loadProjectsFromLocalStorage());

  const handleDelete = (name: string) => {
    deleteProjectFromLocalStorage(name);
    setProjects((prev) => prev.filter((p) => p.name !== name));
    onDeleted(name);
  };

  return (
    <Modal onClose={onClose} widthClass="w-96">
      <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <h2 className="text-[13px] font-semibold text-slate-800 dark:text-zinc-100">Load Project</h2>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">Saved in this browser&apos;s local storage.</p>
      </div>
      <div className="max-h-80 overflow-y-auto p-2">
        {projects.length === 0 ? (
          <p className="text-[11px] text-slate-400 dark:text-zinc-600 text-center py-6">No saved projects yet.</p>
        ) : (
          projects.map((p) => (
            <div key={p.name} className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
              <button onClick={() => onLoad(p)} className="flex-1 min-w-0 text-left">
                <p className="text-[12px] font-medium text-slate-700 dark:text-zinc-200 truncate">{p.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                  {p.nodes.length} nodes · updated {new Date(p.updatedAt).toLocaleDateString()}
                </p>
              </button>
              <button
                onClick={() => handleDelete(p.name)}
                title="Delete"
                className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1.5 rounded-md text-slate-400 dark:text-zinc-500
                  hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
              >
                <Trash2 size={13}/>
              </button>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}

function ValidationPanel({ issues, onClose }: { issues: ValidationIssue[]; onClose: () => void }) {
  return (
    <div className="absolute top-12 right-3 z-50 w-80 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${issues.length === 0 ? 'bg-emerald-500' : 'bg-amber-500'}`}/>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-200">Validation Results</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors text-lg leading-none">×</button>
      </div>
      <div className="p-3 space-y-1.5 max-h-72 overflow-y-auto">
        {issues.length === 0 ? (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
            <span className="text-emerald-500 font-bold text-xs">✓</span>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">No issues found</p>
          </div>
        ) : issues.map((issue, i) => (
          <div key={i} className={`flex items-start gap-2.5 text-[11px] px-3 py-2.5 rounded-lg ${
            issue.severity === 'error'
              ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/40'
              : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/30'
          }`}>
            <span className="flex-shrink-0 mt-px font-bold text-[10px]">{issue.severity === 'error' ? 'ERR' : 'WRN'}</span>
            <span className="leading-relaxed">{issue.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
