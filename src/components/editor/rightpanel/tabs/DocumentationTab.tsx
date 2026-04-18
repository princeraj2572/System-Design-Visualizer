/**
 * DocumentationTab - Edit notes and tags
 */

'use client';
import { useState } from 'react';
import { Node } from '@xyflow/react';
import { NodeDataExtended } from '@/types/architecture';
import { X } from 'lucide-react';

interface DocumentationTabProps {
  node: Node<NodeDataExtended>;
  onUpdate?: (nodeId: string, patch: Partial<NodeDataExtended>) => void;
}

export function DocumentationTab({ node, onUpdate }: DocumentationTabProps) {
  const d = node.data?.data ?? node.data;
  const [newTag, setNewTag] = useState('');

  const upd = (patch: Partial<NodeDataExtended>) => {
    if (onUpdate) onUpdate(node.id, patch);
  };

  const addTag = () => {
    const tag = newTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag && !d?.tags?.includes(tag)) {
      upd({ ...d, tags: [...(d?.tags ?? []), tag] } as any);
    }
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    upd({ ...d, tags: (d?.tags ?? []).filter(t => t !== tag) } as any);
  };

  return (
    <div className="p-3 flex flex-col gap-4">
      {/* Purpose */}
      <div>
        <p className="text-[9px] uppercase tracking-wide text-gray-400 font-medium mb-1">Purpose</p>
        <textarea
          className="prop-input resize-none w-full text-xs"
          rows={3}
          placeholder="What does this component do?"
          value={d?.description ?? ''}
          onChange={e => upd({ ...d, description: e.target.value } as any)}
        />
      </div>

      {/* Design Notes */}
      <div>
        <p className="text-[9px] uppercase tracking-wide text-gray-400 font-medium mb-1">
          Design notes
        </p>
        <textarea
          className="prop-input resize-none w-full text-xs"
          rows={5}
          placeholder="Document trade-offs, alternatives, open questions..."
          value={d?.notes ?? ''}
          onChange={e => upd({ ...d, notes: e.target.value } as any)}
        />
      </div>

      {/* Tags */}
      <div>
        <p className="text-[9px] uppercase tracking-wide text-gray-400 font-medium mb-1">Tags</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {d?.tags?.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px]
                         bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-zinc-700"
            >
              {tag}
              <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-400 ml-0.5">
                <X size={8} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          <input
            className="prop-input flex-1 text-xs"
            placeholder="Add tag..."
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
          />
          <button
            onClick={addTag}
            className="px-2 py-1 text-[9px] rounded border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-900 text-gray-500"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
