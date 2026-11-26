export interface Placement {
  x: number;
  y: number;
  z: number;
  /** uniform scale */
  s: number;
  yaw: number;
  /** opacity, 0 hidden .. 1 solid (1 when left out) */
  o?: number;
}

export interface Fit {
  /** horizontal spread multiplier of the showcase */
  x: number;
  /** scale multiplier of the showcase */
  s: number;
  /**
   * On a narrow screen only the front look and its neighbours show; looks
   * further back fade out below this depth (0 = back .. 1 = front). Null
   * shows every look.
   */
  fadeBelow: number | null;
}

/** The angle between two neighbouring looks on the carousel. */
export function stepFor(count: number): number {
  return (Math.PI * 2) / Math.max(count, 1);
}

/**
 * Per-character parameters of the floating showcase. They deliberately differ
 * so the composition is not a perfect circle: every look has its own orbit
 * width / depth, height and size. More looks than rows here reuse them in
 * turn.
 */
interface ShowcaseParam {
  rx: number;
  rz: number;
  y: number;
  s: number;
}

const SHOWCASE: ShowcaseParam[] = [
  { rx: 5.5, rz: 2.9, y: 0.0, s: 1.0 },
  { rx: 5.1, rz: 3.1, y: 0.3, s: 0.97 },
  { rx: 5.8, rz: 2.7, y: -0.3, s: 1.04 },
  { rx: 4.9, rz: 3.2, y: 0.5, s: 1.0 },
  { rx: 5.6, rz: 3.0, y: -0.1, s: 0.95 },
  { rx: 5.7, rz: 3.0, y: 0.25, s: 1.06 },
  { rx: 5.0, rz: 2.8, y: -0.4, s: 0.98 },
  { rx: 5.5, rz: 3.2, y: 0.45, s: 1.0 },
  { rx: 5.2, rz: 2.8, y: -0.15, s: 1.03 },
];

export const MEAN_RX =
  SHOWCASE.reduce((a, p) => a + p.rx, 0) / SHOWCASE.length;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Where look `i` of `count` floats for a given carousel rotation (radians). */
export function showcasePlacement(
  i: number,
  count: number,
  rot: number,
  fit: Fit,
): Placement {
  const p = SHOWCASE[i % SHOWCASE.length];
  // With only a few looks the orbit is drawn in, so they don't stand at
  // the far edges of the screen.
  const spread = count <= 2 ? 0.45 : count <= 4 ? 0.75 : 1;
  const th = i * stepFor(count) + rot;
  const c = Math.cos(th);
  const sn = Math.sin(th);
  const depth = (c + 1) / 2; // 1 = front / centre, 0 = back
  return {
    x: sn * p.rx * fit.x * spread,
    z: c * p.rz * spread - 0.8,
    y: lerp(1.35, -0.55, depth) + p.y,
    s: lerp(1.0, 1.75, Math.pow(depth, 1.2)) * p.s * fit.s,
    // flat cut-outs always face the camera, upright
    yaw: 0,
    o:
      fit.fadeBelow === null
        ? 1
        : smoothstep(fit.fadeBelow - 0.22, fit.fadeBelow, depth),
  };
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

/** How deep (0 back .. 1 front) the looks either side of the front one sit. */
function neighbourDepth(count: number): number {
  return (Math.cos(stepFor(count)) + 1) / 2;
}

/** How many columns the grid has for `count` looks (3x3 for nine). */
function gridColumns(count: number): number {
  if (count <= 3) return Math.max(count, 1);
  if (count === 4) return 2;
  if (count <= 6 || count === 9) return 3;
  return 4;
}

/** Static grid, as square as the count allows. Row 0 is the top row. */
export function gridPlacements(
  count: number,
  visibleW: number,
  visibleH: number,
): Placement[] {
  const cols = gridColumns(count);
  const rows = Math.ceil(count / cols);
  const cellY = (visibleH * 0.76) / Math.max(rows, 1);
  const cellX = Math.min((visibleW * 0.92) / cols, cellY * 1.8);
  const s = Math.min(cellY / 1.95, cellX / 1.2);
  const lift = visibleH * 0.035; // leave room for the toggle at the bottom
  const out: Placement[] = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    // a last row that isn't full is centred
    const inRow = Math.min(cols, count - row * cols);
    out.push({
      x: (col - (inRow - 1) / 2) * cellX,
      y: ((rows - 1) / 2 - row) * cellY + lift,
      z: 0,
      s,
      yaw: 0,
    });
  }
  return out;
}

/** The widest orbit of any look. */
const MAX_RX = Math.max(...SHOWCASE.map((p) => p.rx));

/**
 * Half the width of a person cut-out at scale 1 (wider poses included), and
 * how much bigger a look at the side of the carousel is drawn.
 */
const LOOK_HALF_WIDTH = 0.45;
const SIDE_SCALE = 1.35;

/** A typical cut-out's half width, for the coverflow's tighter fit. */
const NEIGHBOUR_HALF_WIDTH = 0.38;

/** Narrower than this (width / height), the carousel shows as a coverflow. */
const NARROW_ASPECT = 0.95;

/**
 * How wide the carousel turns and how big the looks are, for a screen of
 * this shape. The orbit is sized to the width the camera actually sees, so
 * the looks stay whole, with a margin from the edge.
 *
 * - Wide screens show every look around the orbit.
 * - Narrow screens (a phone held upright) can't fit them all without the
 *   looks piling up, so only the front look and one either side show, set
 *   apart; the rest fade out behind and come forward as it turns.
 */
export function showcaseFit(aspect: number, visibleH: number, count: number): Fit {
  const halfW = (visibleH * aspect) / 2;

  if (aspect < NARROW_ASPECT && count > 1) {
    const s = 0.72;
    const step = Math.min(stepFor(count), Math.PI / 2);
    const nd = neighbourDepth(count);
    // Spread the neighbours as far out as the screen allows, so they stand
    // clear of the front look while their outer edge stays inside.
    const margin = Math.max(halfW * 0.06, 0.22);
    const neighbourHalf =
      NEIGHBOUR_HALF_WIDTH * lerp(1.0, 1.75, Math.pow(Math.max(nd, 0), 1.2)) * s;
    const room = halfW - margin - neighbourHalf;
    return {
      x: Math.max(room / (Math.sin(step) * MAX_RX), 0.12),
      s,
      fadeBelow: Math.max(nd - 0.03, 0),
    };
  }

  const k = Math.min(Math.max(aspect / 1.7, 0.4), 1.15);
  const s = Math.min(1, Math.max(0.8, 0.55 + k * 0.5));
  const margin = Math.max(halfW * 0.08, 0.3);
  const room = halfW - margin - LOOK_HALF_WIDTH * SIDE_SCALE * s;

  return { x: Math.min(Math.max(room / MAX_RX, 0.12), 1.15), s, fadeBelow: null };
}
