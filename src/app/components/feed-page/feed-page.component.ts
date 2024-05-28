import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FeedLineComponent } from '../feed-line/feed-line.component';
import { AnnotationLayerComponent } from '../annotation-layer/annotation-layer.component';

@Component({
  selector: 'app-feed-page',
  standalone: true,
  imports: [CommonModule,FeedLineComponent,AnnotationLayerComponent],
  templateUrl: './feed-page.component.html',
  styleUrl: './feed-page.component.scss',schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FeedPageComponent {
  @Input() page: any;
  @Input() itemSize: number=0;
  @Input() showTimestamp: boolean=false;
  feedLines: any[] = [];
  annotations: any[] = [];
  zoomLevel=1;
  @ViewChild('feedContainer') feedContainer !: ElementRef;
  isBold(line: string[], index: number, data: any[]): boolean {
    if (line[0].startsWith('Q.')) {
      return true;
    }
    if (line[0].startsWith('A.')) {
      return false;
    }
    for (let i = index - 1; i >= 0; i--) {
      if (data[i].lines[0].startsWith('Q.')) {
        return true;
      }
      if (data[i].lines[0].startsWith('A.')) {
        return false;
      }
    }
    return false;
  }

  trackByLine(index: number, item: any): number {
    return item.lineIndex;
  }

  onMouseUp() {
    this.performAnnotation()
    // const selectedText = window.getSelection();
    // if (selectedText) {
    //   const rects = this.getSelectionRects();
    //   this.addAnnotation({ rects, text: selectedText });
    // }
  }

  private performAnnotation() {


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
            const lineNumberWidth = lineNumberElement.getBoundingClientRect().width + 20;
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
      this.addAnnotation({rects:annotationLIst})
    }
  }



  // getSelectionRects() {
  //   const range = window.getSelection().getRangeAt(0);

  //   const rects = Array.from(range.getClientRects()).map(rect => ({
  //     x: rect.left - this.feedContainer.nativeElement.offsetLeft,
  //     y: rect.top - this.feedContainer.nativeElement.offsetTop,
  //     width: rect.width,
  //     height: rect.height
  //   }));
  //   return rects;
  // }

  addAnnotation(annotation: any) {
    this.annotations.push(annotation);
   
  }

  removeAnnotation(index: number) {
    this.annotations.splice(index, 1);
  }
}
