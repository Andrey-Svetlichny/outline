import {Component, EventEmitter, Input, Output} from '@angular/core';
import {
  ILine,
  IPoint, lineAngle, lineIntersects, lineTouch,
  lineIntersectionPoint, pointToLineDistance
} from "../geometry";

export interface IMarkerPoint extends IPoint{
  color: string;
}
export interface IMarkerLine extends ILine{
  color: string;
}

// graph point
export interface IGPoint extends IPoint{
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
export class GraphComponent {

  public lines: IGLine[] = [];
  public points: IGPoint[] = [];
  draggingPoint: {x0: number, y0: number};
  inters: IPoint & any;
  public markerPoints: IMarkerPoint[] = [];
  public markerLines: IMarkerLine[] = [];


  constructor() {
    const linesData =
    [
      [11, 40, 80, 42],
      [10, 50, 90, 53],
      [25, 25, 60, 90],
      [25, 15, 60, 80],
      [25,  5, 60, 70]
    ];
    for (const r of linesData) {
      const p1: IGPoint = {x:r[0], y:r[1], lines:[]};
      const p2: IGPoint = {x:r[2], y:r[3], lines:[]};
      const l: IGLine = {p1, p2};
      p1.lines = [l];
      p2.lines = [l];
      this.lines.push(l);
      this.points.push(p1, p2);
    }

    this.outline();
  }

  svgSelect = (id: string) => {
    const point = this.points[id];
    this.draggingPoint = {x0: point.x, y0: point.y};
    // console.log(point.x, point.y, point.line);

/*
    const intersectionPoints: IPoint[] = this.intersectionPoints(this.lines);
    const allPoints: IPoint[] = [...this.points, ...intersectionPoints];

    const points = this.visiblePoints(point, allPoints, this.lines);
    this.markerPoints = [];
    this.addMarkerPoints(points);
*/

  }

  svgDrag = (id: string, x: number, y: number) => {
    const point = this.points[id];
    point.x = this.draggingPoint.x0 + x;
    point.y = this.draggingPoint.y0 + y;
  }

  svgDragEnd = () => {
    this.outline();
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
      const line = ln.pop()
      const intersectLines = ln.filter(l => lineIntersects(l, line));
      const intersectPoints = intersectLines.map(l => {
          let p = lineIntersectionPoint(l, line);
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

  private lineOtherPoint(line: ILine, point: IPoint): IPoint {
    return line.p1 === point ? line.p2 : line.p1;
  }

  private outline() {
    // take most left point (with min x)
    const firstPoint = this.points.sort((p1, p2) => p1.x - p2.x)[0];
    let currentPoint = firstPoint;
    let currentLine: ILine = {p1: {x: firstPoint.x - 3, y: firstPoint.y}, p2: firstPoint};

    // find intersection points
    const intersectionPoints: IGPoint[] = this.intersectionPoints(this.lines);

    // allPoints = this.points + intersection points
    let allPoints: IGPoint[] = [...this.points, ...intersectionPoints];


    const outlinePoints: IGPoint[] = []


{    // all points except current
    let nextPoints: IGPoint[] = allPoints.filter(p => p !== currentPoint);

    // remove points not reachable directly (without line cross)
    nextPoints = this.visiblePoints(currentPoint, nextPoints, this.lines);



    // lines from currentPoint with angles to currentLine
    const linesWithAngles = currentPoint.lines
      // .map(l => ({p1: currentPoint, p2: this.lineOtherPoint(l, currentPoint)}))
      .map(l => ({l, angle: lineAngle(currentLine, l)}))
      .sort((o1, o2) => o1.angle - o2.angle );
    let nextLine = linesWithAngles[0].l;
    // debugger;

    const nextPoint = nextPoints.find(p => p.lines.some(l => l === nextLine));

    outlinePoints.push(nextPoint);
    currentPoint = nextPoint;
    currentLine = nextLine;
}


    {
      // all points except current
      let nextPoints: IGPoint[] = allPoints.filter(p => p !== currentPoint);

      // remove points not reachable directly (without line cross)
      nextPoints = this.visiblePoints(currentPoint, nextPoints, this.lines);

      this.markerPoints = [];
      this.markerLines = [];
      this.addMarkerPoints([currentPoint], 'blue');
      this.addMarkerPoints(nextPoints, 'orange');

      // on every currentPoint.lines put vectors from currentPoint
      let vectorsFromCurrentPoint: {line: ILine, vector: ILine, angle: number}[] = [];
      for (let line of currentPoint.lines) {
        let vectors: ILine[] = [];
        if (line.p1 === currentPoint) vectors = [{p1: line.p1, p2: line.p2}];
        else if (line.p2 === currentPoint) vectors = [{p1: line.p2, p2: line.p1}];
        else {
          vectors = [{p1: currentPoint, p2: line.p1}, {p1: currentPoint, p2: line.p2}];
        }
        const vv = vectors.map(v => ({line: line, vector: v, angle: null}));
        vectorsFromCurrentPoint.push(...vv);
      }
      // remove line to previous point
      vectorsFromCurrentPoint = vectorsFromCurrentPoint.filter(v => v.vector.p2 !== currentLine.p1);
      // this.addMarkerLines(vectorsFromCurrentPoint.map(v => v.vector));

      // sort by angle relative to currentLine, take first
      vectorsFromCurrentPoint.forEach(v => v.angle = lineAngle(currentLine, v.vector));
      vectorsFromCurrentPoint = vectorsFromCurrentPoint
        .sort((o1, o2) => o1.angle - o2.angle );
      const nextVector = vectorsFromCurrentPoint[0].vector;

      let nextPoint = nextPoints.map(p => ({point: p, dist: pointToLineDistance(p, nextVector)}))
        .sort((o1,o2) => o1.dist-o2.dist)[0].point;

      this.addMarkerLines([nextVector]);
      this.addMarkerPoints([nextPoint]);

      outlinePoints.push(nextPoint);
      currentPoint = nextPoint;

      // this.addMarkerPoints([nextPoint], 'red');
      // this.addMarkerLines([nextLine]);

    }









/*
    let step = 0; let showState = false;
    while (true) {
      step++;
      // all points except current
      let nextPoints = allPoints.filter(p => p !== currentPoint);

      // remove points not reachable directly (without line cross)
      nextPoints = this.visiblePoints(currentPoint, nextPoints, this.lines);

      this.markerPoints = [];
      this.markerLines = [];
      this.addMarkerPoints([currentPoint], 'blue');
      this.addMarkerPoints(nextPoints, 'orange');
      this.addMarkerLines([currentLine]);

      const nextPoint = nextPoints[0];
      const nextLine: ILine = {p1: currentPoint, p2: nextPoint};

      this.addMarkerPoints([nextPoint], 'green');
      this.addMarkerLines([nextLine], 'green');

      const angle = lineAngle(currentLine, nextLine)
      console.log(angle);


/!*
      // compare angles between currentPoint.line and line to nextPoint
      const nextPoint = nextPoints.sort((point1, point2) => {
        const angle1 = lineAngle(currentLine, {p1: currentPoint, p2: point1});
        const angle2 = lineAngle(currentLine, {p1: currentPoint, p2: point2});
        return angle2 - angle1;
      })[0];

      const nextLine: ILine = {p1: currentPoint, p2: nextPoint};
      currentLine = nextLine;
      this.addMarkerLines([nextLine], 'blue');


      // if (step == 2) {
      //   this.addMarkerPoints([currentPoint], 'blue');
      //   this.addMarkerPoints(nextPoints, 'orange');
      //   break;
      // }

      currentPoint = nextPoint;
*!/
      // if (nextPoint === firstPoint)
        break;

    }
*/
  }

  private addMarkerPoints(points: IPoint[], color: string = 'red') {
    this.markerPoints = [...this.markerPoints, ...points.map(p => ({x: p.x, y: p.y, color: color}))];
  }

  private addMarkerLines(lines: ILine[], color: string = 'red') {
    this.markerLines = [...this.markerLines, ...lines.map(l => ({p1: l.p1, p2: l.p2, color}))];
  }

}
