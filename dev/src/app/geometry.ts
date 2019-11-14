export interface IPoint {
  x: number;
  y: number;
}

/**
 * Are two line segments intersect?
 * Uses the vector cross product approach described below:
 * http://stackoverflow.com/a/565282/786339
 */
export function segmentsIntersects(p: IPoint, p2: IPoint, q: IPoint, q2: IPoint) {
  var r = subtractPoints(p2, p);
  var s = subtractPoints(q2, q);

  var uNumerator = crossProduct(subtractPoints(q, p), r);
  var denominator = crossProduct(r, s);

  if (uNumerator == 0 && denominator == 0) {
    // They are coLlinear

    // Do they touch? (Are any of the points equal?)
    if (equalPoints(p, q) || equalPoints(p, q2) || equalPoints(p2, q) || equalPoints(p2, q2)) {
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


export function segmentsIntersectionPoint(p1: IPoint, p2: IPoint, p3: IPoint, p4: IPoint): IPoint {
  const x1=p1.x, y1=p1.y, x2=p2.x, y2=p2.y, x3=p3.x, y3=p3.y, x4=p4.x, y4=p4.y;
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
