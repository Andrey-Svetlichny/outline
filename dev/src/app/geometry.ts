export interface IPoint {
  x: number;
  y: number;
}

export interface ILine {
  p1: IPoint;
  p2: IPoint;
}

/**
 * Angle between 2 vectors
 */
export function lineAngle(l1: ILine, l2: ILine) {
  const x1 = l1.p2.x - l1.p1.x, y1 = l1.p2.y - l1.p1.y;
  const x2 = l2.p2.x - l2.p1.x, y2 = l2.p2.y - l2.p1.y;

  // cos( alpha ) = (x1 * x2 + y1 * y2) / ( sqrt(x1*x1 + y1*y1) * sqrt(x2*x2 + y2*y2) )

  let angle = Math.atan2(y2, x2) - Math.atan2(y1, x1);
  if (angle < 0) { angle += 2 * Math.PI; }
  return angle;
}

/**
 * line touch (any of the points equal)
 */
export function lineTouch(l1: ILine, l2: ILine) {
    return equalPoints(l1.p1, l2.p1) || equalPoints(l1.p1, l2.p2) || equalPoints(l1.p2, l2.p1) || equalPoints(l1.p2, l2.p2);
  }


function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, { x: v.x + t * (w.x - v.x),
    y: v.y + t * (w.y - v.y) });
}
export function pointToLineDistance(p: IPoint, line: ILine) {
  const v = line.p1;
  const w = line.p2;
  return Math.sqrt(distToSegmentSquared(p, v, w));
}

/**
 * Are two line segments intersect?
 * Uses the vector cross product approach described below:
 * http://stackoverflow.com/a/565282/786339
 * assume collinear line not cross
 */
export function lineIntersects(l1: ILine, l2: ILine) {
  const p= l1.p1, p2= l1.p2, q= l2.p1, q2= l2.p2;
  var r = subtractPoints(p2, p);
  var s = subtractPoints(q2, q);

  var uNumerator = crossProduct(subtractPoints(q, p), r);
  var denominator = crossProduct(r, s);

    if (denominator == 0) {
    // lines are parallel
    return false;
  }

  var u = uNumerator / denominator;
  var t = crossProduct(subtractPoints(q, p), s) / denominator;

  const eps = 10*Number.EPSILON;
  if(
    Math.abs(u) < eps ||
    Math.abs(u-1) < eps ||
    Math.abs(t) < eps ||
    Math.abs(t-1) < eps
  ) {
    // just touch
    return false;
  }


  // if (u==0 || u==1 || t==0 || t==1) {
  //   // just touch
  //   return false;
  // }

  return (t >= 0) && (t <= 1) && (u >= 0) && (u <= 1);
}

/*
export function lineIntersects(l1: ILine, l2: ILine) {
  const p= l1.p1, p2= l1.p2, q= l2.p1, q2= l2.p2;
  var r = subtractPoints(p2, p);
  var s = subtractPoints(q2, q);

  var uNumerator = crossProduct(subtractPoints(q, p), r);
  var denominator = crossProduct(r, s);

  if (uNumerator == 0 && denominator == 0) {
    // They are coLlinear

    // Do they touch? (Are any of the points equal?)
    if (lineTouch(l1, l2)) {
      return true
    }

    // Do they overlap? (Are all the point differences in either direction the same sign)
    return !((q.x - p.x < 0) ? (q.x - p2.x < 0) && (q2.x - p.x < 0) && (q2.x - p2.x < 0) : (q.x - p2.x >= 0) && (q2.x - p.x >= 0) && (q2.x - p2.x >= 0))
      ||   !((q.y - p.y < 0) ? (q.y - p2.y < 0) && (q2.y - p.y < 0) && (q2.y - p2.y < 0) : (q.y - p2.y >= 0) && (q2.y - p.y >= 0) && (q2.y - p2.y >= 0));
  }

  if (denominator == 0) {
    // lines are paralell
    return false;
  }

  var u = uNumerator / denominator;
  var t = crossProduct(subtractPoints(q, p), s) / denominator;

  return (t >= 0) && (t <= 1) && (u >= 0) && (u <= 1);
}

*/

export function lineIntersectionPoint(l1: ILine, l2: ILine): IPoint {
  const x1=l1.p1.x, y1=l1.p1.y, x2=l1.p2.x, y2=l1.p2.y, x3=l2.p1.x, y3=l2.p1.y, x4=l2.p2.x, y4=l2.p2.y;
  const px= ( (x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4) ) / ( (x1-x2)*(y3-y4)-(y1-y2)*(x3-x4) )
  const py= ( (x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4) ) / ( (x1-x2)*(y3-y4)-(y1-y2)*(x3-x4) )
  return {x: px, y: py};
}


function crossProduct(point1, point2) {
  return point1.x * point2.y - point1.y * point2.x;
}

function subtractPoints(point1: IPoint, point2: IPoint): IPoint {
  return {x: point1.x - point2.x, y: point1.y - point2.y};
}

function equalPoints(point1: IPoint, point2: IPoint): boolean {
  return (point1.x == point2.x) && (point1.y == point2.y)
}
