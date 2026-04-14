import { CursorUpdate } from '@/types/realtime';

interface RemoteCursorProps {
  cursor: CursorUpdate;
}

function RemoteCursor({ cursor }: RemoteCursorProps) {
  return (
    <div
      className="fixed pointer-events-none flex items-center gap-1"
      style={{
        left: `${cursor.cursor.x}px`,
        top: `${cursor.cursor.y}px`,
        transition: 'all 0.05s ease-out',
      }}
    >
      {/* Cursor pointer */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 0L0 16L4.5 9.5L11.5 15L15 11L8.5 4.5L14 0H0Z"
          fill={cursor.color}
        />
      </svg>
      {/* Username label */}
      <div
        className="px-2 py-1 rounded text-xs text-white font-semibold whitespace-nowrap"
        style={{ backgroundColor: cursor.color }}
      >
        {cursor.username}
      </div>
    </div>
  );
}

interface RemoteCursorsOverlayProps {
  remoteCursors: CursorUpdate[];
}

export function RemoteCursorsOverlay({ remoteCursors }: RemoteCursorsOverlayProps) {
  if (remoteCursors.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {remoteCursors.map((cursor) => (
        <RemoteCursor key={cursor.socketId} cursor={cursor} />
      ))}
    </div>
  );
}

export default RemoteCursorsOverlay;
