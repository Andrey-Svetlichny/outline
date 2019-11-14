import {Component, EventEmitter, Input, Output} from '@angular/core';
import {
  IPoint,
  segmentsIntersectionPoint,
  segmentsIntersects
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


  constructor() {
    this.lines = [
      {p1: {x: 11, y: 40, line: null}, p2: {x: 80, y: 42}},
      // {p1: {x: 10, y: 50}, p2: {x: 90, y: 53}},
      {p1: {x: 25, y: 25}, p2: {x: 60, y: 90}},
      // {p1: {x: 25, y: 15}, p2: {x: 60, y: 80}},
      // {p1: {x: 25, y:  5}, p2: {x: 60, y: 70}}
    ];
    this.lines.forEach(l => {l.p1.line = l; l.p2.line = l;});
    this.points = [].concat(...this.lines.map(l => [l.p1, l.p2]));


    const leftMostPoint = this.points.sort((p1, p2) => p1.x - p2.x)[0];
    console.log('leftMostPoint=', leftMostPoint);

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
    const hasIntersect = segmentsIntersects(l1.p1, l1.p2, l2.p1, l2.p2);

    this.inters = segmentsIntersectionPoint(l1.p1, l1.p2, l2.p1, l2.p2);
    this.inters.color = hasIntersect ? 'red' : 'blue';
  }
}
