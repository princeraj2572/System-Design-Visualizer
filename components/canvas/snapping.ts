export interface SnapBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface SnapResult {
  x: number;
  y: number;
  guideX: number | null;
  guideY: number | null;
}

const THRESHOLD = 6;

/**
 * Snaps a dragged box's position to the nearest edge/center alignment with
 * any other box, within THRESHOLD flow units. Independent per axis, so a
 * drag can snap horizontally and vertically to two different neighbors.
 */
export function computeSnap(dragged: SnapBox, others: SnapBox[]): SnapResult {
  const dLeft = dragged.left;
  const dRight = dragged.left + dragged.width;
  const dCenterX = dragged.left + dragged.width / 2;
  const dTop = dragged.top;
  const dBottom = dragged.top + dragged.height;
  const dCenterY = dragged.top + dragged.height / 2;

  let bestDx = Infinity;
  let snapX = dragged.left;
  let guideX: number | null = null;
  let bestDy = Infinity;
  let snapY = dragged.top;
  let guideY: number | null = null;

  for (const o of others) {
    const oLeft = o.left;
    const oRight = o.left + o.width;
    const oCenterX = o.left + o.width / 2;
    const oTop = o.top;
    const oBottom = o.top + o.height;
    const oCenterY = o.top + o.height / 2;

    const xCandidates: [number, number, number][] = [
      [dLeft, oLeft, oLeft],
      [dRight, oRight, oRight - dragged.width],
      [dCenterX, oCenterX, oCenterX - dragged.width / 2],
      [dLeft, oRight, oRight],
      [dRight, oLeft, oLeft - dragged.width],
    ];
    for (const [dVal, guide, newLeft] of xCandidates) {
      const diff = Math.abs(dVal - guide);
      if (diff <= THRESHOLD && diff < bestDx) {
        bestDx = diff;
        snapX = newLeft;
        guideX = guide;
      }
    }

    const yCandidates: [number, number, number][] = [
      [dTop, oTop, oTop],
      [dBottom, oBottom, oBottom - dragged.height],
      [dCenterY, oCenterY, oCenterY - dragged.height / 2],
      [dTop, oBottom, oBottom],
      [dBottom, oTop, oTop - dragged.height],
    ];
    for (const [dVal, guide, newTop] of yCandidates) {
      const diff = Math.abs(dVal - guide);
      if (diff <= THRESHOLD && diff < bestDy) {
        bestDy = diff;
        snapY = newTop;
        guideY = guide;
      }
    }
  }

  return { x: snapX, y: snapY, guideX, guideY };
}
