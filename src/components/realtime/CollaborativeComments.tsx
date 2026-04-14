'use client';

import React, { useState } from 'react';
import { X, Send, MessageCircle, ThumbsUp } from 'lucide-react';

export interface CommentThread {
  id: string;
  nodeId: string;
  nodeType: string;
  nodeName: string;
  comments: Comment[];
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  content: string;
  timestamp: Date;
  likes: number;
  likedBy: string[];
  replies?: Comment[];
}

interface CollaborativeCommentsProps {
  isOpen: boolean;
  onClose: () => void;
  threads: CommentThread[];
  currentUserId?: string;
  currentUserName?: string;
  onAddComment?: (threadId: string, content: string) => void;
  onResolveThread?: (threadId: string) => void;
}

export const CollaborativeComments: React.FC<CollaborativeCommentsProps> = ({
  isOpen,
  onClose,
  threads = [],
  currentUserName = 'You',
  onAddComment,
  onResolveThread,
}) => {
  const [selectedThread, setSelectedThread] = useState<CommentThread | null>(
    threads.length > 0 ? threads[0] : null
  );
  const [newComment, setNewComment] = useState('');
  const [showResolved, setShowResolved] = useState(false);

  const visibleThreads = threads.filter((t) => !t.isResolved || showResolved);
  const openThreads = threads.filter((t) => !t.isResolved);
  const resolvedThreads = threads.filter((t) => t.isResolved);

  const handleAddComment = () => {
    if (!selectedThread || !newComment.trim()) return;

    if (onAddComment) {
      onAddComment(selectedThread.id, newComment);
    }
    setNewComment('');
  };

  const handleResolveThread = () => {
    if (!selectedThread) return;
    if (onResolveThread) {
      onResolveThread(selectedThread.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Comments & Discussions
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Threads List */}
          <div className="w-80 border-r border-slate-200 bg-slate-50 overflow-y-auto p-4 space-y-2">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setShowResolved(false)}
                className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  !showResolved
                    ? 'bg-cyan-100 text-cyan-900'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Open ({openThreads.length})
              </button>
              <button
                onClick={() => setShowResolved(true)}
                className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  showResolved
                    ? 'bg-green-100 text-green-900'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Resolved ({resolvedThreads.length})
              </button>
            </div>

            {visibleThreads.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No {showResolved ? 'resolved' : 'open'} comments</p>
              </div>
            ) : (
              visibleThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className={`w-full text-left p-3 rounded-lg transition flex items-start gap-2 ${
                    selectedThread?.id === thread.id
                      ? 'bg-cyan-100 border-2 border-cyan-500'
                      : 'bg-white border-2 border-transparent hover:bg-slate-100'
                  }`}
                >
                  <div className="mt-0.5">
                    <MessageCircle className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {thread.nodeName}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {thread.comments[0]?.content || 'No comments'} {thread.isResolved && (
                        <span className="inline-block ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                          ✓ Resolved
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {thread.comments.length} comment{thread.comments.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Thread Details */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedThread ? (
              <>
                {/* Thread Header */}
                <div className="px-6 py-4 border-b border-slate-200 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {selectedThread.nodeName}
                    </h3>
                    {!selectedThread.isResolved && (
                      <button
                        onClick={handleResolveThread}
                        className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition"
                      >
                        ✓ Resolve
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    {selectedThread.nodeType} • Created {selectedThread.createdAt.toLocaleString()}
                  </p>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                  {selectedThread.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold text-white"
                        style={{ backgroundColor: comment.authorColor }}
                      >
                        {comment.authorName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-semibold text-slate-900">
                            {comment.authorName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {comment.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <p className="text-sm text-slate-700 mb-2">{comment.content}</p>
                        <button className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900">
                          <ThumbsUp className="w-3 h-3" />
                          <span>
                            {comment.likes}{' '}
                            {comment.likes === 1 ? 'like' : 'likes'}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                {!selectedThread.isResolved && (
                  <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                    <div className="flex gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold text-white bg-cyan-600"
                      >
                        {currentUserName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment();
                            }
                          }}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-slate-300 transition font-semibold text-sm flex items-center gap-1"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">No thread selected</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeComments;
