export interface IPoint {
  x: number;
  y: number;
}

export interface ILine {
  p1: IPoint;
  p2: IPoint;
}

export const EPSILON = 1e-5;

/**
 * Angle between 2 vectors
 */
export function lineAngle(l1: ILine, l2: ILine) {
  let angle = Math.atan2(l2.p2.y - l2.p1.y, l2.p2.x - l2.p1.x) - Math.atan2(l1.p2.y - l1.p1.y, l1.p2.x - l1.p1.x);

  if (angle > Math.PI) {
    angle -= 2 * Math.PI;
  } else if (angle <= -Math.PI) {
    angle += 2 * Math.PI;
  }
  return angle;
}

function sqr(x) { return x * x; }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y); }
export function pointToLineDistance(p: IPoint, line: ILine) {
  const v = line.p1;
  const w = line.p2;

  let distSquared: number;
  const l2 = dist2(v, w);
  if (l2 === 0) {
    distSquared = dist2(p, v);
  } else {
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    distSquared = dist2(p, {x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y)});
  }

  return Math.sqrt(distSquared);
}


/**
 * Are two line segments intersect?
 * Uses the vector cross product approach described below:
 * http://stackoverflow.com/a/565282/786339
 * assume collinear line not cross
 */
export function lineIntersects(l1: ILine, l2: ILine) {
  const p = l1.p1;
  const p2 = l1.p2;
  const q = l2.p1;
  const q2 = l2.p2;
  const r = subtractPoints(p2, p);
  const s = subtractPoints(q2, q);

  const uNumerator = crossProduct(subtractPoints(q, p), r);
  const denominator = crossProduct(r, s);

  if (Math.abs(denominator) < EPSILON) {
    // lines are parallel
    return false;
  }

  const u = uNumerator / denominator;
  const t = crossProduct(subtractPoints(q, p), s) / denominator;

  if (Math.abs(u) < EPSILON || Math.abs(u - 1) < EPSILON ||
    Math.abs(t) < EPSILON || Math.abs(t - 1) < EPSILON) {
    // just touch
    return false;
  }

  return (t >= 0) && (t <= 1) && (u >= 0) && (u <= 1);
}


export function lineIntersectionPoint(l1: ILine, l2: ILine): IPoint {
  const x1 = l1.p1.x;
  const y1 = l1.p1.y;
  const x2 = l1.p2.x;
  const y2 = l1.p2.y;
  const x3 = l2.p1.x;
  const y3 = l2.p1.y;
  const x4 = l2.p2.x;
  const y4 = l2.p2.y;
  const px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
  const py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
  return {x: px, y: py};
}


function crossProduct(point1, point2) {
  return point1.x * point2.y - point1.y * point2.x;
}

function subtractPoints(point1: IPoint, point2: IPoint): IPoint {
  return {x: point1.x - point2.x, y: point1.y - point2.y};
}
