import { RealtimeUser, CursorUpdate, NodeSelectionUpdate } from '@/types/realtime';

interface PresenceIndicatorProps {
  activeUsers: RealtimeUser[];
  remoteCursors: CursorUpdate[];
  selectedNodes: NodeSelectionUpdate[];
  isConnected: boolean;
}

export function PresenceIndicator({
  activeUsers,
  remoteCursors,
  isConnected,
}: PresenceIndicatorProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {/* Connection Status */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
          isConnected
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-600' : 'bg-red-600'
          }`}
        />
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>

      {/* Active Users Count */}
      {activeUsers.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
          <div className="text-xs font-semibold text-gray-700 mb-2">
            Active Users ({activeUsers.length})
          </div>
          <div className="flex flex-col gap-1">
            {activeUsers.map((user) => (
              <div key={user.userId} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <span className="text-xs text-gray-700">{user.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remote Cursors */}
      {remoteCursors.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
          <div className="text-xs font-semibold text-gray-700 mb-2">
            Cursors ({remoteCursors.length})
          </div>
          <div className="flex flex-col gap-1">
            {remoteCursors.map((cursor) => (
              <div key={cursor.socketId} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cursor.color }}
                />
                <span className="text-xs text-gray-600">
                  {cursor.username}: ({Math.round(cursor.cursor.x)}, {Math.round(cursor.cursor.y)})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PresenceIndicator;
