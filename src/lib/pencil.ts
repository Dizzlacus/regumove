/**
 * Shared geometry for the graphite pencil notes (ProductConnector.astro, Why.astro).
 * Styling lives in global.css under "Pencil notes".
 */

/** Final point of an SVG path whose last command ends in an absolute "x y" pair. */
export function pathEnd(d: string): [number, number] {
  const [x, y] = d.trim().split(/[\sC]+/).slice(-2).map(Number);
  return [x, y];
}

/**
 * Two short, slightly unequal pencil strokes flicking back from the tip (x, y),
 * given the direction of travel at the tip.
 */
export function arrowhead(x: number, y: number, [dx, dy]: readonly number[], scale = 1): string[] {
  const len = Math.hypot(dx, dy);
  const bx = -dx / len;
  const by = -dy / len;
  const flick = (deg: number, size: number) => {
    const a = (deg * Math.PI) / 180;
    const ex = x + (bx * Math.cos(a) - by * Math.sin(a)) * size * scale;
    const ey = y + (bx * Math.sin(a) + by * Math.cos(a)) * size * scale;
    // a faint bow, as a hand never quite draws a straight line
    const cx = (x + ex) / 2 + by * 1.2 * scale;
    const cy = (y + ey) / 2 - bx * 1.2 * scale;
    return `M${ex.toFixed(1)} ${ey.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x} ${y}`;
  };
  return [flick(30, 19), flick(-26, 16)];
}

/** Short downward squiggle (36×72 box) used where layouts stack on small screens. */
export const squiggle = {
  viewBox: "0 0 36 72",
  line: "M20 4C10 14 28 22 18 33C9 43 25 50 17 64",
  heads: ["M10 55Q13 61 17 65", "M25 57Q20 61 17 65"],
};
