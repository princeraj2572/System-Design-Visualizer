'use client';

import React from 'react';

export interface RemoteUser {
  id: string;
  name: string;
  color: string;
  cursorX?: number;
  cursorY?: number;
  lastActive: Date;
  isActive: boolean;
  selectedNodeId?: string;
}

interface EnhancedPresenceIndicatorProps {
  activeUsers: RemoteUser[];
  currentUserId?: string;
  isConnected: boolean;
}

export const EnhancedPresenceIndicator: React.FC<EnhancedPresenceIndicatorProps> = ({
  activeUsers = [],
  currentUserId,
  isConnected,
}) => {
  const otherUsers = activeUsers.filter((u) => u.id !== currentUserId);
  const now = new Date();

  // Determine user status
  const getStatus = (user: RemoteUser) => {
    if (!user.isActive) return 'Idle';
    const timeSinceActive = (now.getTime() - user.lastActive.getTime()) / 1000;
    if (timeSinceActive < 5) return 'Editing';
    if (timeSinceActive < 30) return 'Active';
    return 'Idle';
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2">
      {/* Connection Status */}
      <div className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${
        isConnected
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}>
        <span className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-600 animate-pulse' : 'bg-red-600'
        }`} />
        {isConnected ? 'Connected' : 'Offline'}
      </div>

      {/* Active Users List */}
      {otherUsers.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 max-w-xs">
          <div className="text-xs font-semibold text-slate-700 mb-2">
            {otherUsers.length} user{otherUsers.length !== 1 ? 's' : ''} online
          </div>
          <div className="space-y-2">
            {otherUsers.map((user) => {
              const status = getStatus(user);
              
              return (
                <div key={user.id} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: user.color }}
                    title={user.name}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-600">{status}</p>
                  </div>
                  {user.selectedNodeId && (
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 truncate">
                      {user.selectedNodeId}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedPresenceIndicator;
