import {EPSILON, ILine, IPoint, lineAngle, lineIntersectionPoint, lineIntersects, pointToLineDistance} from './geometry';
import {IGLine, IGPoint, IMarkerLine, IMarkerPoint} from '../graph/graph.component';

export class OutlineBuilder {
  public lines: IGLine[] = [];
  public points: IGPoint[] = []; // dragging handles at the ends of lines
  public outlinePoints: IGPoint[] = [];
  public markerPoints: IMarkerPoint[] = [];
  public markerLines: IMarkerLine[] = [];

  public buildOutline(angle: number, distance: number) {
      this.closestOutline();
      this.outlineSmooth(angle, distance);
  }
  private closestOutline() {
    this.outlinePoints.length = 0; // do not reassign whole array

    // take most left point (with min x)
    const firstPoint = this.points.sort((p1, p2) => p1.x - p2.x)[0];
    this.outlinePoints.push(firstPoint);
    let currentPoint = firstPoint;
    let currentLine: ILine = {p1: {x: firstPoint.x - 1, y: firstPoint.y}, p2: firstPoint};

    // find intersection points
    const intersectionPoints: IGPoint[] = this.intersectionPoints(this.lines);

    // allPoints = this.points + intersection points
    let allPoints: IGPoint[] = [...this.points, ...intersectionPoints];

    // merge points with same coordinates (save lines)
    const allPointsFilt: IGPoint[] = [];
    for (const point of allPoints) {
      const nextPointWithSameCoord = allPoints
        .find(p => p !== point && p.x === point.x && p.y === point.y && allPoints.indexOf(p) > allPoints.indexOf(point));
      if (nextPointWithSameCoord) {
        nextPointWithSameCoord.lines.push(...point.lines);
        for (const line of point.lines) {
          if (line.p1 === point) {
            line.p1 = nextPointWithSameCoord;
          }
          if (line.p2 === point) {
            line.p2 = nextPointWithSameCoord;
          }
        }
      } else {
        allPointsFilt.push(point);
      }
    }
    allPoints = allPointsFilt;

    while (true) {
      // all points except current
      let nextPoints: IGPoint[] = allPoints.filter(p => p !== currentPoint);

      // remove points not reachable directly (without line cross)
      nextPoints = this.visiblePoints(currentPoint, nextPoints, this.lines);

      // on every currentPoint.lines put vectors from currentPoint
      let vectorsFromCurrentPoint: ILine[] = [];
      for (const line of currentPoint.lines) {
        const vectors: ILine[] =
          (line.p1 === currentPoint) ? [{p1: line.p1, p2: line.p2}]
            : (line.p2 === currentPoint) ? [{p1: line.p2, p2: line.p1}]
            : [{p1: currentPoint, p2: line.p1}, {p1: currentPoint, p2: line.p2}];
        vectorsFromCurrentPoint.push(...vectors);
      }

      // if more then 1 vector, remove vector to previous point (or over previous point)
      if (vectorsFromCurrentPoint.length > 1) {
        vectorsFromCurrentPoint = vectorsFromCurrentPoint.filter(v => pointToLineDistance(currentLine.p1, v) > EPSILON);
      }

      // sort by angle relative to currentLine, take first
      const nextVector = vectorsFromCurrentPoint.map(v => ({v, angle: lineAngle(currentLine, v)}))
        .sort((o1, o2) => o1.angle - o2.angle)[0].v;

      // take one of nextPoints, nearest to nextVector
      const nextPoint = nextPoints.map(p => ({point: p, dist: pointToLineDistance(p, nextVector)}))
        .sort((o1, o2) => o1.dist - o2.dist)[0].point;

      const nextLine = {p1: currentPoint, p2: nextPoint};
      this.outlinePoints.push(nextPoint);

      currentPoint = nextPoint;
      currentLine = nextLine;
      if (nextPoint === firstPoint) {
        break;
      }
    }
  }

  private outlineSmooth(angle: number, distance: number) {
    for (let i = 0; i < this.outlinePoints.length; i++) {
      // not cross point
      if (this.points.indexOf(this.outlinePoints[i]) >= 0) {
        this.outlineSmoothOnePoint(i, angle, distance);
      }
    }
  }

  private outlineSmoothOnePoint(n: number, angle: number, distance: number) {
    interface II {
      index: number;
      point: IGPoint;
    }

    const outlinePointsWithIndex: II[] = this.outlinePoints.map((p, index) => ({index, point: p}));
    const currentPoint = outlinePointsWithIndex[n];
    const currentLine = currentPoint.point.lines[0];

    const nearestLines = this.lines.filter(l => {
      const d = pointToLineDistance(currentPoint.point, l);
      if (d < EPSILON || distance < d) {
        return false;
      }
      return Math.abs(lineAngle(currentLine, l)) % (Math.PI / 2) < angle;
    });

    // next points after currentPoint
    let points: II[] = [];
    for (let i = currentPoint.index + 1; i < outlinePointsWithIndex.length; i++) {
      const point = outlinePointsWithIndex[i];

      // directly visible from currentPoint
      const line: ILine = {p1: currentPoint.point, p2: point.point};
      if (this.lines.some(l => lineIntersects(l, line))) {
        break;
      }
      // and belongs to nearestLines
      if (nearestLines.some(l => pointToLineDistance(point.point, l) < EPSILON)) {
        points.push(outlinePointsWithIndex[i]);
      }
    }

    // for every duplicate points keep first
    points = points.filter(pp => {
      return !points.some(p => p.index < pp.index && p.point === pp.point);
    });

    // last only
    points = points.slice(-1);

    // remove points between currentPoint and last
    if (points.length > 0) {
      const outlinePointsFiltered = outlinePointsWithIndex
        .filter(p => p.index <= currentPoint.index || p.index >= points[0].index)
        .map(p => p.point);
      this.outlinePoints.length = 0;
      this.outlinePoints.push(...outlinePointsFiltered);
    }
  }

  // find lines intersection points
  private intersectionPoints(lines: IGLine[]): IGPoint[] {
    const result: IGPoint[] = [];
    const ln = [...lines];
    while (ln.length > 0) {
      const line = ln.pop();
      const intersectLines = ln.filter(l => lineIntersects(l, line));
      const intersectPoints = intersectLines.map(l => {
        const p = lineIntersectionPoint(l, line);
        return {x: p.x, y: p.y, lines: [line, l] };
      });
      result.push(...intersectPoints);
    }
    return result;
  }

  // find points visible from viewPoint (not behind any line)
  private visiblePoints(viewPoint: IGPoint, points: IGPoint[], lines: ILine[]): IGPoint[] {
    const result: IGPoint[] = [];
    for (const p of points) {
      const nextLine: ILine = {p1: viewPoint, p2: p};
      if (lines.every(l => !lineIntersects(l, nextLine))) {
        result.push(p);
      }
    }
    return result;
  }
}

