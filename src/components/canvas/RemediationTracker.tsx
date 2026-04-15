'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Calendar,
} from 'lucide-react';

interface RemediationItem {
  id: string;
  checkId: string;
  issue: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DEFERRED';
  dueDate: Date;
  assignedTo: string;
  notes: string;
  evidence?: string;
  createdAt: Date;
}

interface RemediationTrackerProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const RemediationTracker: React.FC<RemediationTrackerProps> = ({
  isOpen,
  onClose,
}) => {
  const [remediations, setRemediations] = useState<RemediationItem[]>([
    {
      id: 'rem-1',
      checkId: 'check-hipaa-002',
      issue: 'PHI Access Logging Not Implemented',
      severity: 'CRITICAL',
      status: 'IN_PROGRESS',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60000),
      assignedTo: 'Alice Johnson',
      notes: 'Working on comprehensive PHI audit logging system',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60000),
    },
    {
      id: 'rem-2',
      checkId: 'check-soc2-005',
      issue: 'Disaster Recovery Procedures',
      severity: 'CRITICAL',
      status: 'OPEN',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60000),
      assignedTo: 'Bob Smith',
      notes: 'Need to establish automated backup and recovery procedures',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60000),
    },
    {
      id: 'rem-3',
      checkId: 'check-iso27001-002',
      issue: 'Asset Inventory Management',
      severity: 'HIGH',
      status: 'RESOLVED',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60000),
      assignedTo: 'Carol Williams',
      notes: 'Completed comprehensive asset inventory',
      evidence: 'Asset inventory spreadsheet uploaded',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60000),
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<RemediationItem>>({});

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-900 border-red-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-900 border-orange-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-900 border-yellow-300';
      case 'LOW':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-900 border-slate-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-slate-50 border-slate-200 text-slate-600';
      case 'IN_PROGRESS':
        return 'bg-blue-50 border-blue-200 text-blue-600';
      case 'RESOLVED':
        return 'bg-green-50 border-green-200 text-green-600';
      case 'DEFERRED':
        return 'bg-yellow-50 border-yellow-200 text-yellow-600';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'IN_PROGRESS':
        return <Clock size={18} className="text-blue-600" />;
      case 'OPEN':
        return <AlertCircle size={18} className="text-slate-600" />;
      case 'DEFERRED':
        return <Clock size={18} className="text-yellow-600" />;
      default:
        return <AlertCircle size={18} className="text-slate-600" />;
    }
  };

  const isOverdue = (dueDate: Date, status: string) =>
    new Date() > dueDate && status !== 'RESOLVED';

  const handleAddOrUpdate = () => {
    if (editingId) {
      setRemediations((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, ...formData } : r))
      );
      setEditingId(null);
    } else {
      const newItem: RemediationItem = {
        id: `rem-${Date.now()}`,
        checkId: formData.checkId || '',
        issue: formData.issue || '',
        severity: formData.severity || 'MEDIUM',
        status: formData.status || 'OPEN',
        dueDate: formData.dueDate || new Date(),
        assignedTo: formData.assignedTo || '',
        notes: formData.notes || '',
        createdAt: new Date(),
      };
      setRemediations((prev) => [newItem, ...prev]);
    }
    setShowAddForm(false);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    setRemediations((prev) => prev.filter((r) => r.id !== id));
  };

  const openCount = remediations.filter((r) => r.status === 'OPEN').length;
  const inProgressCount = remediations.filter((r) => r.status === 'IN_PROGRESS').length;
  const overdueCount = remediations.filter((r) => isOverdue(r.dueDate, r.status)).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Remediation Tracker</h2>
            <p className="text-sm text-slate-600 mt-1">Track and manage compliance issue resolutions</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        {/* Stats */}
        <div className="px-8 py-4 bg-slate-50 border-b border-slate-200 grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{remediations.length}</div>
            <div className="text-xs text-slate-600">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{openCount}</div>
            <div className="text-xs text-slate-600">Open</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
            <div className="text-xs text-slate-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
            <div className="text-xs text-slate-600">Overdue</div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-4">
            {/* Add Button */}
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setFormData({});
              }}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
            >
              <Plus size={18} />
              Add Remediation Item
            </button>

            {/* Add Form */}
            {showAddForm && (
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 space-y-3">
                <input
                  type="text"
                  placeholder="Issue Title"
                  value={formData.issue || ''}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={formData.severity || 'MEDIUM'}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="px-3 py-2 border border-slate-300 rounded text-sm"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Assigned To"
                    value={formData.assignedTo || ''}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded text-sm"
                  />
                </div>
                <input
                  type="date"
                  value={formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : ''}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: new Date(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                />
                <textarea
                  placeholder="Notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddOrUpdate}
                    className="px-3 py-2 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({});
                    }}
                    className="px-3 py-2 bg-slate-200 text-slate-900 rounded text-sm hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Remediation Items */}
            {remediations.map((item) => (
              <div
                key={item.id}
                className={`border rounded-lg p-4 ${getStatusColor(item.status)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{item.issue}</h3>
                      <p className="text-sm text-slate-600 mt-1">{item.notes}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setFormData(item);
                        setShowAddForm(true);
                      }}
                      className="p-2 hover:bg-white rounded transition-colors"
                    >
                      <Edit2 size={16} className="text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 hover:bg-white rounded transition-colors"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className={`px-2 py-1 rounded border ${getSeverityColor(item.severity)}`}>
                    {item.severity}
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Calendar size={14} />
                    {item.dueDate.toLocaleDateString()}
                    {isOverdue(item.dueDate, item.status) && (
                      <span className="ml-1 font-semibold text-red-600">(Overdue)</span>
                    )}
                  </div>
                  <div className="text-slate-600">Assigned: {item.assignedTo}</div>
                  {item.evidence && (
                    <div className="text-green-600 font-semibold">Evidence: {item.evidence}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
