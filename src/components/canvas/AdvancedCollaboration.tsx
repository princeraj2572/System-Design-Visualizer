'use client';

import React, { useState } from 'react';
import {
  X,
  Users,
  MessageCircle,
} from 'lucide-react';

interface CollaborationSession {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  status: 'active' | 'idle' | 'offline';
  action: string;
  lastUpdate: Date;
  cursorPosition?: { x: number; y: number };
  selectedNode?: string;
}

interface CollaborationEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'comment' | 'like' | 'mention';
  target: string;
  details: string;
}

interface AdvancedCollaborationProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

export const AdvancedCollaboration: React.FC<AdvancedCollaborationProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const [sessions] = useState<CollaborationSession[]>([
    {
      id: 'session-1',
      projectId,
      userId: 'user-1',
      userName: 'Alice Johnson',
      userAvatar: '👩‍💼',
      status: 'active',
      action: 'Editing API Gateway node',
      lastUpdate: new Date(),
      selectedNode: 'node-api-1',
    },
    {
      id: 'session-2',
      projectId,
      userId: 'user-2',
      userName: 'Bob Smith',
      userAvatar: '👨‍💻',
      status: 'active',
      action: 'Viewing database layer',
      lastUpdate: new Date(Date.now() - 30000),
      selectedNode: 'node-db-1',
    },
    {
      id: 'session-3',
      projectId,
      userId: 'user-3',
      userName: 'Carol Williams',
      userAvatar: '👩‍🔧',
      status: 'idle',
      action: 'Away from keyboard',
      lastUpdate: new Date(Date.now() - 5 * 60000),
    },
  ]);

  const [events] = useState<CollaborationEvent[]>([
    {
      id: 'evt-1',
      timestamp: new Date(),
      userId: 'user-1',
      userName: 'Alice Johnson',
      action: 'create',
      target: 'API Gateway',
      details: 'Created new microservice node',
    },
    {
      id: 'evt-2',
      timestamp: new Date(Date.now() - 60000),
      userId: 'user-2',
      userName: 'Bob Smith',
      action: 'comment',
      target: 'Cache Layer',
      details: 'Added comment: "Consider Redis for caching"',
    },
    {
      id: 'evt-3',
      timestamp: new Date(Date.now() - 2 * 60000),
      userId: 'user-1',
      userName: 'Alice Johnson',
      action: 'update',
      target: 'PostgreSQL',
      details: 'Updated node properties',
    },
  ]);

  const [filterAction, setFilterAction] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-900 border-green-300';
      case 'idle':
        return 'bg-yellow-100 text-yellow-900 border-yellow-300';
      case 'offline':
        return 'bg-slate-100 text-slate-900 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-900 border-slate-300';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-slate-400';
      default:
        return 'bg-slate-400';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return '➕';
      case 'update':
        return '✏️';
      case 'delete':
        return '🗑️';
      case 'comment':
        return '💬';
      case 'like':
        return '❤️';
      case 'mention':
        return '@️';
      default:
        return '•';
    }
  };

  const filteredEvents =
    filterAction === 'all' ? events : events.filter((e) => e.action === filterAction);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users size={24} className="text-cyan-600" />
            <h2 className="text-2xl font-bold text-slate-900">Live Collaboration</h2>
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-900 rounded-full text-sm font-medium">
              {sessions.filter((s) => s.status === 'active').length} Active
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Sidebar - Active Sessions */}
          <div className="w-80 border-r border-slate-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 mb-4">Active Sessions</h3>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedSession === session.id
                        ? 'bg-cyan-50 border-2 border-cyan-400'
                        : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{session.userAvatar}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{session.userName}</div>
                        <div className="text-xs text-slate-600">{session.action}</div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${getStatusDot(session.status)}`} />
                    </div>
                    <div
                      className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                        session.status
                      )}`}
                    >
                      {session.status.toUpperCase()}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      {new Date().getTime() - session.lastUpdate.getTime() < 60000
                        ? 'Just now'
                        : `${Math.floor((new Date().getTime() - session.lastUpdate.getTime()) / 60000)} min ago`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Activity Feed */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <MessageCircle size={20} className="text-cyan-600" />
                <h3 className="font-semibold text-slate-900">Project Activity</h3>
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="ml-auto px-3 py-1 border border-slate-300 rounded text-sm"
                >
                  <option value="all">All Events</option>
                  <option value="create">Created</option>
                  <option value="update">Updated</option>
                  <option value="delete">Deleted</option>
                  <option value="comment">Commented</option>
                  <option value="like">Liked</option>
                </select>
              </div>

              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getActionIcon(event.action)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900">{event.userName}</span>
                          <span className="text-xs text-slate-500">
                            {new Date().getTime() - event.timestamp.getTime() < 60000
                              ? 'just now'
                              : `${Math.floor((new Date().getTime() - event.timestamp.getTime()) / 60000)} min ago`}
                          </span>
                        </div>
                        <div className="text-sm text-slate-700">
                          <span className="font-medium">{event.target}</span> - {event.details}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
