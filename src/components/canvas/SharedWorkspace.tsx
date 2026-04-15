'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, Users } from 'lucide-react';

interface SharedWorkspaceProps {
  projectId: string;
  projectName?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ShareSettings {
  shareLink: string;
  permissions: 'view' | 'edit' | 'admin';
  expiresAt?: Date;
  maxUsers?: number;
  requiresPassword: boolean;
  password?: string;
}

interface SharedUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: Date;
  lastActive: Date;
  sessionId?: string;
}

export const SharedWorkspace: React.FC<SharedWorkspaceProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    shareLink: `https://visualizer.com/share/${projectId}?token=abc123def456`,
    permissions: 'edit',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60000),
    maxUsers: 10,
    requiresPassword: false,
  });

  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([
    {
      id: 'user-1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'owner',
      joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60000),
      lastActive: new Date(),
    },
    {
      id: 'user-2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      role: 'editor',
      joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60000),
      lastActive: new Date(Date.now() - 30 * 60000),
      sessionId: 'session-2',
    },
    {
      id: 'user-3',
      name: 'Carol Williams',
      email: 'carol@example.com',
      role: 'viewer',
      joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60000),
      lastActive: new Date(Date.now() - 2 * 24 * 60 * 60000),
    },
  ]);

  const [copiedLink, setCopiedLink] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'editor' | 'viewer'>('editor');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareSettings.shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleInviteUser = () => {
    if (!email) return;

    // In production, this would send an invite via email
    const newUser: SharedUser = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: selectedRole as 'editor' | 'viewer',
      joinedAt: new Date(),
      lastActive: new Date(),
    };

    setSharedUsers([...sharedUsers, newUser]);
    setEmail('');
  };

  const handleRevokeAccess = (userId: string) => {
    setSharedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleUpdateRole = (userId: string, newRole: 'owner' | 'editor' | 'viewer') => {
    setSharedUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'editor':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'viewer':
        return 'bg-slate-100 text-slate-900 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-900 border-slate-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Share2 size={24} className="text-cyan-600" />
            <h2 className="text-2xl font-bold text-slate-900">Share Workspace</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Share Link Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Share Link</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={shareSettings.shareLink}
                readOnly
                className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm font-mono text-slate-600"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors flex items-center gap-2"
              >
                {copiedLink ? (
                  <>
                    <Check size={16} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Share Settings */}
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Permissions</label>
                  <select
                    value={shareSettings.permissions}
                    onChange={(e) =>
                      setShareSettings({
                        ...shareSettings,
                        permissions: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  >
                    <option value="view">View Only</option>
                    <option value="edit">Edit</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Max Users</label>
                  <input
                    type="number"
                    value={shareSettings.maxUsers || ''}
                    onChange={(e) =>
                      setShareSettings({
                        ...shareSettings,
                        maxUsers: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shareSettings.requiresPassword}
                    onChange={(e) =>
                      setShareSettings({
                        ...shareSettings,
                        requiresPassword: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-slate-700">Require password to access</span>
                </label>
                {shareSettings.requiresPassword && (
                  <input
                    type="password"
                    placeholder="Password"
                    className="mt-2 w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Expires At</label>
                <input
                  type="datetime-local"
                  value={shareSettings.expiresAt?.toISOString().slice(0, 16) || ''}
                  onChange={(e) =>
                    setShareSettings({
                      ...shareSettings,
                      expiresAt: e.target.value ? new Date(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                />
              </div>
            </div>
          </div>

          {/* Invite Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Invite Users</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
              />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 rounded text-sm"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                onClick={handleInviteUser}
                className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors font-medium"
              >
                Invite
              </button>
            </div>
          </div>

          {/* Shared Users */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users size={20} className="text-cyan-600" />
              <h3 className="font-semibold text-slate-900">
                Shared With ({sharedUsers.length})
              </h3>
            </div>
            <div className="space-y-2">
              {sharedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-600">{user.email}</div>
                    {user.sessionId && (
                      <div className="text-xs text-green-600 font-semibold mt-1">● Online now</div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value as any)}
                      disabled={user.role === 'owner'}
                      className={`px-2 py-1 rounded text-xs font-medium border cursor-pointer ${getRoleColor(
                        user.role
                      )}`}
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    {user.role !== 'owner' && (
                      <button
                        onClick={() => handleRevokeAccess(user.id)}
                        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
