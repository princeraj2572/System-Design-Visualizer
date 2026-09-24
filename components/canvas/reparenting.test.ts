import { describe, it, expect } from 'vitest';
import { findContainingFrame, isCascadedFrameRemoval, isDescendant, toRelative, absolutePosition, type FrameBox } from './reparenting';

describe('isCascadedFrameRemoval', () => {
  const removed = new Set(['frame-1']);

  it('drops an unselected child of a frame being removed (Delete on a frame keeps its node)', () => {
    expect(isCascadedFrameRemoval({ parentNode: 'frame-1', selected: false }, removed)).toBe(true);
  });

  it('keeps a child the user selected themselves', () => {
    expect(isCascadedFrameRemoval({ parentNode: 'frame-1', selected: true }, removed)).toBe(false);
  });

  it('keeps a top-level item with no parent', () => {
    expect(isCascadedFrameRemoval({ selected: false }, removed)).toBe(false);
  });

  it('keeps a child whose parent frame is not being removed', () => {
    expect(isCascadedFrameRemoval({ parentNode: 'frame-2', selected: false }, removed)).toBe(false);
  });

  it('keeps everything when no frame is being removed', () => {
    expect(isCascadedFrameRemoval({ parentNode: 'frame-1' }, new Set())).toBe(false);
  });

  it('returns false for an unknown item', () => {
    expect(isCascadedFrameRemoval(undefined, removed)).toBe(false);
  });

  it('drops a nested frame cascaded from its removed outer frame', () => {
    expect(isCascadedFrameRemoval({ parentNode: 'frame-1', selected: false }, removed)).toBe(true);
    // ...while the node inside that nested frame is cascaded too, because React
    // Flow adds the nested frame to the removal set as well.
    expect(isCascadedFrameRemoval({ parentNode: 'frame-2' }, new Set(['frame-1', 'frame-2']))).toBe(true);
  });
});

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
