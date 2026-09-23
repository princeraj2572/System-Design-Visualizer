# Grouping / Containers ("Frames") — Design

Date: 2026-09-24
Status: Approved, pending implementation plan

## Summary

Add a resizable "frame" container (VPC, subnet, region, "backend cluster", etc.)
that architecture nodes — and other frames — can be dropped into, dragged
together with, and visually organized by. Built on React Flow's native
`parentNode`/`extent` subflow support rather than custom containment logic.

## Goals

- Drag a node onto a frame; it visually joins the frame and moves with it.
- Frames are resizable, nestable, and carry an editable title + a color from
  a small preset palette.
- Undo/redo, save/load (JSON), and PNG export all work with frames.

## Non-goals (v1)

- Mermaid export does not represent frames as subgraphs (flat flowchart, as
  today).
- Auto Layout does not account for frame membership — it may visually move a
  node out of its frame's bounds. Known limitation, acceptable for v1.
- No semantic/validation meaning attached to frame membership (e.g. no
  "client node in DMZ frame talks directly to backend" rule). Purely
  organizational, like Excalidraw/FigJam frames.
- No auto-fit-to-contents resize action.

## Approach

React Flow 11 (already a dependency) has first-class subflow support: a
node's `parentNode` field (native to RF's `Node<T>` type) plus
`extent: 'parent'` makes RF automatically move children when the parent
moves, clip them to its bounds, and maintain a `positionAbsolute` derived
field for every node regardless of nesting.

This was chosen over building custom containment metadata/logic (tracking a
`parentFrameId`, manually moving children, manually clipping) because RF
already implements exactly this, correctly, and the codebase's existing
`shapes` domain (parallel to `nodes`, merged only at the React Flow render
boundary) is a proven pattern to extend.

## Data model

```ts
// types/index.ts
export interface FrameData {
  title: string;
  color: string;   // hex, from a small preset palette
  width: number;
  height: number;
}
export type FrameNode = Node<FrameData>;
```

`FrameNode` sits parallel to `ShapeNode` — a separate domain from `ArchNode`,
since frames don't participate in architecture validation, connections, or
the palette.

`Project` gains an optional `frames: FrameNode[]` field (optional for
backward-compat with projects saved before this feature).

## Store (`useCanvasStore.ts`)

New state:
- `frames: FrameNode[]`
- `selectedFrameId: string | null`

New actions (mirroring the existing shape actions):
- `addFrame({ position, width, height, title, color })` → snapshot, push a
  new `FrameNode`, return its id. Used by the Frame draw tool.
- `updateFrameData(id, data)` → patch title/color. No snapshot (same as
  `updateShapeData` — text edits shouldn't spam undo history keystroke by
  keystroke).
- `deleteFrame(id)` → snapshot; **ungroup** semantics — clear
  `parentNode`/`extent` on any node/frame whose `parentNode === id`
  (converting position back to absolute via `positionAbsolute`), then remove
  the frame. Children are not cascade-deleted.
- `reparentNode(id, parentId | null, position)` → snapshot; sets
  `parentNode`/`extent`/`position` on a node or frame. Shared by both "drop a
  node onto a frame" and "drag a frame onto another frame".
- `onFramesChange` → same pattern as `onShapesChange` (applies RF's
  `NodeChange[]`, snapshotting on remove).

`HistoryEntry` gains a `frames` field; `snapshot`/`undo`/`redo` extend to
clone/restore it, matching the existing `shapes` handling exactly.
`getProject`/`loadProject`/`clearCanvas` include `frames` the same way they
already include `shapes`.

## Canvas interaction

**Creation.** `ToolId` gains `'frame'`. `DrawToolbar` gets a Frame button
next to the existing shape tools. Drag-to-size follows the same
`onCanvasMouseDown` → `drawStateRef` → `finishDrawing` path already used for
`rectangle`/`ellipse`, calling `addFrame` instead of `addShape`. A plain
click (no drag) creates a default 240×160 frame.

**Rendering & z-order.** `nodeTypes` gains `frame: FrameNode` (new
component, `components/nodes/FrameNode.tsx`). `allNodes` becomes
`[...framesForDisplay, ...displayNodes, ...shapesForDisplay, ...drawPreview]`
— frames first, since RF requires a parent to precede its children in the
array, and visually frames sit behind everything else. Nested frames are
ordered by depth (parent frames before child frames) via a simple sort.

The `FrameNode` component renders a rounded, dashed-border box tinted with
the frame's color, a title label pinned to the top-left (double-click →
inline edit), and wraps RF's built-in `NodeResizer` for manual resize
handles. No auto-fit logic.

**Reparenting on drag-stop.** In `onNodeDragStop` (currently just clears
snap guides), after a drag finishes: take the dragged node/frame's
`positionAbsolute` + size, test for overlap against all frames except itself
and its own descendants (cycle prevention — walk the candidate frame's
ancestor chain; skip if the dragged node appears in it). If multiple frames
overlap, pick the smallest-area (innermost) one, matching Figma's
convention. Call `reparentNode` with the position converted to be relative
to the new parent, or clear parenting if nothing overlaps. This only fires
on drop, not on every intermediate move, to avoid flicker; a border-glow
highlight on the candidate frame during drag gives live feedback, computed
the same way the existing snap `guides` are computed during drag.

**Snapping fix.** `computeSnap`'s inputs currently build `SnapBox`es from
`n.position.x/y`, which becomes parent-relative once a node has a
`parentNode`. Fix: build `SnapBox`es from `n.positionAbsolute ?? n.position`
for every node (RF keeps `positionAbsolute` in sync automatically), so nodes
snap correctly against others regardless of frame membership, then convert
the resulting snapped absolute position back to parent-relative before
writing `change.position`.

## Edge cases

- **Delete/ungroup:** deleting a frame un-parents its children (position
  converted back to absolute) rather than cascading. Deleting a node inside
  a frame works exactly as it does today.
- **Cycle prevention:** covered above — a frame cannot become its own
  descendant's child.
- **Selection:** clicking a node inside a frame selects the node (RF
  hit-tests children before their parent by default) — no extra code needed.
  Clicking a frame's border/title selects the frame (`selectedFrameId`),
  showing its resize handles.
- **Validation:** unaffected — `runValidation` only iterates `ArchNode[]`;
  frames are a separate array, like shapes.
- **Export:** JSON export works automatically (`frames` is part of
  `Project`). PNG export is unaffected. Mermaid stays flat (non-goal, above).
- **Context menu:** frames get Duplicate/Delete entries mirroring the
  existing node context menu.

## Testing

- Store unit tests for `addFrame`/`updateFrameData`/`deleteFrame` (ungroup
  behavior)/`reparentNode` (including cycle-prevention rejection) and
  undo/redo round-tripping frames.
- `computeSnap` tests using `positionAbsolute`-derived boxes across nested
  frames.
- Manual/interaction verification: drag a node into a frame, drag the frame
  and confirm the node follows, resize a frame, nest a frame inside another,
  delete a frame and confirm children survive un-parented, save/load a
  project with frames.
