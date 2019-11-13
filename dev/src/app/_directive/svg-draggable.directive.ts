import {Directive, HostListener, Input} from '@angular/core';

@Directive({
  // tslint:disable-next-line
  selector: '[svgDraggable]'
})
export class SvgDraggableDirective {

  private selectedElement: {
    id: string,
    x0: number,
    y0: number
  };

  private dragging: boolean;

  @Input() svgSelect: (id: string) => {};
  @Input() svgDragStart: (id: string) => {};
  @Input() svgDrag: (id: string, x: number, y: number) => {};
  @Input() svgDragEnd: () => {};
  @Input() svgMouseEnter: (id: string) => {};
  @Input() svgMouseLeave: (id: string) => {};

  // convert mouse coordinates to the SVG point
  private static getSVGPoint(event: MouseEvent): SVGPoint {
    const viewport = (event.target as SVGElement).viewportElement as SVGSVGElement;
    if (!viewport) {
      return null;
    }
    const point = viewport.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const CTM = viewport.getScreenCTM();
    return point.matrixTransform(CTM.inverse());
  }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent) {
    if (this.svgMouseEnter) {
      const id = (event.target as HTMLElement).closest('[svgDraggable]').id;
      this.svgMouseEnter(id);
    }
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent) {
    if (this.svgMouseLeave) {
      const id = (event.target as HTMLElement).closest('[svgDraggable]').id;
      this.svgMouseLeave(id);
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    const id = (event.target as HTMLElement).closest('[svgDraggable]').id;
    const svgPoint = SvgDraggableDirective.getSVGPoint(event);
    this.selectedElement = {
      id,
      x0: svgPoint.x,
      y0: svgPoint.y,
    };
    if (this.svgSelect) {
      this.svgSelect(id);
    }
  }

  @HostListener('document: mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.selectedElement) {
      event.preventDefault();
      const svgPoint = SvgDraggableDirective.getSVGPoint(event);
      if (!svgPoint) {
        return;
      }
      const x = svgPoint.x - this.selectedElement.x0;
      const y = svgPoint.y - this.selectedElement.y0;
      if (x || y) {
        if (!this.dragging) {
          this.dragging = true;
          if (this.svgDragStart) {
            this.svgDragStart(this.selectedElement.id);
          }
        }
        if (this.svgDrag) {
          this.svgDrag(this.selectedElement.id, x, y);
        }
      }
    }
  }

  @HostListener('document: mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.selectedElement) {
      this.dragging = false;
      if (this.svgDragEnd) {
        this.svgDragEnd();
      }
      this.selectedElement = null;
    }
  }
}
