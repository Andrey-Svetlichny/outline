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


  public line: SvgLine = {p1: {x: 10, y: 80}, p2: {x: 90, y: 20}};
  public points: SvgPoint[] = [this.line.p1, this.line.p2];

  draggingPoint: any;

  svgSelect = (id: string) => {
    const pointId = parseInt(id, 10);
    const point = this.points[pointId];
    this.draggingPoint = {id: pointId, x0: point.x, y0: point.y};
  }

  svgDrag = (id: number, x: number, y: number) => {
    const point = this.points[id];
    point.x = this.draggingPoint.x0 + x;
    point.y = this.draggingPoint.y0 + y;
  }

}
