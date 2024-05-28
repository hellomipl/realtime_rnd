import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TextLayerComponent } from '../text-layer/text-layer.component';
import { AnnotationLayerComponent } from '../annotation-layer/annotation-layer.component';

@Component({
  selector: 'app-feed-page',
  standalone: true,
  imports: [CommonModule,TextLayerComponent,AnnotationLayerComponent],
  templateUrl: './feed-page.component.html',
  styleUrl: './feed-page.component.scss'
})
export class FeedPageComponent {
  @Input() page: any;
  @Input() itemSize: number=0;
  @Input() showTimestamp: boolean=false;
  @Input() pageno: any;
  annotations:any=[];
  zoomLevel:any=1;
  trackByLine(index: number, item: any): number {
    return item.lineIndex;
  }

  onMouseUp() {
    this.performAnnotation()
    }

  private performAnnotation() {

debugger;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {

      const selectedText = selection.toString();

      const range = selection.getRangeAt(0);
      const rects: any = range.getClientRects();
      if (!rects.length || selectedText == '') {

        selection.removeAllRanges();
        return
      }



      if (rects.length === 0 || selectedText.length === 0) {
        selection.removeAllRanges();
        return
      }



      let index = 0;
      let annotationLIst=[];
      for (let rect of rects) {
        const container = document
          .elementFromPoint(rect.left, rect.top)
          ?.closest('.line-text');
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const lineElement: any = container.closest('.line');
          const lineRect = lineElement.getBoundingClientRect();
          const pageElement = container.closest('.page');
         const lineNumberElement = lineElement.querySelector('.line-number');
        //  const lineNumber = container.getAttribute('data-line-number');

          if (pageElement) {


            index++;
            const lineNumberWidth = lineNumberElement.getBoundingClientRect().width + 10;
            const adjustedY = rect.top - lineRect.top + lineElement.offsetTop - (this.zoomLevel == 1 ? 0 : this.zoomLevel);
            let cordinates ={ x: (rect.left - containerRect.left + lineNumberWidth) / this.zoomLevel,
            y: adjustedY,
            width: rect.width / this.zoomLevel,
            height: rect.height / this.zoomLevel}
            annotationLIst.push(cordinates);
          }
        }
      }
      

      selection.removeAllRanges();
      if(annotationLIst.length>0){
        this.addAnnotation({rects:annotationLIst})
      
      }
      
    }
  }


  addAnnotation(annotation: any): void {
    if (!this.page.annotations) {
      this.page.annotations = [];
    }
    this.page.annotations.push(annotation);
  }

  addAnnotation1(annotation: any) {
    this.annotations.push(annotation);
  }

  removeAnnotation(index: number) {
    this.annotations.splice(index, 1);
  }
}
