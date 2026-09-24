/** Minimal shape needed to walk a parent/child chain. */
interface ParentLink {
  id: string;
  parentId: string | null;
}

/** True if `frameId` is nested (directly or transitively) inside `ancestorId`. */
export function isDescendant(frameId: string, ancestorId: string, frames: ParentLink[]): boolean {
  const byId = new Map(frames.map((f) => [f.id, f]));
  let cursor = byId.get(frameId)?.parentId ?? null;
  while (cursor) {
    if (cursor === ancestorId) return true;
    cursor = byId.get(cursor)?.parentId ?? null;
  }
  return false;
}

/** The minimum a node/frame must expose to classify a React Flow `remove`
 * change as user-requested or cascaded from a deleted ancestor frame. */
export interface RemovalCandidate {
  parentNode?: string;
  /** True when the user themselves selected this item (so its removal is
   * genuinely user-initiated, not a side effect of its parent's removal). */
  selected?: boolean;
}

/**
 * React Flow's `deleteElements` (the Delete-key path) emits a `remove` change
 * not just for the selected node but for every descendant of it too. Frames are
 * meant to UNGROUP their children on delete, never take them down with them, so
 * those cascaded child removals have to be discarded before they reach
 * `applyNodeChanges`.
 *
 * Returns true when `item`'s removal was cascaded from one of
 * `removedFrameIds` — i.e. its parent is a frame being removed and the item was
 * not itself selected by the user.
 */
export function isCascadedFrameRemoval(
  item: RemovalCandidate | undefined,
  removedFrameIds: ReadonlySet<string>
): boolean {
  if (!item || !item.parentNode) return false;
  if (item.selected) return false;
  return removedFrameIds.has(item.parentNode);
}

/** A frame's bounds, in ABSOLUTE canvas coordinates (e.g. React Flow's
 * `positionAbsolute`, not a nested frame's parent-relative `position`). */
export interface FrameBox extends ParentLink {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** The item being dragged (a node or a frame), in the same absolute space. */
export interface DraggedBox {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Finds which frame a dragged node/frame should be reparented into: the
 * innermost (smallest-area) frame whose bounds contain the dragged box's
 * center point. Excludes the dragged item itself and any frame that is its
 * own descendant, to prevent creating a cycle. Returns null if the drop
 * point isn't over any eligible frame.
 */
export function findContainingFrame(dragged: DraggedBox, frames: FrameBox[]): string | null {
  const centerX = dragged.left + dragged.width / 2;
  const centerY = dragged.top + dragged.height / 2;

  let best: FrameBox | null = null;
  for (const f of frames) {
    if (f.id === dragged.id) continue;
    if (isDescendant(f.id, dragged.id, frames)) continue;
    const within =
      centerX >= f.left && centerX <= f.left + f.width &&
      centerY >= f.top && centerY <= f.top + f.height;
    if (!within) continue;
    if (!best || f.width * f.height < best.width * best.height) best = f;
  }
  return best ? best.id : null;
}

/** Converts an absolute canvas position to one relative to a parent's
 * absolute position — what React Flow expects in `node.position` once a
 * node has a `parentNode`. */
export function toRelative(
  absolute: { x: number; y: number },
  parentAbsolute: { x: number; y: number }
): { x: number; y: number } {
  return { x: absolute.x - parentAbsolute.x, y: absolute.y - parentAbsolute.y };
}

interface RelativeFrame extends ParentLink {
  position: { x: number; y: number };
}

/**
 * Computes an absolute canvas position by walking up a `parentId` chain,
 * summing each ancestor's own (parent-relative) position. Used where a live
 * React Flow instance isn't available to read its auto-maintained
 * `positionAbsolute` — e.g. inside Zustand store actions.
 */
export function absolutePosition(
  position: { x: number; y: number },
  parentId: string | null | undefined,
  frames: RelativeFrame[]
): { x: number; y: number } {
  const byId = new Map(frames.map((f) => [f.id, f]));
  let x = position.x;
  let y = position.y;
  let cursor = parentId ?? null;
  while (cursor) {
    const parent = byId.get(cursor);
    if (!parent) break;
    x += parent.position.x;
    y += parent.position.y;
    cursor = parent.parentId;
  }
  return { x, y };
}
