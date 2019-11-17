import {Component, EventEmitter, Input, Output, OnInit} from '@angular/core';
import {
  ILine, IPoint, lineAngle, lineIntersects, lineIntersectionPoint, pointToLineDistance, EPSILON
} from '../geometry';

export interface IMarkerPoint extends IPoint {
  color: string;
}
export interface IMarkerLine extends ILine {
  color: string;
}

// graph point
export interface IGPoint extends IPoint {
  x: number;
  y: number;
  lines: IGLine[];
}
export interface IGLine {
  p1: IGPoint;
  p2: IGPoint;
}

// noinspection UnterminatedStatementJS
@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {

  public lines: IGLine[] = [];
  public points: IGPoint[] = []; // dragging handles at the ends of lines
  draggingPoint: {x0: number, y0: number};
  public outlinePoints: IGPoint[] = [];

  inters: IPoint & any;
  public markerPoints: IMarkerPoint[] = [];
  public markerLines: IMarkerLine[] = [];
  private _angle: number;
  private _distance: number;

  @Input() set angle(value: number) {
    this._angle = value;
    this.calc();
  }
  @Input() set distance(value: number) {
    this._distance = value;
    this.calc();
  }
  @Input() set linesData(value: string) {
    this.parseLinesData(value);
    this.calc();
  }
  get linesData(): string {
    return '_linesData';
  }

  public outlineLines(): IGLine[] {
    const result: IGLine[] = [];
    for (let i = 1; i < this.outlinePoints.length; i++) {
      result.push({p1: this.outlinePoints[i - 1], p2: this.outlinePoints[i]});
    }
    return result;
  }

  constructor() {
  }

  ngOnInit(): void {
  }

  private calc() {
    if (this.lines.length > 0) {
      this.closestOutline();
      this.outlineSmooth();
    }
  }

  private parseLinesData(linesData) {
    this.lines = [];
    this.points = [];
    for (const r of JSON.parse(linesData)) {
      const p1: IGPoint = {x: r[0], y: r[1], lines: []};
      const p2: IGPoint = {x: r[2], y: r[3], lines: []};
      const l: IGLine = {p1, p2};
      p1.lines = [l];
      p2.lines = [l];
      this.lines.push(l);
      this.points.push(p1, p2);
    }
  }

  svgSelect = (id: string) => {
    const point = this.points[id];
    this.draggingPoint = {x0: point.x, y0: point.y};
  }

  svgDrag = (id: string, x: number, y: number) => {
    const point = this.points[id];
    point.x = this.draggingPoint.x0 + x;
    point.y = this.draggingPoint.y0 + y;
  }

  svgDragEnd = () => {
    this.closestOutline();
    this.outlineSmooth();

/*
    // test angle
    const l1 = this.markerLines[0];
    const l2 = this.markerLines[1];
    const angle = lineAngle(l1, l2);
    console.log(angle);
*/

  }

  private checkIntersect() {
    const l1 = this.lines[0];
    const l2 = this.lines[1];
    const hasIntersect = lineIntersects(l1, l2);

    this.inters = lineIntersectionPoint(l1, l2);
    this.inters.color = hasIntersect ? 'red' : 'blue';

    const angle = lineAngle(l1, l2);
    // console.log(angle);

    const dist = pointToLineDistance(l1.p1, l2);
    console.log(dist);
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

  private testAngle() {
    const p1: IGPoint = {x: 10, y: 50, lines: []};
    const p2: IGPoint = {x: 50, y: 50, lines: []};
    const p3: IGPoint = {x: 70, y: 30, lines: []};
    const l1: IGLine = {p1, p2};
    const l2: IGLine = {p1: p2, p2: p3};
    this.addMarkerLines([l1, l2]);
    this.lines = [];
    this.points = [p1, p2, p3];
  }

  private testVisiblePoints() {
    const intersectionPoints: IGPoint[] = this.intersectionPoints(this.lines);
    const allPoints: IGPoint[] = [...this.points, ...intersectionPoints];
    const viewPoint = intersectionPoints[4];
    const points = allPoints.filter(p => p !== viewPoint);

    const result = this.visiblePoints(viewPoint, points, this.lines);
    this.addMarkerPoints([viewPoint], 'blue');
    this.addMarkerPoints(points, 'orange');
    this.addMarkerPoints(result);
  }


  private async closestOutline() {
    this.outlinePoints = [];

    function delay(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    // take most left point (with min x)
    const firstPoint = this.points.sort((p1, p2) => p1.x - p2.x)[0];
    this.outlinePoints.push(firstPoint);
    let currentPoint = firstPoint;
    let currentLine: ILine = {p1: {x: firstPoint.x - 1, y: firstPoint.y}, p2: firstPoint};

    // find intersection points
    const intersectionPoints: IGPoint[] = this.intersectionPoints(this.lines);

    // allPoints = this.points + intersection points
    let allPoints: IGPoint[] = [...this.points, ...intersectionPoints];

    // remove points with same coordinates (save lines)
    const allPointsFilt: IGPoint[] = [];
    for (const point of allPoints) {
      const nextPointWithSameCoord = allPoints
        .find(p => p !== point && p.x === point.x && p.y === point.y && allPoints.indexOf(p) > allPoints.indexOf(point));
      if (nextPointWithSameCoord) {
        nextPointWithSameCoord.lines = [...nextPointWithSameCoord.lines, ...point.lines];
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
      // console.log('nextPoints= ', nextPoints);
      // console.log('nextPoint= ', nextPoint);
      // debugger;

      const nextLine = {p1: currentPoint, p2: nextPoint};
      this.outlinePoints.push(nextPoint);

      currentPoint = nextPoint;
      currentLine = nextLine;
      if (nextPoint === firstPoint) {
        break;
      }

      this.addMarkerPoints([currentPoint]);
      await delay(1000);
      this.markerPoints = [];
    }
  }

  private outlineSmooth() {
    for (let i = 0; i < this.outlinePoints.length; i++) {
      // not cross point
      if (this.points.indexOf(this.outlinePoints[i]) >= 0) {
        this.outlineSmoothOnePoint(i);
      }
    }
  }

  private outlineSmoothOnePoint(n: number) {
    interface II {
      index: number;
      point: IGPoint;
    }

    const outlinePointsWithIndex: II[] = this.outlinePoints.map((p, index) => ({index, point: p}));
    const currentPoint = outlinePointsWithIndex[n];
    const currentLine = currentPoint.point.lines[0];

    const nearestLines = this.lines.filter(l => {
      const d = pointToLineDistance(currentPoint.point, l);
      if (d < EPSILON || this._distance < d) {
        return false;
      }

      const angle = Math.abs(lineAngle(currentLine, l)) % (Math.PI / 2);
      return Math.abs(angle) < this._angle;
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
      this.outlinePoints = outlinePointsWithIndex
        .filter(p => p.index <= currentPoint.index || p.index >= points[0].index)
        .map(p => p.point);
    }
  }

  private addMarkerPoints(points: IPoint[], color: string = 'red') {
    this.markerPoints = [...this.markerPoints, ...points.map(p => ({x: p.x, y: p.y, color}))];
  }

  private addMarkerLines(lines: ILine[], color: string = 'red') {
    this.markerLines = [...this.markerLines, ...lines.map(l => ({p1: l.p1, p2: l.p2, color}))];
  }

}
