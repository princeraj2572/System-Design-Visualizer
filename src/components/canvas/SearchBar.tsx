/**
 * Enhanced Search bar for filtering and discovering components
 * Allows searching by name, type, and technology with advanced filters
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { useArchitectureStore } from '@/store/architecture-store';
import { getUniqueNodeTypes } from '@/lib/search-service';

interface SearchBarProps {
  onClose?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const nodes = useArchitectureStore((state) => state.nodes);
  const selectNode = useArchitectureStore((state) => state.selectNode);
  const filterTypes = useArchitectureStore((state) => state.filterTypes);
  const filterConnectivity = useArchitectureStore((state) => state.filterConnectivity);
  const setFilterTypes = useArchitectureStore((state) => state.setFilterTypes);
  const setFilterConnectivity = useArchitectureStore((state) => state.setFilterConnectivity);
  const applyFilters = useArchitectureStore((state) => state.applyFilters);
  const clearFilters = useArchitectureStore((state) => state.clearFilters);

  const uniqueTypes = getUniqueNodeTypes(nodes);

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

  const toggleTypeFilter = (type: string) => {
    const updated = filterTypes.includes(type)
      ? filterTypes.filter((t) => t !== type)
      : [...filterTypes, type];
    setFilterTypes(updated);
  };

  const handleApplyFilters = () => {
    applyFilters();
    setShowFilters(false);
  };

  const hasActiveFilters = filterTypes.length > 0 || filterConnectivity.incoming || filterConnectivity.outgoing;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-96 max-w-[calc(100%-2rem)]">
      {/* Search Input */}
      <div className="bg-white rounded-lg shadow-xl border border-slate-200">
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
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1 rounded transition-colors ${
              hasActiveFilters
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-400 hover:bg-slate-100'
            }`}
            title="Toggle filters"
          >
            <Filter size={16} />
          </button>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <X size={16} className="text-slate-400" />
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t border-slate-200 p-4 space-y-3 max-h-64 overflow-y-auto">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Component Types
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {uniqueTypes.map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={filterTypes.includes(type)}
                      onChange={() => toggleTypeFilter(type)}
                      className="w-3 h-3"
                    />
                    <span className="truncate">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Connectivity
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={filterConnectivity.incoming}
                    onChange={(e) =>
                      setFilterConnectivity({
                        ...filterConnectivity,
                        incoming: e.target.checked,
                      })
                    }
                    className="w-3 h-3"
                  />
                  <span>Has incoming connections</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={filterConnectivity.outgoing}
                    onChange={(e) =>
                      setFilterConnectivity({
                        ...filterConnectivity,
                        outgoing: e.target.checked,
                      })
                    }
                    className="w-3 h-3"
                  />
                  <span>Has outgoing connections</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleApplyFilters}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition"
              >
                Apply
              </button>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    clearFilters();
                    setShowFilters(false);
                  }}
                  className="flex-1 px-3 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded hover:bg-slate-300 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

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
