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
