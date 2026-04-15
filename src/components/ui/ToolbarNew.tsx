/**
 * Redesigned Toolbar - Clean, minimal design inspired by eraser.io
 * Features: Reduced clutter, smart grouping, clear hierarchy
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useArchitectureStore } from '@/store/architecture-store';
import { 
  ChevronDown, BookOpen, FileText, Shield, HeartHandshake,
  BarChart3, GitBranch, CheckCircle, AlertTriangle, Users,
  Share2, Gauge, Moon, Sun, HelpCircle
} from 'lucide-react';

interface ToolbarProps {
  onExportClick?: () => void;
  onImportClick?: () => void;
  onLayoutClick?: () => void;
  onShowTemplates?: () => void;
  onShowAuditLog?: () => void;
  onShowCompliance?: () => void;
  onShowHealth?: () => void;
  onShowMetrics?: () => void;
  onShowDependencies?: () => void;
  onShowFrameworks?: () => void;
  onShowRemediation?: () => void;
  onShowCollaboration?: () => void;
  onShowSharedWorkspace?: () => void;
  onShowPerformance?: () => void;
  onAnalyticsClick?: () => void;
  projectName?: string;
  isSaving?: boolean;
}

const MenuItem: React.FC<{ icon?: React.ReactNode; label?: string; onClick?: () => void; isDivider?: boolean }> = 
  ({ icon, label, onClick, isDivider }) => {
    if (isDivider) return <div className="h-px bg-slate-200 my-1" />;
    return (
      <button
        onClick={onClick}
        className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100"
      >
        {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
        <span className="flex-1">{label}</span>
      </button>
    );
  };

const DropdownMenu: React.FC<{ isOpen: boolean; onClose: () => void; triggerRef: React.RefObject<HTMLButtonElement>; children: React.ReactNode; className?: string }> = 
  ({ isOpen, onClose, triggerRef, children, className = '' }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (!triggerRef.current?.contains(e.target as Node) && !menuRef.current?.contains(e.target as Node)) {
          onClose();
        }
      };
      if (isOpen) document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }, [isOpen, triggerRef, onClose]);

    if (!isOpen) return null;
    return (
      <div ref={menuRef} className={`absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden ${className}`}>
        {children}
      </div>
    );
  };

export const ToolbarNew: React.FC<ToolbarProps> = ({
  onExportClick, onImportClick: _onImportClick, onLayoutClick, onShowTemplates, onShowAuditLog, onShowCompliance,
  onShowHealth, onShowMetrics, onShowDependencies, onShowFrameworks, onShowRemediation,
  onShowCollaboration, onShowSharedWorkspace, onShowPerformance, onAnalyticsClick,
  projectName = 'Untitled Project', isSaving = false,
}) => {
  const { setTheme } = useArchitectureStore();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const workspaceRef = useRef<HTMLButtonElement>(null);
  const toolsRef = useRef<HTMLButtonElement>(null);
  const helpRef = useRef<HTMLButtonElement>(null);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setIsDarkMode(isDark);
    setTheme(isDark ? 'dark' : 'light');
  };

  return (
    <div className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shadow-sm gap-4">
      {/* Left: Logo & Project Name */}
      <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          λ
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-slate-900 truncate">{projectName}</h1>
          <p className="text-xs text-slate-500">System Visualizer</p>
        </div>
      </div>

      {/* Center: Primary Actions */}
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={onLayoutClick} title="Auto arrange nodes">
          ⚡ Layout
        </Button>
        <Button size="sm" variant="ghost" onClick={onExportClick} title="Export architecture">
          📥 Export
        </Button>
        <Button size="sm" variant="primary" onClick={onAnalyticsClick} disabled={isSaving} title={isSaving ? 'Saving...' : 'Save'}>
          {isSaving ? '⏳ Saving...' : '💾 Save'}
        </Button>
      </div>

      {/* Right: Dropdowns */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            ref={workspaceRef}
            onClick={() => setOpenDropdown(openDropdown === 'workspace' ? null : 'workspace')}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Workspace <ChevronDown size={16} className={`transition-transform ${openDropdown === 'workspace' ? 'rotate-180' : ''}`} />
          </button>
          <DropdownMenu isOpen={openDropdown === 'workspace'} onClose={() => setOpenDropdown(null)} triggerRef={workspaceRef} className="left-0">
            <MenuItem icon={<BookOpen size={16} />} label="Templates" onClick={() => { onShowTemplates?.(); setOpenDropdown(null); }} />
            <MenuItem icon={<FileText size={16} />} label="Audit Log" onClick={() => { onShowAuditLog?.(); setOpenDropdown(null); }} />
            <MenuItem icon={<BarChart3 size={16} />} label="Analytics" onClick={() => { onAnalyticsClick?.(); setOpenDropdown(null); }} />
            <MenuItem isDivider />
            <MenuItem icon={<Share2 size={16} />} label="Share Workspace" onClick={() => { onShowSharedWorkspace?.(); setOpenDropdown(null); }} />
            <MenuItem icon={<Users size={16} />} label="Collaborate" onClick={() => { onShowCollaboration?.(); setOpenDropdown(null); }} />
          </DropdownMenu>
        </div>

        <div className="relative">
          <button
            ref={toolsRef}
            onClick={() => setOpenDropdown(openDropdown === 'tools' ? null : 'tools')}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Tools <ChevronDown size={16} className={`transition-transform ${openDropdown === 'tools' ? 'rotate-180' : ''}`} />
          </button>
          <DropdownMenu isOpen={openDropdown === 'tools'} onClose={() => setOpenDropdown(null)} triggerRef={toolsRef} className="left-0">
            <MenuItem icon={<HeartHandshake size={16} />} label="Health Dashboard" onClick={() => { onShowHealth?.(); setOpenDropdown(null); }} />
            <MenuItem icon={<BarChart3 size={16} />} label="Metrics" onClick={() => { onShowMetrics?.(); setOpenDropdown(null); }} />
            <MenuItem icon={<GitBranch size={16} />} label="Dependencies" onClick={() => { onShowDependencies?.(); setOpenDropdown(null); }} />
            <MenuItem isDivider />
            <MenuItem icon={<CheckCircle size={16} />} label="Compliance" onClick={() => { onShowFrameworks?.(); setOpenDropdown(null); }} />
            <MenuItem icon={<AlertTriangle size={16} />} label="Remediation" onClick={() => { onShowRemediation?.(); setOpenDropdown(null); }} />
            <MenuItem icon={<Shield size={16} />} label="Reports" onClick={() => { onShowCompliance?.(); setOpenDropdown(null); }} />
            <MenuItem isDivider />
            <MenuItem icon={<Gauge size={16} />} label="Performance" onClick={() => { onShowPerformance?.(); setOpenDropdown(null); }} />
          </DropdownMenu>
        </div>

        <div className="relative">
          <button
            ref={helpRef}
            onClick={() => setOpenDropdown(openDropdown === 'help' ? null : 'help')}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <HelpCircle size={16} />
          </button>
          <DropdownMenu isOpen={openDropdown === 'help'} onClose={() => setOpenDropdown(null)} triggerRef={helpRef}>
            <MenuItem label="Keyboard Shortcuts" onClick={() => { setOpenDropdown(null); }} />
            <MenuItem label="Documentation" onClick={() => { window.open('https://docs.example.com'); setOpenDropdown(null); }} />
          </DropdownMenu>
        </div>

        <button
          onClick={toggleTheme}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          title="Toggle dark mode"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  );
};

export default ToolbarNew;
