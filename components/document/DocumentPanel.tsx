'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, Pencil, Eye } from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';

const PLACEHOLDER = `# Untitled Document

Type your notes here — style with **markdown**.

- Headings, lists, and \`code\` all render in Preview
- Keep architecture decisions and context next to the diagram
`;

export default function DocumentPanel() {
  const documentContent = useCanvasStore((s) => s.documentContent);
  const setDocumentContent = useCanvasStore((s) => s.setDocumentContent);
  const viewMode = useCanvasStore((s) => s.viewMode);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  const isPaired = viewMode === 'both';

  return (
    <div
      className={`flex flex-col overflow-hidden bg-white dark:bg-zinc-900 ${
        isPaired ? 'w-[420px] flex-shrink-0 border-r border-slate-200 dark:border-zinc-800' : 'flex-1'
      }`}
    >
      {/* Header */}
      <div className="h-11 flex-shrink-0 flex items-center justify-between px-3.5 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500">
          <FileText size={13}/>
          <span className="text-[10px] font-bold uppercase tracking-widest">Document</span>
        </div>
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
          <button
            onClick={() => setMode('edit')}
            title="Edit"
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${
              mode === 'edit'
                ? 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-sm'
                : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
            }`}
          >
            <Pencil size={11}/> Edit
          </button>
          <button
            onClick={() => setMode('preview')}
            title="Preview"
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${
              mode === 'preview'
                ? 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-sm'
                : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
            }`}
          >
            <Eye size={11}/> Preview
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {mode === 'edit' ? (
          <textarea
            value={documentContent}
            onChange={(e) => setDocumentContent(e.target.value)}
            placeholder={PLACEHOLDER}
            spellCheck={false}
            className="w-full h-full resize-none outline-none p-6 text-[13px] leading-relaxed font-mono
              bg-transparent text-slate-700 dark:text-zinc-300 placeholder-slate-300 dark:placeholder-zinc-700"
          />
        ) : (
          <div className="p-6">
            {documentContent.trim() ? (
              <article className="prose prose-sm dark:prose-invert max-w-none
                prose-headings:font-semibold prose-a:text-indigo-500">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{documentContent}</ReactMarkdown>
              </article>
            ) : (
              <p className="text-[13px] text-slate-300 dark:text-zinc-700">Nothing to preview yet — switch to Edit and start writing.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
