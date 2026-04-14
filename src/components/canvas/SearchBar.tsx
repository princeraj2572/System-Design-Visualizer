/**
 * Search bar for filtering components
 * Allows searching by name, type, and technology
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useArchitectureStore } from '@/store/architecture-store';

interface SearchBarProps {
  onClose?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { nodes, selectNode } = useArchitectureStore();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = nodes.filter((node) => {
      const name = node.metadata.name.toLowerCase();
      const tech = (node.metadata.technology || '').toLowerCase();
      const type = node.type.toLowerCase();
      const desc = (node.metadata.description || '').toLowerCase();

      return (
        name.includes(lowerQuery) ||
        tech.includes(lowerQuery) ||
        type.includes(lowerQuery) ||
        desc.includes(lowerQuery)
      );
    });

    setResults(filtered.map((n) => n.id));
    setSelectedIndex(0);
  }, [query, nodes]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose?.();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        selectNode(results[selectedIndex]);
        onClose?.();
      }
    }
  };

  const handleSelectResult = (nodeId: string) => {
    selectNode(nodeId);
    onClose?.();
  };

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-96 max-w-[calc(100%-2rem)]">
      {/* Search Input */}
      <div className="relative bg-white rounded-lg shadow-xl border border-slate-200">
        <div className="flex items-center gap-2 px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search components..."
            className="flex-1 outline-none text-sm bg-transparent"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <X size={16} className="text-slate-400" />
            </button>
          )}
        </div>

        {/* Results Dropdown */}
        {results.length > 0 && (
          <div className="border-t border-slate-200 max-h-64 overflow-y-auto">
            {results.map((nodeId, idx) => {
              const node = nodes.find((n) => n.id === nodeId);
              if (!node) return null;

              return (
                <button
                  key={nodeId}
                  onClick={() => handleSelectResult(nodeId)}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    idx === selectedIndex ? 'bg-cyan-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="font-medium text-slate-900">{node.metadata.name}</div>
                  <div className="text-xs text-slate-500">
                    {node.type}
                    {node.metadata.technology && ` • ${node.metadata.technology}`}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {query && results.length === 0 && (
          <div className="border-t border-slate-200 px-4 py-3 text-center text-sm text-slate-500">
            No components found
          </div>
        )}

        {/* Help Text */}
        {!query && (
          <div className="border-t border-slate-200 px-4 py-2 text-xs text-slate-400 space-y-1">
            <p>Search by name, type, or technology</p>
            <p>↑↓ Navigate • Enter Select • Esc Close</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
