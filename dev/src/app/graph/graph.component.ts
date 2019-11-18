import {Component, Input, OnInit} from '@angular/core';
import {ILine, IPoint} from '../outline-builder/geometry';
import {IGLine, IGPoint, OutlineBuilder} from '../outline-builder';

export interface IMarkerPoint extends IPoint {
  color: string;
}
export interface IMarkerLine extends ILine {
  color: string;
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

  public markerPoints: IMarkerPoint[] = [];
  public markerLines: IMarkerLine[] = [];
  private _angle: number;
  private _distance: number;
  private outlineBuilder: OutlineBuilder;

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
    const builder = new OutlineBuilder();
    builder.lines = this.lines;
    builder.points = this.points;
    builder.outlinePoints = this.outlinePoints;
    // builder.markerLines = this.markerLines;
    // builder.markerPoints = this.markerPoints;
    this.outlineBuilder = builder;
  }

  ngOnInit(): void {
  }

  private calc() {
    if (this.lines.length > 0) {
      this.outlineBuilder.buildOutline(this._angle, this._distance);
    }
  }

  private parseLinesData(linesData) {
    this.lines.length = 0;
    this.points.length = 0;
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

  svgDragStart = () => {
  }

  svgDragEnd = () => {
    this.calc();
  }
}
