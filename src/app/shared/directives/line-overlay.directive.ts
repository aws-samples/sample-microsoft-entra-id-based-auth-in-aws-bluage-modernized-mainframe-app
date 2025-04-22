import { Directive, ElementRef, OnInit, Renderer2 } from "@angular/core";
import { ElementUtils } from "../utils/element-utils";

@Directive({
  selector: '[lineOverlay]',
})

export class LineOverlayDirective implements OnInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {
  }

  ngOnInit() {
    let columns: Element[] = this.el.nativeElement.querySelectorAll('.lgr_col:not(.empty)');

    columns.forEach(column => {
      let overlayDetails = this.computeOverlayDetails(column);
      let overlayEl = column.querySelector('.line_background');
      let firstChild = column.firstChild;
      if (overlayEl) {
        if (firstChild == overlayEl) {
          firstChild = this.renderer.nextSibling(overlayEl);
        }
        this.renderer.removeChild(column, overlayEl);
      }
      overlayEl = this.renderer.createElement('div');
      this.renderer.addClass(overlayEl, 'line_background')
      this.renderer.addClass(overlayEl, 'lgr_' + this.computeGridNumber(overlayDetails.size));
      this.renderer.addClass(overlayEl, 'col_' + this.computeGridNumber(overlayDetails.position));
      if (firstChild) {
        this.renderer.insertBefore(column, overlayEl, column.firstChild);
      } else {
        this.renderer.appendChild(column, overlayEl);
      }
    });
    if(!ElementUtils.hasClass(this.el.nativeElement, 'line_overlay')) {
      this.renderer.addClass(this.el.nativeElement, 'line_overlay');
    }
  }

  private computeGridNumber(num: number): string {
    return (num < 10 ? '0' : '') + String(num);
  }

  private computeOverlayDetails(column: Element) {
    let result = {
      size: 0,
      position: 0
    }
    let fields = column.querySelectorAll('[class^=lgr_]');
    if(fields) {
      let details = Array.from(fields).map(field => this.computeFieldDetails(field));
      let resultEnd = details.map(field => field.position + field.size).reduce((end, fieldEnd) => Math.max(end, fieldEnd));
      result.position = details.map(field => field.position).reduce((start, fieldStart) => Math.min(start, fieldStart)) - 1;
      result.position = Math.max(0, result.position);
      result.size = resultEnd - result.position + 1;
    }
    return result;
  }

  private computeFieldDetails(field: Element) {
    let result = {
      size: 0,
      position: 0
    }
    if(field.classList) {
      result.size = Number(ElementUtils.findClassStartingWith(field, 'lgr_').substring(4));
      result.position = Number(ElementUtils.findClassStartingWith(field, 'col_').substring(4));
    }
    return result;
  }

}
