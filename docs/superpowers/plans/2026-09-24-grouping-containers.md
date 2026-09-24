# Grouping / Containers ("Frames") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a resizable, nestable "frame" container that architecture nodes (and other frames) can be dropped into, dragged together with, and organized by — built on React Flow's native `parentNode`/`extent` subflow support.

**Architecture:** A new `FrameNode`/`FrameData` domain type sits parallel to the existing `ShapeNode` domain (its own array in the Zustand store, merged into React Flow's node list only at the render boundary). Containment is native React Flow parent/child (`parentNode` + `extent: 'parent'`), so move-together, clipping, and resize handles come from the library rather than custom code. A small pure module (`components/canvas/reparenting.ts`) holds the geometry (overlap detection, cycle prevention, coordinate conversion) so it's unit-testable without mocking React Flow.

**Tech Stack:** Next.js 14, TypeScript, React Flow 11 (`reactflow`), Zustand, Tailwind. Vitest is added in Task 1 as this repo has no test runner yet.

**Spec:** `docs/superpowers/specs/2026-09-24-grouping-containers-design.md`

## Global Constraints

- Containment is implemented via React Flow's native `parentNode`/`extent: 'parent'` — no custom containment/move-together/clipping logic.
- `FrameNode`/`FrameData` is a separate domain from `ArchNode`, parallel to `ShapeNode` — frames never appear in `runValidation`, the palette, or connection rules.
- Frames are nestable to arbitrary depth; a frame can never become its own descendant's child (cycle prevention required).
- Deleting a frame **ungroups** its direct children (position converted to absolute, `parentNode`/`extent` cleared) — it never cascade-deletes them.
- Frame membership is assigned by auto-detect-on-drop (center-point containment), not an explicit "add to frame" action.
- Frames are created via a dedicated "Frame" tool in `DrawToolbar` (drag-to-size, like the existing rectangle tool), not via the component palette.
- A frame carries only a title (inline-edited on canvas) and a color from a small fixed preset list — no semantic "kind" dropdown, no icon.
- Mermaid export stays flat (no subgraphs). Auto Layout does not account for frame membership. No auto-fit-to-contents resize action. None of these are in scope for this plan.

---

### Task 1: Add Vitest test infrastructure

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: `npm test` (runs `vitest run`), usable by every later task's test steps.

- [ ] **Step 1: Install Vitest and the tsconfig-paths plugin**

Run: `npm install -D vitest vite-tsconfig-paths`

- [ ] **Step 2: Create the Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
  },
});
```

- [ ] **Step 3: Add the `test` script**

In `package.json`, inside `"scripts"`, add:

```json
"test": "vitest run"
```

(Alongside the existing `dev`/`build`/`start`/`lint` scripts — the whole `scripts` block should read `dev`, `build`, `start`, `lint`, `test`.)

- [ ] **Step 4: Verify the runner works end-to-end**

Create a throwaway file `vitest.smoke.test.ts` at the repo root:

```ts
import { describe, it, expect } from 'vitest';

describe('vitest smoke test', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run: `npm test`
Expected: 1 test file, 1 test, PASS.

Delete `vitest.smoke.test.ts` — it was only there to prove the runner works; real tests start in Task 3.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "Add Vitest test infrastructure"
```

---

### Task 2: Frame data model

**Files:**
- Modify: `types/index.ts`

**Interfaces:**
- Produces: `FrameData` (`{ title: string; color: string; width: number; height: number }`), `FrameNode` (`Node<FrameData>`), `ToolId` including `'frame'`, `Project.frames: FrameNode[]`.

- [ ] **Step 1: Add `FrameData`/`FrameNode`, extend `ToolId`, and extend `Project`**

In `types/index.ts`, right after the existing `ShapeNode` block (after line `export type ShapeNode = Node<ShapeData>;`), add:

```ts
// Resizable, nestable containers ("VPC", "subnet", "backend cluster", etc.)
// that architecture nodes — and other frames — can be dropped into. A
// separate domain from ArchNode/NodeData, same as ShapeNode: frames don't
// participate in system-design validation, connection rules, or the node
// palette. Containment is React Flow's native parentNode/extent mechanism,
// applied to nodes whose id appears in this array's elements.
export interface FrameData {
  title: string;
  color: string;
  width: number;
  height: number;
}

export type FrameNode = Node<FrameData>;
```

Change the `ToolId` line from:

```ts
export type ToolId = 'select' | 'rectangle' | 'ellipse' | 'line' | 'arrow' | 'pencil' | 'text';
```

to:

```ts
export type ToolId = 'select' | 'rectangle' | 'ellipse' | 'line' | 'arrow' | 'pencil' | 'text' | 'frame';
```

Change the `Project` interface from:

```ts
export interface Project {
  id: string;
  name: string;
  nodes: ArchNode[];
  edges: ArchEdge[];
  shapes: ShapeNode[];
  documentContent: string;
  createdAt: string;
  updatedAt: string;
}
```

to:

```ts
export interface Project {
  id: string;
  name: string;
  nodes: ArchNode[];
  edges: ArchEdge[];
  shapes: ShapeNode[];
  frames: FrameNode[];
  documentContent: string;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: errors in `store/useCanvasStore.ts` (it builds a `Project` without `frames` yet, and doesn't destructure the new `ToolId` value) — that's expected; Task 4 fixes them. Confirm there are no errors in `types/index.ts` itself.

- [ ] **Step 3: Commit**

```bash
git add types/index.ts
git commit -m "Add FrameData/FrameNode types and extend ToolId/Project for frames"
```

---

### Task 3: Pure canvas geometry helpers (reparenting + snapping regression tests)

**Files:**
- Create: `components/canvas/reparenting.ts`
- Test: `components/canvas/reparenting.test.ts`
- Test: `components/canvas/snapping.test.ts`

**Interfaces:**
- Consumes: none (pure, no imports from the rest of the app).
- Produces: `isDescendant(frameId: string, ancestorId: string, frames: {id, parentId}[]): boolean`, `findContainingFrame(dragged: DraggedBox, frames: FrameBox[]): string | null`, `toRelative(absolute, parentAbsolute): {x,y}`, `absolutePosition(position, parentId, frames: {id, parentId, position}[]): {x,y}`. Consumed by the store (Task 4) and `ArchitectureCanvas` (Tasks 8–9).

- [ ] **Step 1: Write the failing tests for `isDescendant` and `findContainingFrame`**

Create `components/canvas/reparenting.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { findContainingFrame, isDescendant, toRelative, absolutePosition, type FrameBox } from './reparenting';

describe('isDescendant', () => {
  const frames = [
    { id: 'a', parentId: null },
    { id: 'b', parentId: 'a' },
    { id: 'c', parentId: 'b' },
  ];

  it('returns true for a direct child', () => {
    expect(isDescendant('b', 'a', frames)).toBe(true);
  });

  it('returns true for a transitive (grandchild) descendant', () => {
    expect(isDescendant('c', 'a', frames)).toBe(true);
  });

  it('returns false for an unrelated frame', () => {
    expect(isDescendant('a', 'c', frames)).toBe(false);
  });

  it('returns false for a frame with no parent', () => {
    expect(isDescendant('a', 'b', frames)).toBe(false);
  });
});

describe('findContainingFrame', () => {
  const frames: FrameBox[] = [
    { id: 'outer', parentId: null, left: 0, top: 0, width: 400, height: 400 },
    { id: 'inner', parentId: 'outer', left: 50, top: 50, width: 100, height: 100 },
  ];

  it('picks the innermost frame when nested frames both contain the point', () => {
    const dragged = { id: 'node-1', left: 80, top: 80, width: 20, height: 20 };
    expect(findContainingFrame(dragged, frames)).toBe('inner');
  });

  it('picks the outer frame when the point is only inside it', () => {
    const dragged = { id: 'node-1', left: 10, top: 10, width: 20, height: 20 };
    expect(findContainingFrame(dragged, frames)).toBe('outer');
  });

  it('returns null when the point is outside every frame', () => {
    const dragged = { id: 'node-1', left: 500, top: 500, width: 20, height: 20 };
    expect(findContainingFrame(dragged, frames)).toBeNull();
  });

  it('excludes the dragged item itself', () => {
    const dragged = { id: 'inner', left: 80, top: 80, width: 20, height: 20 };
    expect(findContainingFrame(dragged, frames)).toBe('outer');
  });

  it('excludes a frame that is a descendant of the dragged item, to prevent cycles', () => {
    // Dragging "outer" itself over "inner"'s area must not make it a child of "inner".
    const dragged = { id: 'outer', left: 80, top: 80, width: 20, height: 20 };
    expect(findContainingFrame(dragged, frames)).toBeNull();
  });
});

describe('toRelative', () => {
  it('subtracts the parent absolute position', () => {
    expect(toRelative({ x: 120, y: 80 }, { x: 20, y: 20 })).toEqual({ x: 100, y: 60 });
  });

  it('returns the same point when the parent is at the origin', () => {
    expect(toRelative({ x: 45, y: 12 }, { x: 0, y: 0 })).toEqual({ x: 45, y: 12 });
  });
});

describe('absolutePosition', () => {
  const frames = [
    { id: 'a', parentId: null, position: { x: 100, y: 100 } },
    { id: 'b', parentId: 'a', position: { x: 20, y: 20 } },
  ];

  it('returns the position unchanged when there is no parent', () => {
    expect(absolutePosition({ x: 5, y: 5 }, null, frames)).toEqual({ x: 5, y: 5 });
  });

  it("adds a single parent's position", () => {
    expect(absolutePosition({ x: 5, y: 5 }, 'a', frames)).toEqual({ x: 105, y: 105 });
  });

  it('sums every ancestor in a nested chain', () => {
    // grandchild's own relative position (5,5), inside "b" (20,20), inside "a" (100,100)
    expect(absolutePosition({ x: 5, y: 5 }, 'b', frames)).toEqual({ x: 125, y: 125 });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run components/canvas/reparenting.test.ts`
Expected: FAIL — `./reparenting` module not found.

- [ ] **Step 3: Implement `reparenting.ts`**

Create `components/canvas/reparenting.ts`:

```ts
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run components/canvas/reparenting.test.ts`
Expected: PASS, all tests green.

- [ ] **Step 5: Add regression tests for the existing `computeSnap`**

`computeSnap` (`components/canvas/snapping.ts`) already exists and has no tests. It's about to gain a new caller (Task 9) that builds its boxes from absolute coordinates instead of raw `position`; lock down its current, correct behavior first.

Create `components/canvas/snapping.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { computeSnap, type SnapBox } from './snapping';

describe('computeSnap', () => {
  it("snaps the dragged box's left edge to another box's left edge within the threshold", () => {
    const dragged: SnapBox = { left: 103, top: 0, width: 160, height: 116 };
    const others: SnapBox[] = [{ left: 100, top: 300, width: 160, height: 116 }];
    const result = computeSnap(dragged, others);
    expect(result.x).toBe(100);
    expect(result.guideX).toBe(100);
  });

  it('does not snap when outside the threshold', () => {
    const dragged: SnapBox = { left: 130, top: 0, width: 160, height: 116 };
    const others: SnapBox[] = [{ left: 100, top: 300, width: 160, height: 116 }];
    const result = computeSnap(dragged, others);
    expect(result.x).toBe(130);
    expect(result.guideX).toBeNull();
  });

  it('snaps against a candidate box built from absolute coordinates, independent of any parent frame nesting', () => {
    // Simulates the ArchitectureCanvas call site (Task 9): boxes are built
    // from each item's absolute canvas position, not the parent-relative
    // `position` a nested node carries, so this works whether or not either
    // box happens to live inside a frame.
    const parentAbsolute = { x: 500, y: 500 };
    const nestedNodeRelativePosition = { x: 20, y: 20 };
    const nestedNodeAbsolute = {
      x: parentAbsolute.x + nestedNodeRelativePosition.x,
      y: parentAbsolute.y + nestedNodeRelativePosition.y,
    };
    const dragged: SnapBox = { left: 523, top: 620, width: 160, height: 116 };
    const others: SnapBox[] = [{ left: nestedNodeAbsolute.x, top: nestedNodeAbsolute.y, width: 160, height: 116 }];
    const result = computeSnap(dragged, others);
    expect(result.x).toBe(520);
    expect(result.guideX).toBe(520);
  });

  it('snaps horizontally and vertically to two different neighbors independently', () => {
    const dragged: SnapBox = { left: 202, top: 298, width: 100, height: 100 };
    const others: SnapBox[] = [
      { left: 200, top: 0, width: 100, height: 100 },
      { left: 500, top: 300, width: 100, height: 100 },
    ];
    const result = computeSnap(dragged, others);
    expect(result.x).toBe(200);
    expect(result.y).toBe(300);
  });
});
```

- [ ] **Step 6: Run the snapping tests**

Run: `npx vitest run components/canvas/snapping.test.ts`
Expected: PASS — `computeSnap` already implements this correctly; these are regression tests for existing behavior, not new behavior.

- [ ] **Step 7: Run the full suite and commit**

Run: `npm test`
Expected: all tests PASS.

```bash
git add components/canvas/reparenting.ts components/canvas/reparenting.test.ts components/canvas/snapping.test.ts
git commit -m "Add pure geometry helpers for frame containment and snapping regression tests"
```

---

### Task 4: Store — frame state, actions, and history/serialization integration

**Files:**
- Modify: `store/useCanvasStore.ts`
- Test: `store/useCanvasStore.test.ts`

**Interfaces:**
- Consumes: `FrameData`, `FrameNode` (Task 2); `absolutePosition` (Task 3).
- Produces (new store state/actions, consumed by `FrameNode.tsx` in Task 5 and `ArchitectureCanvas.tsx` in Tasks 7–10): `frames: FrameNode[]`, `selectedFrameId: string | null`, `setSelectedFrame(id: string | null): void`, `addFrame(opts: { position: {x,y}; width: number; height: number; title: string; color: string }): string`, `updateFrameData(id: string, data: Partial<FrameData>): void`, `deleteFrame(id: string): void`, `duplicateFrame(id: string): void`, `reparentNode(id: string, parentId: string | null, position: {x,y}): void`, `onFramesChange(changes: NodeChange[]): void`.

- [ ] **Step 1: Write the failing tests**

Create `store/useCanvasStore.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { useCanvasStore } from './useCanvasStore';
import type { Project } from '@/types';

function resetStore() {
  useCanvasStore.setState({
    nodes: [],
    edges: [],
    shapes: [],
    frames: [],
    history: [],
    future: [],
    selectedNodeId: null,
    selectedShapeId: null,
    selectedFrameId: null,
  });
}

beforeEach(() => {
  resetStore();
});

describe('addFrame', () => {
  it('adds a frame with the given title, color, position and size', () => {
    const id = useCanvasStore.getState().addFrame({
      position: { x: 10, y: 20 },
      width: 240,
      height: 160,
      title: 'VPC',
      color: '#6366f1',
    });
    const frame = useCanvasStore.getState().frames.find((f) => f.id === id);
    expect(frame).toBeDefined();
    expect(frame?.data).toEqual({ title: 'VPC', color: '#6366f1', width: 240, height: 160 });
    expect(frame?.position).toEqual({ x: 10, y: 20 });
  });

  it('records a history entry so the addition can be undone', () => {
    useCanvasStore.getState().addFrame({ position: { x: 0, y: 0 }, width: 100, height: 100, title: 'A', color: '#000' });
    expect(useCanvasStore.getState().history.length).toBe(1);
  });
});

describe('updateFrameData', () => {
  it('patches only the given fields', () => {
    const id = useCanvasStore.getState().addFrame({ position: { x: 0, y: 0 }, width: 100, height: 100, title: 'A', color: '#000' });
    useCanvasStore.getState().updateFrameData(id, { title: 'Renamed' });
    const frame = useCanvasStore.getState().frames.find((f) => f.id === id);
    expect(frame?.data.title).toBe('Renamed');
    expect(frame?.data.color).toBe('#000');
  });
});

describe('reparentNode', () => {
  it('sets parentNode, extent, and the given position on a node', () => {
    const frameId = useCanvasStore.getState().addFrame({ position: { x: 0, y: 0 }, width: 300, height: 300, title: 'F', color: '#000' });
    useCanvasStore.getState().addNode('database', { x: 500, y: 500 });
    const nodeId = useCanvasStore.getState().nodes[0].id;

    useCanvasStore.getState().reparentNode(nodeId, frameId, { x: 15, y: 15 });

    const node = useCanvasStore.getState().nodes.find((n) => n.id === nodeId);
    expect(node?.parentNode).toBe(frameId);
    expect(node?.extent).toBe('parent');
    expect(node?.position).toEqual({ x: 15, y: 15 });
  });

  it('clears parentNode and extent when parentId is null', () => {
    const frameId = useCanvasStore.getState().addFrame({ position: { x: 0, y: 0 }, width: 300, height: 300, title: 'F', color: '#000' });
    useCanvasStore.getState().addNode('database', { x: 0, y: 0 });
    const nodeId = useCanvasStore.getState().nodes[0].id;
    useCanvasStore.getState().reparentNode(nodeId, frameId, { x: 15, y: 15 });

    useCanvasStore.getState().reparentNode(nodeId, null, { x: 200, y: 200 });

    const node = useCanvasStore.getState().nodes.find((n) => n.id === nodeId);
    expect(node?.parentNode).toBeUndefined();
    expect(node?.extent).toBeUndefined();
    expect(node?.position).toEqual({ x: 200, y: 200 });
  });

  it('reparents a frame (nesting) rather than a node', () => {
    const outerId = useCanvasStore.getState().addFrame({ position: { x: 0, y: 0 }, width: 400, height: 400, title: 'Outer', color: '#000' });
    const innerId = useCanvasStore.getState().addFrame({ position: { x: 500, y: 500 }, width: 100, height: 100, title: 'Inner', color: '#000' });

    useCanvasStore.getState().reparentNode(innerId, outerId, { x: 30, y: 30 });

    const inner = useCanvasStore.getState().frames.find((f) => f.id === innerId);
    expect(inner?.parentNode).toBe(outerId);
    expect(inner?.position).toEqual({ x: 30, y: 30 });
  });
});

describe('deleteFrame', () => {
  it('removes the frame and ungroups its direct children to their absolute position', () => {
    const parentId = useCanvasStore.getState().addFrame({ position: { x: 100, y: 100 }, width: 300, height: 300, title: 'Parent', color: '#000' });
    useCanvasStore.getState().addNode('database', { x: 0, y: 0 });
    const childId = useCanvasStore.getState().nodes[0].id;
    useCanvasStore.getState().reparentNode(childId, parentId, { x: 20, y: 20 });

    useCanvasStore.getState().deleteFrame(parentId);

    const state = useCanvasStore.getState();
    expect(state.frames.find((f) => f.id === parentId)).toBeUndefined();
    const child = state.nodes.find((n) => n.id === childId);
    expect(child?.parentNode).toBeUndefined();
    expect(child?.position).toEqual({ x: 120, y: 120 });
  });

  it('leaves grandchildren attached to their still-existing intermediate parent', () => {
    const outerId = useCanvasStore.getState().addFrame({ position: { x: 0, y: 0 }, width: 400, height: 400, title: 'Outer', color: '#000' });
    const innerId = useCanvasStore.getState().addFrame({ position: { x: 50, y: 50 }, width: 200, height: 200, title: 'Inner', color: '#000' });
    useCanvasStore.getState().reparentNode(innerId, outerId, { x: 50, y: 50 });
    useCanvasStore.getState().addNode('database', { x: 0, y: 0 });
    const childId = useCanvasStore.getState().nodes[0].id;
    useCanvasStore.getState().reparentNode(childId, innerId, { x: 10, y: 10 });

    useCanvasStore.getState().deleteFrame(outerId);

    const state = useCanvasStore.getState();
    expect(state.frames.find((f) => f.id === outerId)).toBeUndefined();
    const inner = state.frames.find((f) => f.id === innerId);
    expect(inner?.parentNode).toBeUndefined();
    expect(inner?.position).toEqual({ x: 50, y: 50 }); // 0,0 (outer) + 50,50
    const child = state.nodes.find((n) => n.id === childId);
    expect(child?.parentNode).toBe(innerId); // untouched — still nested in "Inner"
    expect(child?.position).toEqual({ x: 10, y: 10 });
  });
});

describe('duplicateFrame', () => {
  it('creates a copy offset by 32px with a new id, without duplicating children', () => {
    const frameId = useCanvasStore.getState().addFrame({ position: { x: 10, y: 10 }, width: 200, height: 150, title: 'F', color: '#111' });

    useCanvasStore.getState().duplicateFrame(frameId);

    const state = useCanvasStore.getState();
    expect(state.frames).toHaveLength(2);
    const clone = state.frames.find((f) => f.id !== frameId)!;
    expect(clone.position).toEqual({ x: 42, y: 42 });
    expect(clone.data).toEqual({ title: 'F', color: '#111', width: 200, height: 150 });
    expect(state.selectedFrameId).toBe(clone.id);
  });
});

describe('undo/redo with frames', () => {
  it('undoes and redoes frame creation', () => {
    const id = useCanvasStore.getState().addFrame({ position: { x: 0, y: 0 }, width: 100, height: 100, title: 'A', color: '#000' });
    expect(useCanvasStore.getState().frames).toHaveLength(1);

    useCanvasStore.getState().undo();
    expect(useCanvasStore.getState().frames).toHaveLength(0);

    useCanvasStore.getState().redo();
    expect(useCanvasStore.getState().frames.map((f) => f.id)).toEqual([id]);
  });
});

describe('getProject / loadProject', () => {
  it('round-trips frames through getProject and loadProject', () => {
    useCanvasStore.getState().addFrame({ position: { x: 5, y: 5 }, width: 100, height: 100, title: 'A', color: '#000' });
    const project = useCanvasStore.getState().getProject();
    expect(project.frames).toHaveLength(1);

    resetStore();
    useCanvasStore.getState().loadProject(project);
    expect(useCanvasStore.getState().frames).toHaveLength(1);
    expect(useCanvasStore.getState().frames[0].data.title).toBe('A');
  });

  it('defaults frames to an empty array when loading a project saved before this feature existed', () => {
    const legacyProject = {
      id: 'x', name: 'Legacy', nodes: [], edges: [], shapes: [],
      documentContent: '', createdAt: '', updatedAt: '',
    } as unknown as Project;
    useCanvasStore.getState().loadProject(legacyProject);
    expect(useCanvasStore.getState().frames).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run store/useCanvasStore.test.ts`
Expected: FAIL — `addFrame`/`updateFrameData`/`deleteFrame`/`duplicateFrame`/`reparentNode` are not functions; `frames`/`selectedFrameId` are undefined.

- [ ] **Step 3: Add imports and extend `HistoryEntry`/`snapshotKey`**

In `store/useCanvasStore.ts`, change the type import block from:

```ts
import type {
  ArchNode,
  ArchEdge,
  NodeType,
  NodeData,
  ValidationIssue,
  Project,
  ShapeNode,
  ShapeData,
  ShapeKind,
  ToolId,
  ViewMode,
} from '@/types';
```

to:

```ts
import type {
  ArchNode,
  ArchEdge,
  NodeType,
  NodeData,
  ValidationIssue,
  Project,
  ShapeNode,
  ShapeData,
  ShapeKind,
  FrameNode,
  FrameData,
  ToolId,
  ViewMode,
} from '@/types';
```

Add, right after that import block:

```ts
import { absolutePosition } from '@/components/canvas/reparenting';
```

Change `HistoryEntry` from:

```ts
interface HistoryEntry {
  nodes: ArchNode[];
  edges: ArchEdge[];
  shapes: ShapeNode[];
}
```

to:

```ts
interface HistoryEntry {
  nodes: ArchNode[];
  edges: ArchEdge[];
  shapes: ShapeNode[];
  frames: FrameNode[];
}
```

Change `snapshotKey` from:

```ts
function snapshotKey(nodes: ArchNode[], edges: ArchEdge[], shapes: ShapeNode[], documentContent: string): string {
  return JSON.stringify({ nodes, edges, shapes, documentContent });
}
```

to:

```ts
function snapshotKey(nodes: ArchNode[], edges: ArchEdge[], shapes: ShapeNode[], frames: FrameNode[], documentContent: string): string {
  return JSON.stringify({ nodes, edges, shapes, frames, documentContent });
}
```

- [ ] **Step 4: Add `frames`/`selectedFrameId` state and update the initial `savedSnapshot` call**

In the `CanvasStore` interface, after `selectedShapeId: string | null;`, add:

```ts
  frames: FrameNode[];
  selectedFrameId: string | null;
```

And after `setSelectedShape: (id: string | null) => void;` in the "Shape actions" interface block, add a new interface block:

```ts
  // Frame actions
  setSelectedFrame: (id: string | null) => void;
  addFrame: (frame: {
    position: { x: number; y: number };
    width: number;
    height: number;
    title: string;
    color: string;
  }) => string;
  updateFrameData: (id: string, data: Partial<FrameData>) => void;
  deleteFrame: (id: string) => void;
  duplicateFrame: (id: string) => void;
  reparentNode: (id: string, parentId: string | null, position: { x: number; y: number }) => void;
  onFramesChange: (changes: NodeChange[]) => void;
```

In the store's initial state object, change:

```ts
  selectedNodeId: null,
  selectedShapeId: null,
```

to:

```ts
  selectedNodeId: null,
  selectedShapeId: null,
  selectedFrameId: null,
```

and change:

```ts
  shapes: [],
```

(the initial-state one, not the interface one) to:

```ts
  shapes: [],
  frames: [],
```

Change the initial `savedSnapshot` line from:

```ts
  savedSnapshot: snapshotKey([], [], [], ''),
```

to:

```ts
  savedSnapshot: snapshotKey([], [], [], [], ''),
```

- [ ] **Step 5: Make `setSelectedNode`/`setSelectedShape`/`setActiveTool` mutually exclusive with the new frame selection, and add `setSelectedFrame`**

Change:

```ts
  setActiveTool: (tool) => set({ activeTool: tool, selectedShapeId: null, selectedNodeId: null }),

  setSelectedShape: (id) => set({ selectedShapeId: id, selectedNodeId: id ? null : get().selectedNodeId }),
```

to:

```ts
  setActiveTool: (tool) => set({ activeTool: tool, selectedShapeId: null, selectedNodeId: null, selectedFrameId: null }),

  setSelectedShape: (id) => set({
    selectedShapeId: id,
    selectedNodeId: id ? null : get().selectedNodeId,
    selectedFrameId: id ? null : get().selectedFrameId,
  }),

  setSelectedFrame: (id) => set({
    selectedFrameId: id,
    selectedNodeId: id ? null : get().selectedNodeId,
    selectedShapeId: id ? null : get().selectedShapeId,
  }),
```

And change:

```ts
  setSelectedNode: (id) => {
    set({ selectedNodeId: id, selectedShapeId: id ? null : get().selectedShapeId });
  },
```

to:

```ts
  setSelectedNode: (id) => {
    set({
      selectedNodeId: id,
      selectedShapeId: id ? null : get().selectedShapeId,
      selectedFrameId: id ? null : get().selectedFrameId,
    });
  },
```

- [ ] **Step 6: Add the frame CRUD actions**

Directly after the `deleteShape` action (before `onConnect:`), add:

```ts
  addFrame: ({ position, width, height, title, color }) => {
    get().snapshot();
    const id = uuidv4();
    const frame: FrameNode = {
      id,
      type: 'frame',
      position,
      data: { title, color, width, height },
    };
    set((state) => ({ frames: [...state.frames, frame] }));
    return id;
  },

  updateFrameData: (id, data) => {
    set((state) => ({
      frames: state.frames.map((f) => (f.id === id ? { ...f, data: { ...f.data, ...data } } : f)),
    }));
  },

  deleteFrame: (id) => {
    get().snapshot();
    set((state) => {
      const frameLinks = state.frames.map((f) => ({ id: f.id, parentId: f.parentNode ?? null, position: f.position }));
      const ungroupPosition = (child: { position: { x: number; y: number }; parentNode?: string }) =>
        absolutePosition(child.position, child.parentNode ?? null, frameLinks);

      return {
        nodes: state.nodes.map((n) =>
          n.parentNode === id
            ? { ...n, position: ungroupPosition(n), parentNode: undefined, extent: undefined }
            : n
        ),
        frames: state.frames
          .filter((f) => f.id !== id)
          .map((f) =>
            f.parentNode === id
              ? { ...f, position: ungroupPosition(f), parentNode: undefined, extent: undefined }
              : f
          ),
        selectedFrameId: state.selectedFrameId === id ? null : state.selectedFrameId,
      };
    });
  },

  duplicateFrame: (id) => {
    const { frames } = get();
    const source = frames.find((f) => f.id === id);
    if (!source) return;
    get().snapshot();
    const clone: FrameNode = {
      ...source,
      id: uuidv4(),
      position: { x: source.position.x + 32, y: source.position.y + 32 },
      selected: false,
      data: { ...source.data },
    };
    set((state) => ({ frames: [...state.frames, clone], selectedFrameId: clone.id }));
  },

  reparentNode: (id, parentId, position) => {
    get().snapshot();
    set((state) => {
      const patch = {
        position,
        parentNode: parentId ?? undefined,
        extent: (parentId ? 'parent' : undefined) as 'parent' | undefined,
      };
      if (state.nodes.some((n) => n.id === id)) {
        return { nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)) };
      }
      return { frames: state.frames.map((f) => (f.id === id ? { ...f, ...patch } : f)) };
    });
  },

  onFramesChange: (changes) => {
    set((state) => ({
      frames: applyNodeChanges(changes, state.frames) as FrameNode[],
    }));
  },
```

- [ ] **Step 7: Wire frames through `snapshot`/`undo`/`redo`**

Change:

```ts
  snapshot: () => {
    const { nodes, edges, shapes, history } = get();
    const entry: HistoryEntry = {
      nodes: deepClone(nodes),
      edges: deepClone(edges),
      shapes: deepClone(shapes),
    };
    const newHistory = [...history, entry].slice(-MAX_HISTORY);
    set({ history: newHistory, future: [] });
  },

  undo: () => {
    const { history, nodes, edges, shapes, future } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    const newFuture: HistoryEntry[] = [
      { nodes: deepClone(nodes), edges: deepClone(edges), shapes: deepClone(shapes) },
      ...future,
    ];
    set({
      nodes: prev.nodes,
      edges: prev.edges,
      shapes: prev.shapes,
      history: history.slice(0, -1),
      future: newFuture,
      selectedNodeId: null,
      selectedShapeId: null,
    });
  },

  redo: () => {
    const { future, nodes, edges, shapes, history } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newHistory: HistoryEntry[] = [
      ...history,
      { nodes: deepClone(nodes), edges: deepClone(edges), shapes: deepClone(shapes) },
    ];
    set({
      nodes: next.nodes,
      edges: next.edges,
      shapes: next.shapes,
      history: newHistory,
      future: future.slice(1),
      selectedNodeId: null,
      selectedShapeId: null,
    });
  },
```

to:

```ts
  snapshot: () => {
    const { nodes, edges, shapes, frames, history } = get();
    const entry: HistoryEntry = {
      nodes: deepClone(nodes),
      edges: deepClone(edges),
      shapes: deepClone(shapes),
      frames: deepClone(frames),
    };
    const newHistory = [...history, entry].slice(-MAX_HISTORY);
    set({ history: newHistory, future: [] });
  },

  undo: () => {
    const { history, nodes, edges, shapes, frames, future } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    const newFuture: HistoryEntry[] = [
      { nodes: deepClone(nodes), edges: deepClone(edges), shapes: deepClone(shapes), frames: deepClone(frames) },
      ...future,
    ];
    set({
      nodes: prev.nodes,
      edges: prev.edges,
      shapes: prev.shapes,
      frames: prev.frames,
      history: history.slice(0, -1),
      future: newFuture,
      selectedNodeId: null,
      selectedShapeId: null,
      selectedFrameId: null,
    });
  },

  redo: () => {
    const { future, nodes, edges, shapes, frames, history } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newHistory: HistoryEntry[] = [
      ...history,
      { nodes: deepClone(nodes), edges: deepClone(edges), shapes: deepClone(shapes), frames: deepClone(frames) },
    ];
    set({
      nodes: next.nodes,
      edges: next.edges,
      shapes: next.shapes,
      frames: next.frames,
      history: newHistory,
      future: future.slice(1),
      selectedNodeId: null,
      selectedShapeId: null,
      selectedFrameId: null,
    });
  },
```

- [ ] **Step 8: Wire frames through `getProject`/`loadProject`/`clearCanvas`**

Change:

```ts
  loadProject: (project) => {
    const shapes = project.shapes ?? [];
    const documentContent = project.documentContent ?? '';
    set({
      nodes: project.nodes,
      edges: project.edges,
      shapes,
      documentContent,
      projectName: project.name,
      selectedNodeId: null,
      selectedShapeId: null,
      history: [],
      future: [],
      validationIssues: [],
      showValidation: false,
      savedSnapshot: snapshotKey(project.nodes, project.edges, shapes, documentContent),
    });
  },

  markSaved: () => {
    const { nodes, edges, shapes, documentContent } = get();
    set({ savedSnapshot: snapshotKey(nodes, edges, shapes, documentContent) });
  },

  clearCanvas: () => {
    get().snapshot();
    set({
      nodes: [],
      edges: [],
      shapes: [],
      selectedNodeId: null,
      selectedShapeId: null,
      validationIssues: [],
      showValidation: false,
    });
  },

  getProject: () => {
    const { nodes, edges, shapes, documentContent, projectName } = get();
    return {
      id: uuidv4(),
      name: projectName,
      nodes,
      edges,
      shapes,
      documentContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
```

to:

```ts
  loadProject: (project) => {
    const shapes = project.shapes ?? [];
    const frames = project.frames ?? [];
    const documentContent = project.documentContent ?? '';
    set({
      nodes: project.nodes,
      edges: project.edges,
      shapes,
      frames,
      documentContent,
      projectName: project.name,
      selectedNodeId: null,
      selectedShapeId: null,
      selectedFrameId: null,
      history: [],
      future: [],
      validationIssues: [],
      showValidation: false,
      savedSnapshot: snapshotKey(project.nodes, project.edges, shapes, frames, documentContent),
    });
  },

  markSaved: () => {
    const { nodes, edges, shapes, frames, documentContent } = get();
    set({ savedSnapshot: snapshotKey(nodes, edges, shapes, frames, documentContent) });
  },

  clearCanvas: () => {
    get().snapshot();
    set({
      nodes: [],
      edges: [],
      shapes: [],
      frames: [],
      selectedNodeId: null,
      selectedShapeId: null,
      selectedFrameId: null,
      validationIssues: [],
      showValidation: false,
    });
  },

  getProject: () => {
    const { nodes, edges, shapes, frames, documentContent, projectName } = get();
    return {
      id: uuidv4(),
      name: projectName,
      nodes,
      edges,
      shapes,
      frames,
      documentContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
```

- [ ] **Step 9: Run the tests to verify they pass**

Run: `npx vitest run store/useCanvasStore.test.ts`
Expected: PASS, all tests green.

- [ ] **Step 10: Typecheck the whole project**

Run: `npx tsc --noEmit`
Expected: no errors (Task 2's expected errors are now resolved).

- [ ] **Step 11: Run the full test suite and commit**

Run: `npm test`
Expected: all tests PASS.

```bash
git add store/useCanvasStore.ts store/useCanvasStore.test.ts
git commit -m "Add frame state, CRUD actions, and history/serialization support to the store"
```

---

### Task 5: `FrameNode` component

**Files:**
- Create: `components/nodes/FrameNode.tsx`

**Interfaces:**
- Consumes: `FrameData` (Task 2); `updateFrameData`, `setSelectedFrame`, `snapshot` (Task 4, via `useCanvasStore`); React Flow's `NodeResizer`.
- Produces: default-exported `FrameNode` component (registered as `nodeTypes.frame` in Task 7); `FRAME_MIN_WIDTH`, `FRAME_MIN_HEIGHT`, `FRAME_COLOR_PRESETS` constants, consumed by `ArchitectureCanvas.tsx` (Tasks 7–9).

There is no test framework for React components in this repo (no jsdom/React Testing Library, and no existing component has tests — `CustomNode`/`ShapeNode` are both untested). Adding that infra is out of scope for this plan; this task is verified manually via the dev server once it's wired up in Task 7.

- [ ] **Step 1: Create the component**

Create `components/nodes/FrameNode.tsx`:

```tsx
'use client';

import { memo, useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { NodeResizer, type NodeProps } from 'reactflow';
import type { FrameData } from '@/types';
import { useCanvasStore } from '@/store/useCanvasStore';

export const FRAME_MIN_WIDTH = 160;
export const FRAME_MIN_HEIGHT = 120;
export const FRAME_COLOR_PRESETS = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#0ea5e9', '#a855f7'];

function FrameNode({ id, data, selected }: NodeProps<FrameData>) {
  const { title, color, width, height } = data;
  const updateFrameData = useCanvasStore((s) => s.updateFrameData);
  const setSelectedFrame = useCanvasStore((s) => s.setSelectedFrame);
  const snapshot = useCanvasStore((s) => s.snapshot);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleClick = useCallback((e: ReactMouseEvent) => {
    e.stopPropagation();
    setSelectedFrame(id);
  }, [id, setSelectedFrame]);

  const startEditTitle = useCallback((e: ReactMouseEvent) => {
    e.stopPropagation();
    setDraftTitle(title);
    setIsEditingTitle(true);
  }, [title]);

  const commitTitle = useCallback(() => {
    setIsEditingTitle(false);
    if (draftTitle !== title) {
      snapshot();
      updateFrameData(id, { title: draftTitle });
    }
  }, [draftTitle, title, id, snapshot, updateFrameData]);

  const pickColor = useCallback((next: string, e: ReactMouseEvent) => {
    e.stopPropagation();
    if (next === color) return;
    snapshot();
    updateFrameData(id, { color: next });
  }, [color, id, snapshot, updateFrameData]);

  return (
    <div onClick={handleClick} className="relative" style={{ width, height }}>
      <NodeResizer
        color={color}
        isVisible={selected}
        minWidth={FRAME_MIN_WIDTH}
        minHeight={FRAME_MIN_HEIGHT}
        onResizeEnd={(_, params) => {
          snapshot();
          updateFrameData(id, { width: params.width, height: params.height });
        }}
      />

      <div
        className="absolute inset-0 rounded-lg pointer-events-none"
        style={{ border: `1.5px dashed ${color}`, background: `${color}14` }}
      />

      <div className="absolute -top-7 left-0 flex items-center gap-2">
        {isEditingTitle ? (
          <input
            ref={inputRef}
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') commitTitle();
              if (e.key === 'Escape') { setIsEditingTitle(false); setDraftTitle(title); }
            }}
            style={{ color, width: 140 }}
            className="bg-transparent outline-none border-b border-current text-[11px] font-semibold"
          />
        ) : (
          <span
            onDoubleClick={startEditTitle}
            style={{ color }}
            className="text-[11px] font-semibold select-none cursor-text"
          >
            {title || 'Untitled Frame'}
          </span>
        )}

        {selected && !isEditingTitle && (
          <div className="flex items-center gap-1">
            {FRAME_COLOR_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={(e) => pickColor(preset, e)}
                title={preset}
                className="w-3 h-3 rounded-full border border-white/40"
                style={{ background: preset, outline: preset === color ? '1.5px solid currentColor' : undefined }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(FrameNode);
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/nodes/FrameNode.tsx
git commit -m "Add FrameNode component with inline title edit, color presets, and resize handles"
```

---

### Task 6: Frame tool in `DrawToolbar`

**Files:**
- Modify: `components/canvas/DrawToolbar.tsx`

**Interfaces:**
- Consumes: `ToolId` including `'frame'` (Task 2).
- Produces: clicking the new button calls `setActiveTool('frame')`, consumed by `ArchitectureCanvas.tsx` (Task 7).

- [ ] **Step 1: Add the Frame tool button**

In `components/canvas/DrawToolbar.tsx`, change the import line:

```ts
import { MousePointer2, Square, Circle, MoveUpRight, Slash, Pencil, Type } from 'lucide-react';
```

to:

```ts
import { MousePointer2, Square, Circle, MoveUpRight, Slash, Pencil, Type, Frame } from 'lucide-react';
```

Change the `TOOLS` array from:

```ts
const TOOLS: { id: ToolId; label: string; Icon: typeof Square }[] = [
  { id: 'select', label: 'Select (V)', Icon: MousePointer2 },
  { id: 'rectangle', label: 'Rectangle (R)', Icon: Square },
  { id: 'ellipse', label: 'Ellipse (O)', Icon: Circle },
  { id: 'arrow', label: 'Arrow (A)', Icon: MoveUpRight },
  { id: 'line', label: 'Line (L)', Icon: Slash },
  { id: 'pencil', label: 'Pencil (D)', Icon: Pencil },
  { id: 'text', label: 'Text (T)', Icon: Type },
];
```

to:

```ts
const TOOLS: { id: ToolId; label: string; Icon: typeof Square }[] = [
  { id: 'select', label: 'Select (V)', Icon: MousePointer2 },
  { id: 'rectangle', label: 'Rectangle (R)', Icon: Square },
  { id: 'ellipse', label: 'Ellipse (O)', Icon: Circle },
  { id: 'arrow', label: 'Arrow (A)', Icon: MoveUpRight },
  { id: 'line', label: 'Line (L)', Icon: Slash },
  { id: 'pencil', label: 'Pencil (D)', Icon: Pencil },
  { id: 'text', label: 'Text (T)', Icon: Type },
  { id: 'frame', label: 'Frame (F)', Icon: Frame },
];
```

(No keydown handler binds these letter hints today for any existing tool — `DrawToolbar` only shows them as static labels — so `'frame'` follows the same, already-established convention: label only, no new keybinding wired.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/canvas/DrawToolbar.tsx
git commit -m "Add Frame tool to the draw toolbar"
```

---

### Task 7: Frame creation, rendering, and selection in `ArchitectureCanvas`

**Files:**
- Modify: `components/canvas/ArchitectureCanvas.tsx`

**Interfaces:**
- Consumes: `frames`, `addFrame`, `updateFrameData`, `deleteFrame`, `duplicateFrame`, `selectedFrameId`, `setSelectedFrame`, `onFramesChange` (Task 4); `FrameNode` component, `FRAME_COLOR_PRESETS` (Task 5); `'frame'` `ToolId` (Task 2/6).
- Produces: frames render behind nodes/shapes, are created via the Frame tool, are selectable, and Delete-key removal ungroups children. `onNodeDragStop` and the snap section built here are extended by Tasks 8–9.

This task is verified manually (dev server), consistent with how the rest of this file's drag/draw/context-menu interactions are already verified in this codebase — none of them have component tests.

- [ ] **Step 1: Import the new pieces and destructure the new store fields**

Change:

```ts
import type { NodeType, ShapeNode as ShapeNodeType, ToolId } from '@/types';
import { useCanvasStore } from '@/store/useCanvasStore';
import CustomNode, { NODE_WIDTH, NODE_HEIGHT } from '@/components/nodes/CustomNode';
import ShapeNode from '@/components/nodes/ShapeNode';
import DrawToolbar from '@/components/canvas/DrawToolbar';
```

to:

```ts
import type { NodeType, ShapeNode as ShapeNodeType, ToolId } from '@/types';
import { useCanvasStore } from '@/store/useCanvasStore';
import CustomNode, { NODE_WIDTH, NODE_HEIGHT } from '@/components/nodes/CustomNode';
import ShapeNode from '@/components/nodes/ShapeNode';
import FrameNode, { FRAME_COLOR_PRESETS } from '@/components/nodes/FrameNode';
import DrawToolbar from '@/components/canvas/DrawToolbar';
```

Change the store destructure:

```ts
  const {
    nodes,
    edges,
    shapes,
    onNodesChange,
    onEdgesChange,
    onShapesChange,
    onConnect,
    addNode,
    setSelectedNode,
    snapshot,
    theme,
    clipboard,
    copyNode,
    pasteNode,
    duplicateNode,
    deleteNode,
    autoLayout,
    activeTool,
    setActiveTool,
    selectedShapeId,
    setSelectedShape,
    addShape,
    deleteShape,
  } = useCanvasStore();
```

to:

```ts
  const {
    nodes,
    edges,
    shapes,
    frames,
    onNodesChange,
    onEdgesChange,
    onShapesChange,
    onFramesChange,
    onConnect,
    addNode,
    setSelectedNode,
    snapshot,
    theme,
    clipboard,
    copyNode,
    pasteNode,
    duplicateNode,
    deleteNode,
    autoLayout,
    activeTool,
    setActiveTool,
    selectedShapeId,
    setSelectedShape,
    addShape,
    deleteShape,
    selectedFrameId,
    setSelectedFrame,
    addFrame,
    deleteFrame,
    duplicateFrame,
  } = useCanvasStore();
```

Change the `nodeTypes` memo:

```ts
  const nodeTypes = useMemo(() => ({ custom: CustomNode, shape: ShapeNode }), []);
```

to:

```ts
  const nodeTypes = useMemo(() => ({ custom: CustomNode, shape: ShapeNode, frame: FrameNode }), []);
```

Add the default frame size constant next to `MIN_DRAW_SIZE`:

```ts
const MIN_DRAW_SIZE = 4;
```

becomes:

```ts
const MIN_DRAW_SIZE = 4;
const DEFAULT_FRAME_WIDTH = 240;
const DEFAULT_FRAME_HEIGHT = 160;
```

- [ ] **Step 2: Handle the `frame` case in `finishDrawing`**

In `finishDrawing`, change:

```ts
    } else if (tool === 'rectangle' || tool === 'ellipse') {
      const end = points[points.length - 1] ?? start;
      const minX = Math.min(start.x, end.x), minY = Math.min(start.y, end.y);
      const w = Math.abs(end.x - start.x), h = Math.abs(end.y - start.y);
      if (w < MIN_DRAW_SIZE || h < MIN_DRAW_SIZE) return;
      addShape({ kind: tool, position: { x: minX, y: minY }, width: w, height: h, stroke: strokeColor, fill: 'transparent' });
    }
    setActiveTool('select');
  }, [addShape, setActiveTool, strokeColor]);
```

to:

```ts
    } else if (tool === 'rectangle' || tool === 'ellipse') {
      const end = points[points.length - 1] ?? start;
      const minX = Math.min(start.x, end.x), minY = Math.min(start.y, end.y);
      const w = Math.abs(end.x - start.x), h = Math.abs(end.y - start.y);
      if (w < MIN_DRAW_SIZE || h < MIN_DRAW_SIZE) return;
      addShape({ kind: tool, position: { x: minX, y: minY }, width: w, height: h, stroke: strokeColor, fill: 'transparent' });
    } else if (tool === 'frame') {
      const end = points[points.length - 1] ?? start;
      const minX = Math.min(start.x, end.x), minY = Math.min(start.y, end.y);
      const w = Math.abs(end.x - start.x), h = Math.abs(end.y - start.y);
      const isClick = w < MIN_DRAW_SIZE && h < MIN_DRAW_SIZE;
      addFrame({
        position: { x: minX, y: minY },
        width: isClick ? DEFAULT_FRAME_WIDTH : w,
        height: isClick ? DEFAULT_FRAME_HEIGHT : h,
        title: 'Frame',
        color: FRAME_COLOR_PRESETS[0],
      });
    }
    setActiveTool('select');
  }, [addShape, addFrame, setActiveTool, strokeColor]);
```

- [ ] **Step 3: Show a frame preview while dragging out a frame**

`drawPreviewNode` builds a `'shape'`-typed preview; reuse its rectangle rendering for the frame tool too (the real, typed frame is only created on drop in Step 2). Change:

```ts
    const minX = Math.min(start.x, end.x), minY = Math.min(start.y, end.y);
    const w = Math.abs(end.x - start.x), h = Math.abs(end.y - start.y);
    const isLineLike = tool === 'line' || tool === 'arrow';
    return {
      id: '__draw-preview__', type: 'shape', position: { x: minX, y: minY },
      data: {
        kind: tool === 'rectangle' || tool === 'ellipse' ? tool : (tool as 'line' | 'arrow'),
        stroke: strokeColor, fill: 'transparent',
        width: Math.max(w, MIN_DRAW_SIZE), height: Math.max(h, MIN_DRAW_SIZE),
        points: isLineLike ? [{ x: start.x - minX, y: start.y - minY }, { x: end.x - minX, y: end.y - minY }] : undefined,
      },
      style: { pointerEvents: 'none' },
    };
```

to:

```ts
    const minX = Math.min(start.x, end.x), minY = Math.min(start.y, end.y);
    const w = Math.abs(end.x - start.x), h = Math.abs(end.y - start.y);
    const isLineLike = tool === 'line' || tool === 'arrow';
    return {
      id: '__draw-preview__', type: 'shape', position: { x: minX, y: minY },
      data: {
        kind: tool === 'ellipse' ? 'ellipse' : tool === 'rectangle' || tool === 'frame' ? 'rectangle' : (tool as 'line' | 'arrow'),
        stroke: strokeColor, fill: 'transparent',
        width: Math.max(w, MIN_DRAW_SIZE), height: Math.max(h, MIN_DRAW_SIZE),
        points: isLineLike ? [{ x: start.x - minX, y: start.y - minY }, { x: end.x - minX, y: end.y - minY }] : undefined,
      },
      style: { pointerEvents: 'none' },
    };
```

- [ ] **Step 4: Route frame changes (including Delete-key removal → ungroup) in `handleCombinedNodesChange`, and extend `nodeAndShapeIds`**

Change:

```ts
  const nodeAndShapeIds = useMemo(() => {
    const nodeIds = new Set(nodes.map((n) => n.id));
    const shapeIds = new Set(shapes.map((s) => s.id));
    return { nodeIds, shapeIds };
  }, [nodes, shapes]);

  const handleCombinedNodesChange = useCallback((changes: NodeChange[]) => {
    const nodeChanges = changes.filter((c) => 'id' in c && nodeAndShapeIds.nodeIds.has(c.id));
    const shapeChanges = changes.filter((c) => 'id' in c && nodeAndShapeIds.shapeIds.has(c.id));

    let sawDrag = false;
    for (const change of nodeChanges) {
      if (change.type !== 'position' || !change.dragging || !change.position) continue;
      sawDrag = true;
      const others: SnapBox[] = nodes
        .filter((n) => n.id !== change.id)
        .map((n) => ({ left: n.position.x, top: n.position.y, width: NODE_WIDTH, height: NODE_HEIGHT }));
      const snapped = computeSnap(
        { left: change.position.x, top: change.position.y, width: NODE_WIDTH, height: NODE_HEIGHT },
        others
      );
      change.position = { x: snapped.x, y: snapped.y };
      setGuides({ x: snapped.guideX, y: snapped.guideY });
    }
    if (!sawDrag && (guides.x !== null || guides.y !== null)) {
      setGuides({ x: null, y: null });
    }

    if (nodeChanges.length) onNodesChange(nodeChanges);
    if (shapeChanges.length) onShapesChange(shapeChanges);
  }, [nodeAndShapeIds, onNodesChange, onShapesChange, nodes, guides]);
```

to:

```ts
  const nodeAndShapeIds = useMemo(() => {
    const nodeIds = new Set(nodes.map((n) => n.id));
    const shapeIds = new Set(shapes.map((s) => s.id));
    const frameIds = new Set(frames.map((f) => f.id));
    return { nodeIds, shapeIds, frameIds };
  }, [nodes, shapes, frames]);

  const handleCombinedNodesChange = useCallback((changes: NodeChange[]) => {
    const nodeChanges = changes.filter((c) => 'id' in c && nodeAndShapeIds.nodeIds.has(c.id));
    const shapeChanges = changes.filter((c) => 'id' in c && nodeAndShapeIds.shapeIds.has(c.id));
    const frameChangesAll = changes.filter((c) => 'id' in c && nodeAndShapeIds.frameIds.has(c.id));
    const frameRemovals = frameChangesAll.filter((c) => c.type === 'remove');
    const frameChanges = frameChangesAll.filter((c) => c.type !== 'remove');
    frameRemovals.forEach((c) => deleteFrame((c as { id: string }).id));

    let sawDrag = false;
    for (const change of nodeChanges) {
      if (change.type !== 'position' || !change.dragging || !change.position) continue;
      sawDrag = true;
      const others: SnapBox[] = nodes
        .filter((n) => n.id !== change.id)
        .map((n) => ({ left: n.position.x, top: n.position.y, width: NODE_WIDTH, height: NODE_HEIGHT }));
      const snapped = computeSnap(
        { left: change.position.x, top: change.position.y, width: NODE_WIDTH, height: NODE_HEIGHT },
        others
      );
      change.position = { x: snapped.x, y: snapped.y };
      setGuides({ x: snapped.guideX, y: snapped.guideY });
    }
    if (!sawDrag && (guides.x !== null || guides.y !== null)) {
      setGuides({ x: null, y: null });
    }

    if (nodeChanges.length) onNodesChange(nodeChanges);
    if (shapeChanges.length) onShapesChange(shapeChanges);
    if (frameChanges.length) onFramesChange(frameChanges);
  }, [nodeAndShapeIds, onNodesChange, onShapesChange, onFramesChange, deleteFrame, nodes, guides]);
```

(The snap loop here still only covers plain nodes — Task 9 generalizes it to frames and nested coordinates. This task's loop is otherwise untouched.)

- [ ] **Step 5: Render frames behind everything else, parent frames before child frames**

Change:

```ts
  const shapesForDisplay = useMemo(
    () => shapes.map((s) => ({ ...s, selected: s.id === selectedShapeId })),
    [shapes, selectedShapeId]
  );

  const allNodes = useMemo(
    () => [...displayNodes, ...shapesForDisplay, ...(drawPreviewNode ? [drawPreviewNode] : [])],
    [displayNodes, shapesForDisplay, drawPreviewNode]
  );
```

to:

```ts
  const shapesForDisplay = useMemo(
    () => shapes.map((s) => ({ ...s, selected: s.id === selectedShapeId })),
    [shapes, selectedShapeId]
  );

  const framesForDisplay = useMemo(
    () => frames.map((f) => ({ ...f, selected: f.id === selectedFrameId })),
    [frames, selectedFrameId]
  );

  // React Flow requires a parent node to appear before its children in the
  // nodes array; sort by nesting depth so that holds for nested frames too.
  const orderedFrames = useMemo(() => {
    const byId = new Map(framesForDisplay.map((f) => [f.id, f]));
    const depthOf = (id: string): number => {
      let depth = 0;
      let cursor = byId.get(id)?.parentNode;
      while (cursor) {
        depth++;
        cursor = byId.get(cursor)?.parentNode;
      }
      return depth;
    };
    return [...framesForDisplay].sort((a, b) => depthOf(a.id) - depthOf(b.id));
  }, [framesForDisplay]);

  const allNodes = useMemo(
    () => [...orderedFrames, ...displayNodes, ...shapesForDisplay, ...(drawPreviewNode ? [drawPreviewNode] : [])],
    [orderedFrames, displayNodes, shapesForDisplay, drawPreviewNode]
  );
```

- [ ] **Step 6: Clear frame selection on pane click, and add Duplicate/Delete to the frame's future context menu entry point**

Change:

```ts
        onPaneClick={() => { setSelectedNode(null); setSelectedShape(null); setMenu(null); }}
```

to:

```ts
        onPaneClick={() => { setSelectedNode(null); setSelectedShape(null); setSelectedFrame(null); setMenu(null); }}
```

(Context menu wiring for frames — right-click → Duplicate/Delete — is Task 10; `duplicateFrame` is already destructured above so it's ready to use there.)

- [ ] **Step 7: Manual verification**

Run: `npm run dev`, open the app.

1. Click the new Frame tool button (bottom of the draw toolbar) and drag a box on the canvas → a dashed, tinted box with a "Frame" title appears.
2. Click it → selection border, `NodeResizer` handles, and 6 small color swatches appear next to the title.
3. Double-click the title → an editable input appears; type a new name and press Enter → it persists.
4. Click a color swatch → the border/fill/title color updates.
5. Select the frame and press Delete → it disappears (nothing to ungroup yet, since reparenting isn't wired until Task 8).
6. Click the Frame tool and click once (no drag) → a 240×160 default-sized frame appears at the click point.

- [ ] **Step 8: Commit**

```bash
git add components/canvas/ArchitectureCanvas.tsx
git commit -m "Wire frame creation, rendering, and selection into ArchitectureCanvas"
```

---

### Task 8: Drag-to-reparent (auto-detect frame membership on drop)

**Files:**
- Modify: `components/canvas/ArchitectureCanvas.tsx`

**Interfaces:**
- Consumes: `findContainingFrame`, `toRelative`, `FrameBox`, `DraggedBox` (Task 3); `reparentNode` (Task 4); `FRAME_MIN_WIDTH`, `FRAME_MIN_HEIGHT` (Task 5).
- Produces: dropping a node or frame onto another frame reparents it; dragging it back out unparents it.

Verified manually — this logic reads live drag state from `ReactFlowInstance.getNode()`, which isn't practical to unit test without a heavy React Flow mock. The underlying pure geometry it calls (`findContainingFrame`, cycle prevention) is already covered by Task 3's tests.

- [ ] **Step 1: Import the reparenting helpers and add `reparentNode` to the store destructure**

Change:

```ts
import { ContextMenu, type ContextMenuItem } from '@/components/common/ContextMenu';
import { computeSnap, type SnapBox } from '@/components/canvas/snapping';
```

to:

```ts
import { ContextMenu, type ContextMenuItem } from '@/components/common/ContextMenu';
import { computeSnap, type SnapBox } from '@/components/canvas/snapping';
import { findContainingFrame, toRelative, type FrameBox, type DraggedBox } from '@/components/canvas/reparenting';
import { FRAME_MIN_WIDTH, FRAME_MIN_HEIGHT } from '@/components/nodes/FrameNode';
```

Add `reparentNode` to the store destructure (from Task 7's block):

```ts
    addFrame,
    deleteFrame,
    duplicateFrame,
  } = useCanvasStore();
```

to:

```ts
    addFrame,
    deleteFrame,
    duplicateFrame,
    reparentNode,
  } = useCanvasStore();
```

- [ ] **Step 2: Rewrite `onNodeDragStop` to detect and apply reparenting**

Change:

```ts
  const onNodeDragStop = useCallback(() => {
    setGuides({ x: null, y: null });
  }, []);
```

to:

```ts
  const onNodeDragStop = useCallback((_event: ReactMouseEvent, node: Node) => {
    setGuides({ x: null, y: null });
    if (!rfInstance) return;
    const isFrame = nodeAndShapeIds.frameIds.has(node.id);
    if (!isFrame && !nodeAndShapeIds.nodeIds.has(node.id)) return; // shapes don't participate in framing

    const rfNode = rfInstance.getNode(node.id);
    if (!rfNode) return;

    const size = isFrame
      ? {
          width: frames.find((f) => f.id === node.id)?.data.width ?? FRAME_MIN_WIDTH,
          height: frames.find((f) => f.id === node.id)?.data.height ?? FRAME_MIN_HEIGHT,
        }
      : { width: NODE_WIDTH, height: NODE_HEIGHT };
    const abs = rfNode.positionAbsolute ?? rfNode.position;
    const dragged: DraggedBox = { id: node.id, left: abs.x, top: abs.y, width: size.width, height: size.height };

    const frameBoxes: FrameBox[] = frames.map((f) => {
      const fRfNode = rfInstance.getNode(f.id);
      const fAbs = fRfNode?.positionAbsolute ?? f.position;
      return { id: f.id, parentId: f.parentNode ?? null, left: fAbs.x, top: fAbs.y, width: f.data.width, height: f.data.height };
    });

    const targetId = findContainingFrame(dragged, frameBoxes);
    const currentParentId = rfNode.parentNode ?? null;
    if (targetId === currentParentId) return;

    if (targetId === null) {
      reparentNode(node.id, null, { x: abs.x, y: abs.y });
      return;
    }
    const targetFrame = frameBoxes.find((f) => f.id === targetId)!;
    const relative = toRelative({ x: abs.x, y: abs.y }, { x: targetFrame.left, y: targetFrame.top });
    reparentNode(node.id, targetId, relative);
  }, [rfInstance, nodeAndShapeIds, frames, reparentNode]);
```

- [ ] **Step 3: Wire the new signature into the `<ReactFlow>` element**

The prop is already `onNodeDragStop={onNodeDragStop}` — no change needed there; React Flow already calls it with `(event, node)`.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Manual verification**

Run: `npm run dev`.

1. Draw a frame, then drag an architecture node from the palette so it drops with its center over the frame → on drag-stop, it visually snaps into the frame (React Flow now clips/moves it with the frame).
2. Drag the frame itself → the node moves with it (native React Flow parent/child behavior).
3. Drag the node back out so its center is outside the frame, release → it's no longer clipped to the frame; dragging the frame no longer moves it.
4. Draw a second frame ("Inner") and drag it so its center is inside the first frame ("Outer") → "Inner" becomes a child of "Outer".
5. Try dragging "Outer" so its center lands inside "Inner" → nothing happens (cycle prevented); "Outer" stays top-level.

- [ ] **Step 6: Commit**

```bash
git add components/canvas/ArchitectureCanvas.tsx
git commit -m "Auto-detect and apply frame membership when a drag ends"
```

---

### Task 9: Nesting-safe snapping (absolute coordinates, frames included)

**Files:**
- Modify: `components/canvas/ArchitectureCanvas.tsx`

**Interfaces:**
- Consumes: `computeSnap` (existing, `components/canvas/snapping.ts`); `rfInstance.getNode()` for `positionAbsolute`.
- Produces: snapping/alignment guides work correctly for nodes and frames regardless of nesting, and frames themselves are draggable snap participants.

- [ ] **Step 1: Replace the snap section of `handleCombinedNodesChange` with an absolute-coordinate, frame-inclusive version**

Change (inside `handleCombinedNodesChange`, from Task 7):

```ts
    let sawDrag = false;
    for (const change of nodeChanges) {
      if (change.type !== 'position' || !change.dragging || !change.position) continue;
      sawDrag = true;
      const others: SnapBox[] = nodes
        .filter((n) => n.id !== change.id)
        .map((n) => ({ left: n.position.x, top: n.position.y, width: NODE_WIDTH, height: NODE_HEIGHT }));
      const snapped = computeSnap(
        { left: change.position.x, top: change.position.y, width: NODE_WIDTH, height: NODE_HEIGHT },
        others
      );
      change.position = { x: snapped.x, y: snapped.y };
      setGuides({ x: snapped.guideX, y: snapped.guideY });
    }
    if (!sawDrag && (guides.x !== null || guides.y !== null)) {
      setGuides({ x: null, y: null });
    }
```

to:

```ts
    let sawDrag = false;
    const positionableChanges = [...nodeChanges, ...frameChanges];
    for (const change of positionableChanges) {
      if (change.type !== 'position' || !change.dragging || !change.position || !rfInstance) continue;
      sawDrag = true;

      const draggedRf = rfInstance.getNode(change.id);
      const isDraggedFrame = nodeAndShapeIds.frameIds.has(change.id);
      const draggedSize = isDraggedFrame
        ? {
            width: frames.find((f) => f.id === change.id)?.data.width ?? NODE_WIDTH,
            height: frames.find((f) => f.id === change.id)?.data.height ?? NODE_HEIGHT,
          }
        : { width: NODE_WIDTH, height: NODE_HEIGHT };
      const parentId = draggedRf?.parentNode;
      const parentRf = parentId ? rfInstance.getNode(parentId) : undefined;
      const parentAbs = parentRf ? (parentRf.positionAbsolute ?? parentRf.position) : { x: 0, y: 0 };
      const draggedAbsBox: SnapBox = {
        left: parentAbs.x + change.position.x,
        top: parentAbs.y + change.position.y,
        width: draggedSize.width,
        height: draggedSize.height,
      };

      const others: SnapBox[] = [...nodes, ...frames]
        .filter((item) => item.id !== change.id)
        .map((item) => {
          const rf = rfInstance.getNode(item.id);
          const abs = rf?.positionAbsolute ?? item.position;
          const size = nodeAndShapeIds.frameIds.has(item.id)
            ? (item as FrameNodeType).data
            : { width: NODE_WIDTH, height: NODE_HEIGHT };
          return { left: abs.x, top: abs.y, width: size.width, height: size.height };
        });

      const snapped = computeSnap(draggedAbsBox, others);
      change.position = { x: snapped.x - parentAbs.x, y: snapped.y - parentAbs.y };
      setGuides({ x: snapped.guideX, y: snapped.guideY });
    }
    if (!sawDrag && (guides.x !== null || guides.y !== null)) {
      setGuides({ x: null, y: null });
    }
```

- [ ] **Step 2: Update the `useCallback` dependency array and add the `FrameNode` type import**

Change:

```ts
import type { NodeType, ShapeNode as ShapeNodeType, ToolId } from '@/types';
```

to:

```ts
import type { NodeType, ShapeNode as ShapeNodeType, FrameNode as FrameNodeType, ToolId } from '@/types';
```

Change `handleCombinedNodesChange`'s dependency array from:

```ts
  }, [nodeAndShapeIds, onNodesChange, onShapesChange, onFramesChange, deleteFrame, nodes, guides]);
```

to:

```ts
  }, [nodeAndShapeIds, onNodesChange, onShapesChange, onFramesChange, deleteFrame, nodes, frames, guides, rfInstance]);
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`.

1. Draw two frames side by side, put a node inside each → drag one node near the edge of the other frame's node → the indigo alignment guide still appears and it snaps, exactly as it did for plain nodes before frames existed.
2. Nest a frame inside another frame, put a node inside the nested (inner) frame, then drag a second top-level node near it → confirm it still snaps correctly (this is the case that was broken before this task, since the inner node's raw `position` is relative to its parent, not the canvas).
3. Drag a frame itself near another frame's edge → the frame snaps and shows a guide line too.

- [ ] **Step 5: Run the full test suite (regression) and commit**

Run: `npm test`
Expected: all tests still PASS (this task didn't touch any tested pure function, only its caller).

```bash
git add components/canvas/ArchitectureCanvas.tsx
git commit -m "Make snapping nesting-safe by using absolute coordinates, and include frames"
```

---

### Task 10: Context menu Duplicate/Delete for frames

**Files:**
- Modify: `components/canvas/ArchitectureCanvas.tsx`

**Interfaces:**
- Consumes: `duplicateFrame`, `deleteFrame` (Task 4); `ContextMenuItem`, `ContextMenu` (existing, `components/common/ContextMenu.tsx`).
- Produces: right-clicking a frame shows a Duplicate/Delete menu, mirroring the existing node context menu.

- [ ] **Step 1: Add a `'frame'` variant to `CanvasMenu` and branch on it in `onNodeContextMenu`**

Change:

```ts
type CanvasMenu =
  | { kind: 'pane'; x: number; y: number; flowX: number; flowY: number }
  | { kind: 'node'; x: number; y: number; nodeId: string };
```

to:

```ts
type CanvasMenu =
  | { kind: 'pane'; x: number; y: number; flowX: number; flowY: number }
  | { kind: 'node'; x: number; y: number; nodeId: string }
  | { kind: 'frame'; x: number; y: number; frameId: string };
```

Change:

```ts
  const onNodeContextMenu = useCallback((event: ReactMouseEvent, node: Node) => {
    event.preventDefault();
    setSelectedNode(node.id);
    setMenu({ kind: 'node', x: event.clientX, y: event.clientY, nodeId: node.id });
  }, [setSelectedNode]);
```

to:

```ts
  const onNodeContextMenu = useCallback((event: ReactMouseEvent, node: Node) => {
    event.preventDefault();
    if (node.type === 'frame') {
      setSelectedFrame(node.id);
      setMenu({ kind: 'frame', x: event.clientX, y: event.clientY, frameId: node.id });
      return;
    }
    setSelectedNode(node.id);
    setMenu({ kind: 'node', x: event.clientX, y: event.clientY, nodeId: node.id });
  }, [setSelectedNode, setSelectedFrame]);
```

- [ ] **Step 2: Add the frame branch to `menuItems`**

Change:

```ts
  const menuItems: ContextMenuItem[] = useMemo(() => {
    if (!menu) return [];
    if (menu.kind === 'node') {
      const id = menu.nodeId;
      return [
        { label: 'Duplicate', icon: <Copy size={13}/>, onClick: () => duplicateNode(id) },
        { label: 'Copy', icon: <Copy size={13}/>, onClick: () => copyNode(id) },
        { label: 'Delete', icon: <Trash2 size={13}/>, danger: true, onClick: () => deleteNode(id) },
      ];
    }
    return [
      {
        label: 'Paste here',
        icon: <ClipboardPaste size={13}/>,
        disabled: !clipboard,
        onClick: () => pasteNode(menu.kind === 'pane' ? { x: menu.flowX, y: menu.flowY } : undefined),
      },
      { label: 'Auto Layout', icon: <LayoutGrid size={13}/>, onClick: () => autoLayout() },
    ];
  }, [menu, duplicateNode, copyNode, deleteNode, clipboard, pasteNode, autoLayout]);
```

to:

```ts
  const menuItems: ContextMenuItem[] = useMemo(() => {
    if (!menu) return [];
    if (menu.kind === 'node') {
      const id = menu.nodeId;
      return [
        { label: 'Duplicate', icon: <Copy size={13}/>, onClick: () => duplicateNode(id) },
        { label: 'Copy', icon: <Copy size={13}/>, onClick: () => copyNode(id) },
        { label: 'Delete', icon: <Trash2 size={13}/>, danger: true, onClick: () => deleteNode(id) },
      ];
    }
    if (menu.kind === 'frame') {
      const id = menu.frameId;
      return [
        { label: 'Duplicate', icon: <Copy size={13}/>, onClick: () => duplicateFrame(id) },
        { label: 'Delete', icon: <Trash2 size={13}/>, danger: true, onClick: () => deleteFrame(id) },
      ];
    }
    return [
      {
        label: 'Paste here',
        icon: <ClipboardPaste size={13}/>,
        disabled: !clipboard,
        onClick: () => pasteNode(menu.kind === 'pane' ? { x: menu.flowX, y: menu.flowY } : undefined),
      },
      { label: 'Auto Layout', icon: <LayoutGrid size={13}/>, onClick: () => autoLayout() },
    ];
  }, [menu, duplicateNode, copyNode, deleteNode, duplicateFrame, deleteFrame, clipboard, pasteNode, autoLayout]);
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`.

1. Right-click a frame → a "Duplicate" / "Delete" menu appears (not the node menu).
2. Click Duplicate → a copy appears offset by 32px, selected.
3. Put a node inside a frame, right-click the frame, click Delete → the frame disappears and the node remains on the canvas, unparented, at its former on-screen position.
4. Right-click a plain architecture node → confirm the original node menu (Duplicate/Copy/Delete) still appears unchanged.

- [ ] **Step 5: Run the full test suite and commit**

Run: `npm test && npx tsc --noEmit`
Expected: all tests PASS, no type errors.

```bash
git add components/canvas/ArchitectureCanvas.tsx
git commit -m "Add Duplicate/Delete context menu entries for frames"
```

---

## Done

At this point: frames can be drawn, titled, colored, resized, selected, duplicated, and deleted (with ungroup semantics); nodes and other frames can be dragged into and out of them with auto-detection and cycle prevention; snapping/alignment guides work correctly regardless of nesting; undo/redo and JSON save/load round-trip frames; and PNG export/validation/Mermaid export are unaffected, per the spec's non-goals.
