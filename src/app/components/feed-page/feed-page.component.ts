import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { TextLayerComponent } from '../text-layer/text-layer.component';
import { AnnotationLayerComponent } from '../annotation-layer/annotation-layer.component';
import { AnnotationService } from '../../services/annotation.service';
import { Annotation } from '../../models/annotation.interface';
import { AnnotationDialogService } from '../../services/annotation-dialog.service';
import { Subscription } from 'rxjs';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-feed-page',
  standalone: true,
  imports: [CommonModule, TextLayerComponent, AnnotationLayerComponent],
  templateUrl: './feed-page.component.html',
  styleUrls: ['./feed-page.component.scss']
})
export class FeedPageComponent implements OnInit {
  @Input() page: any;
  @Input() itemSize: number = 0;
  @Input() showTimestamp: boolean = false;
  annotations: Annotation[] = [];
  zoomLevel: any = 1;

  constructor(private searchService: SearchService,
    private annotationService: AnnotationService,
    private annotationDialogService: AnnotationDialogService,
    private cdr: ChangeDetectorRef
  ) {}

 

    ngOnInit(): void {

      this.annotationService.getAnnotations(this.page.msg).subscribe(annotations => {
        this.annotations = annotations;
        this.page.annotations = annotations;
        this.cdr.detectChanges(); // Trigger change detection
      });

     
    }
  
    
   
  

  trackByLine(index: number, item: any): number {
    return item.lineIndex;
  }

  onMouseUp() {
    this.performAnnotation();
  }

  performAnnotation() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const selectedText = selection.toString();
      const range = selection.getRangeAt(0);
      const rects: any = range.getClientRects();
      if (!rects.length || selectedText == '') {
        selection.removeAllRanges();
        return;
      }

      let annotationList = [];
      for (let rect of rects) {
        const container = document.elementFromPoint(rect.left, rect.top)?.closest('.line-text');
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const lineElement: any = container.closest('.line');
          const lineRect = lineElement.getBoundingClientRect();
          const pageElement = container.closest('.page');
          const lineNumberElement = lineElement.querySelector('.line-number');

          if (pageElement) {
            const lineNumberWidth = lineNumberElement.getBoundingClientRect().width + 10;
            const adjustedY = rect.top - lineRect.top + lineElement.offsetTop - (this.zoomLevel == 1 ? 0 : this.zoomLevel);
            let coordinates = {
              x: (rect.left - containerRect.left + lineNumberWidth) / this.zoomLevel,
              y: adjustedY,
              width: rect.width / this.zoomLevel,
              height: rect.height / this.zoomLevel
            };
            annotationList.push(coordinates);
          }
        }
      }

      selection.removeAllRanges();
      if (annotationList.length > 0) {
        const annotation: Annotation = {
          id: this.generateUniqueId(),
          pageIndex: this.page.msg,
          text: selectedText,
          color: 'yellow', // Set your desired color here
          coordinates: annotationList,
          timestamp: new Date()
        };
        this.annotationService.setTempAnnotation(annotation);
        this.showTemporaryAnnotation(annotation);
        this.annotationDialogService.updateDialogSelection(selectedText, annotationList);
        if (!this.annotationDialogService.isOpen()) {
          this.annotationDialogService.openDialog(annotation);
          this.annotationDialogService.handleDialogResult(this.page.msg, this.cdr);
        }
      }
    }
  }

  private generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private showTemporaryAnnotation(annotation: Annotation) {
    this.page.annotations = [annotation]; // Show only the current temporary annotation
    this.cdr.detectChanges(); // Trigger change detection
  }
}
