import {Component, EventEmitter, Input, Output} from '@angular/core';
import {
  ILine,
  IPoint, lineAngle, lineIntersects, lineTouch,
  segmentsIntersectionPoint
} from "../geometry";

export interface SvgPoint extends IPoint{
  line?: SvgLine;
}
export interface SvgLine {
  p1: SvgPoint;
  p2: SvgPoint;
}

// noinspection UnterminatedStatementJS
@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent {

  public lines: SvgLine[];
  public points: SvgPoint[];
  draggingPoint: {x0: number, y0: number};
  inters: IPoint & any;
  public markerPoints: IPoint[] = [];
  public markerLines: ILine[] = [];


  constructor() {
    this.lines = [
      {p1: {x: 11, y: 40, line: null}, p2: {x: 80, y: 42}},
      {p1: {x: 10, y: 50}, p2: {x: 90, y: 53}},
      {p1: {x: 25, y: 25}, p2: {x: 60, y: 90}},
      {p1: {x: 25, y: 15}, p2: {x: 60, y: 80}},
      {p1: {x: 25, y:  5}, p2: {x: 60, y: 70}}
    ];
    this.lines.forEach(l => {l.p1.line = l; l.p2.line = l;});
    this.points = [].concat(...this.lines.map(l => [l.p1, l.p2]));

    this.outline();
  }

  svgSelect = (id: string) => {
    const point = this.points[id];
    this.draggingPoint = {x0: point.x, y0: point.y};
    // console.log(point.x, point.y, point.line);
  }

  svgDrag = (id: string, x: number, y: number) => {
    const point = this.points[id];
    point.x = this.draggingPoint.x0 + x;
    point.y = this.draggingPoint.y0 + y;
  }

  svgDragEnd = () => {
    this.checkIntersect();
  }

  private checkIntersect() {
    const l1 = this.lines[0];
    const l2 = this.lines[1];
    const hasIntersect = lineIntersects(l1, l2);

    this.inters = segmentsIntersectionPoint(l1.p1, l1.p2, l2.p1, l2.p2);
    this.inters.color = hasIntersect ? 'red' : 'blue';

    const angle = lineAngle(l1, l2);
    console.log(angle);
  }

  private outline() {
    // take most left point (with min x)
    const currentPoint = this.points.sort((p1, p2) => p1.x - p2.x)[0];

    // all point except current
    let nextPoints = this.points.filter(p => p !== currentPoint);

    // remove points not reachable directly (without line cross)
    nextPoints = nextPoints.filter(p => {
      const nextLine: ILine = {p1: currentPoint, p2: p};
      return this.lines.every(l => lineTouch(l, nextLine) || !lineIntersects(l, nextLine));
    });
    // this.markerPoints = nextPoints;

    // compare angles between currentPoint.line and line to nextPoint
    const nextPoint = nextPoints.sort((point1, point2) => {
      const angle1 = lineAngle(currentPoint.line, {p1: currentPoint, p2: point1});
      const angle2 = lineAngle(currentPoint.line, {p1: currentPoint, p2: point2});
      return angle2 - angle1;
    })[0];
    const nextLine: ILine = {p1: currentPoint, p2: nextPoint};
    this.markerPoints = [nextPoint];
    this.markerLines.push(nextLine);


    // for (const p of nextPoints) {
    //   const nextLine: ILine = {p1: currentPoint, p2: p};
    //   this.markerLines.push(nextLine);
    //   this.markerLines.push(currentPoint.line);
    //   const angle = lineAngle(currentPoint.line, nextLine);
    //   console.log(angle);
    //
    //   // break;
    // }

/*
    // same as above: remove points not reachable directly (without line cross)
    let nextPoints2: IPoint[] = [];

    for (const p of nextPoints) {
      const nextLine: ILine = {p1: currentPoint, p2: p};
      this.markerLines.push(nextLine);
      let nextPointOk = true;
      for (const ln of this.lines) {
        const touch = lineTouch(nextLine, ln);
        const intersects = lineIntersects(nextLine, ln);
        console.log('touch=', touch, 'intersects=', intersects);
        if (!touch && intersects) {
          nextPointOk = false;
          this.markerLines.push(ln);
        }

      }
      if (nextPointOk) {
        nextPoints2.push(p);
      }

    }
*/



  }
}
