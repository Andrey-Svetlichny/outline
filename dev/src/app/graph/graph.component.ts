import {Component, EventEmitter, Input, Output} from '@angular/core';

export interface SvgPoint {
  x: number;
  y: number;
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

  public lines: SvgLine[] = [
    {p1: {x: 11, y: 40}, p2: {x: 80, y: 42}},
    {p1: {x: 10, y: 50}, p2: {x: 90, y: 53}},
    {p1: {x: 25, y: 25}, p2: {x: 60, y: 90}},
    {p1: {x: 25, y: 15}, p2: {x: 60, y: 80}},
    {p1: {x: 25, y:  5}, p2: {x: 60, y: 70}}
    ];
  public points: SvgPoint[] = [].concat(...this.lines.map(l => [l.p1, l.p2]));

  draggingPoint: {x0: number, y0: number};

  svgSelect = (id: string) => {
    const point = this.points[id];
    this.draggingPoint = {x0: point.x, y0: point.y};
    console.log(point.x, point.y);
  }

  svgDrag = (id: string, x: number, y: number) => {
    const point = this.points[id];
    point.x = this.draggingPoint.x0 + x;
    point.y = this.draggingPoint.y0 + y;
  }

}
