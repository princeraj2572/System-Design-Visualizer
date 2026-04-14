'use client';

import React, { useState } from 'react';
import { X, Bell, AlertCircle, Users, MessageSquare, Share2 } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'collaboration' | 'system' | 'activity' | 'mention';
  title: string;
  message: string;
  icon?: React.ReactNode;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onClearAll?: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  'collaboration': <Users className="w-4 h-4" />,
  'system': <AlertCircle className="w-4 h-4" />,
  'activity': <Share2 className="w-4 h-4" />,
  'mention': <MessageSquare className="w-4 h-4" />,
};

const COLOR_MAP: Record<string, string> = {
  'info': 'bg-blue-50 border-blue-200 text-blue-900',
  'success': 'bg-green-50 border-green-200 text-green-900',
  'warning': 'bg-yellow-50 border-yellow-200 text-yellow-900',
  'error': 'bg-red-50 border-red-200 text-red-900',
};

// Mock notifications
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'info',
    category: 'collaboration',
    title: 'User joined',
    message: 'Alice Johnson has joined the project',
    timestamp: new Date(Date.now() - 2 * 60000),
    read: false,
  },
  {
    id: 'notif-2',
    type: 'success',
    category: 'activity',
    title: 'Changes saved',
    message: '3 components added, 2 connections created',
    timestamp: new Date(Date.now() - 5 * 60000),
    read: false,
  },
  {
    id: 'notif-3',
    type: 'info',
    category: 'mention',
    title: '@bob mentioned you',
    message: 'Bob Smith: "Can you review this API design?"',
    timestamp: new Date(Date.now() - 10 * 60000),
    read: true,
  },
  {
    id: 'notif-4',
    type: 'success',
    category: 'activity',
    title: 'Export complete',
    message: 'Architecture exported as YAML format',
    timestamp: new Date(Date.now() - 1 * 60 * 60000),
    read: true,
  },
];

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications = MOCK_NOTIFICATIONS,
  onMarkAsRead,
  onClearAll,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = notifications.filter((n) =>
    filter === 'all' ? true : !n.read
  );

  return (
    <>
      {/* Floating Bell Icon */}
      <button
        onClick={() => {}}
        className="fixed bottom-20 right-4 z-40 relative"
      >
        <Bell className="w-6 h-6 text-slate-600 hover:text-slate-900" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="px-6 py-3 border-b border-slate-200 flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                  filter === 'all'
                    ? 'bg-cyan-100 text-cyan-900'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                  filter === 'unread'
                    ? 'bg-cyan-100 text-cyan-900'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No {filter === 'unread' ? 'unread ' : ''}notifications</p>
                  </div>
                </div>
              ) : (
                filtered.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-lg border-2 ${COLOR_MAP[notif.type]} ${
                      !notif.read ? 'bg-opacity-100' : 'bg-opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-1">
                        {ICON_MAP[notif.category]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">{notif.title}</p>
                          {!notif.read && (
                            <span className="w-2 h-2 bg-cyan-600 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm opacity-90">{notif.message}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {notif.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {!notif.read && (
                        <button
                          onClick={() => onMarkAsRead?.(notif.id)}
                          className="px-3 py-1 bg-white bg-opacity-50 hover:bg-opacity-100 rounded text-xs font-semibold transition"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-6 py-3 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={onClearAll}
                  className="text-sm text-slate-600 hover:text-slate-900 font-medium transition"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationCenter;
