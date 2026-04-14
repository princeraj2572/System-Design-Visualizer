'use client';

import React, { useState } from 'react';
import { X, Download, Clock } from 'lucide-react';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'MOVE' | 'CONNECT' | 'EXPORT' | 'IMPORT';
  resourceType: 'NODE' | 'EDGE' | 'GROUP' | 'PROJECT';
  resourceId: string;
  resourceName: string;
  changes?: {
    before?: any;
    after: any;
  };
  metadata?: Record<string, any>;
}

interface AuditLogViewerProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
}

// Mock data for demonstration
const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 5 * 60000),
    userId: 'user-123',
    userName: 'Alice Johnson',
    action: 'CREATE',
    resourceType: 'NODE',
    resourceId: 'node-api-1',
    resourceName: 'API Gateway',
    metadata: { position: { x: 300, y: 100 } },
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 10 * 60000),
    userId: 'user-456',
    userName: 'Bob Smith',
    action: 'UPDATE',
    resourceType: 'NODE',
    resourceId: 'node-db-1',
    resourceName: 'PostgreSQL Database',
    changes: {
      before: { name: 'Main Database' },
      after: { name: 'Primary PostgreSQL Database' },
    },
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 15 * 60000),
    userId: 'user-123',
    userName: 'Alice Johnson',
    action: 'CONNECT',
    resourceType: 'EDGE',
    resourceId: 'edge-1',
    resourceName: 'API->Database Connection',
    metadata: { edgeType: 'database-query' },
  },
  {
    id: 'log-4',
    timestamp: new Date(Date.now() - 20 * 60000),
    userId: 'user-789',
    userName: 'Carol Davis',
    action: 'DELETE',
    resourceType: 'NODE',
    resourceId: 'node-cache-1',
    resourceName: 'Redis Cache',
  },
  {
    id: 'log-5',
    timestamp: new Date(Date.now() - 1 * 60 * 60000),
    userId: 'user-123',
    userName: 'Alice Johnson',
    action: 'EXPORT',
    resourceType: 'PROJECT',
    resourceId: 'proj-1',
    resourceName: 'System Architecture',
    metadata: { format: 'yaml', components: 8 },
  },
];

const ACTION_ICONS: Record<string, string> = {
  'CREATE': '➕',
  'UPDATE': '✏️',
  'DELETE': '🗑️',
  'MOVE': '↔️',
  'CONNECT': '🔗',
  'EXPORT': '📥',
  'IMPORT': '📤',
};

const ACTION_COLORS: Record<string, string> = {
  'CREATE': 'bg-green-50 border-green-200',
  'UPDATE': 'bg-blue-50 border-blue-200',
  'DELETE': 'bg-red-50 border-red-200',
  'MOVE': 'bg-yellow-50 border-yellow-200',
  'CONNECT': 'bg-purple-50 border-purple-200',
  'EXPORT': 'bg-cyan-50 border-cyan-200',
  'IMPORT': 'bg-indigo-50 border-indigo-200',
};

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  isOpen,
  onClose,
}) => {
  const [logs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [filterAction, setFilterAction] = useState<string | null>(null);
  const [filterUser, setFilterUser] = useState<string | null>(null);
  const [filterResourceType, setFilterResourceType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique values for filters
  const uniqueUsers = Array.from(new Set(logs.map((l) => l.userName)));
  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));
  const uniqueResourceTypes = Array.from(new Set(logs.map((l) => l.resourceType)));

  // Apply filters
  const filteredLogs = logs.filter((log) => {
    if (filterAction && log.action !== filterAction) return false;
    if (filterUser && log.userName !== filterUser) return false;
    if (filterResourceType && log.resourceType !== filterResourceType) return false;
    if (
      searchQuery &&
      !log.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.userName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleExportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource Name'].join(','),
      ...filteredLogs.map((log) =>
        [
          log.timestamp.toISOString(),
          log.userName,
          log.action,
          log.resourceType,
          log.resourceName,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString()}.csv`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Audit Log</h2>
            <p className="text-sm text-slate-500 mt-1">
              {filteredLogs.length} of {logs.length} events
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportLogs}
              className="px-4 py-2 bg-slate-600 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition p-2"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-8 py-4 border-b border-slate-200 bg-slate-50 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by user or resource name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <button
              onClick={() => {
                setFilterAction(null);
                setFilterUser(null);
                setFilterResourceType(null);
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-300 transition"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Action Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block">
                ACTION
              </label>
              <select
                value={filterAction || ''}
                onChange={(e) => setFilterAction(e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All Actions</option>
                {uniqueActions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>

            {/* User Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block">USER</label>
              <select
                value={filterUser || ''}
                onChange={(e) => setFilterUser(e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All Users</option>
                {uniqueUsers.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>

            {/* Resource Type Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block">
                RESOURCE TYPE
              </label>
              <select
                value={filterResourceType || ''}
                onChange={(e) => setFilterResourceType(e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All Types</option>
                {uniqueResourceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-slate-500">
                <div className="text-4xl mb-2">📋</div>
                <p className="font-semibold">No audit logs found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 border rounded-lg ${ACTION_COLORS[log.action]}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl flex-shrink-0">
                      {ACTION_ICONS[log.action]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900">
                          {log.action}
                        </span>
                        <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                          {log.resourceType}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">
                        <strong>{log.userName}</strong> {log.action.toLowerCase()} <strong>{log.resourceName}</strong>
                      </p>
                      {log.changes && (
                        <div className="text-xs text-slate-600 font-mono bg-slate-50 p-2 rounded mb-2">
                          <div>
                            Before: <span className="text-red-600">{JSON.stringify(log.changes.before)}</span>
                          </div>
                          <div>
                            After: <span className="text-green-600">{JSON.stringify(log.changes.after)}</span>
                          </div>
                        </div>
                      )}
                      <time className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.timestamp.toLocaleString()}
                      </time>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogViewer;
