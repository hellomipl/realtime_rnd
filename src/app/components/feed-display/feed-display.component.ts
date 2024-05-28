import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, OnInit, SimpleChanges } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DataGenerationService } from '../../services/data-generation.service';
import { BoldQADirective } from '../../directives/bold-qa.directive';
import { LiveFeedDialogComponent } from '../live-feed-dialog/live-feed-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FeedData, LineData } from '../../models/data.interface';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { FeedDisplayService } from './feed-display.service';

@Component({
  selector: 'app-feed-display',
  standalone: true,
  imports: [CommonModule, ScrollingModule, BoldQADirective,ToolbarComponent],
  templateUrl: './feed-display.component.html',
  styleUrls: ['./feed-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

/**?
 * 
 *  {
      lastPage: 5,
      lastLineNumber: 22, // Random line number between 1 and 25 for the last page
      sessionId: this.sessionId,
      userName: this.userName,
      settings: {
        lineNumber: 25,
        startPage: 1,
      },
    };
 */
export class FeedDisplayComponent implements OnInit, AfterViewInit {
  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;
  feedData$: Observable<any[]> = new BehaviorSubject<any[]>([]);
  lastlines:Number=0;
  sessionDetails: any;
  showTimestamp: boolean = false;
  itemSize: any = 835;

  private destroy$ = new Subject<void>();
  constructor(
    private fds: FeedDisplayService,
    public dialog: MatDialog,
    private dataService: DataGenerationService
  ) { }

  ngOnInit() {
    this.sessionDetails = this.dataService.getSessionDetails();
    this.fds.initialize(this.sessionDetails);
     this.feedData$ = this.fds.feedData$;
     this.lastlines = this.fds.sd.lastLineNumber;
  }

  ngAfterViewChecked() {
    if (this.fds.needScroll) {
      console.log('View has been checked and updated', this.fds.needScroll, this.itemSize);
      this.fds.needScroll = false;
      this.scrollToLastLine();
    }
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.calculatePageHeight();
      this.scrollToLastLine();
    }, 10);
  }

  toggleTimestamp() {
    this.showTimestamp = !this.showTimestamp;
    return this.showTimestamp;
  }

  openLiveFeedDialog(): void {
    const dialogRef = this.dialog.open(LiveFeedDialogComponent, {
      width: '400px',
      position: { right: '0' },
      hasBackdrop: false,
      data: { updateFeedData: this.fds.updateFeedData.bind(this.fds), baseLineNumber: Number(this.lastlines) + 1, previousInputText: '' }
    });
  }

  trackByPage(index: number, item: any): number {
    return item.page;
  }

  trackByLine(index: number, item: any): number {
    return item.lineIndex;
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private scrollToLastLine(): void {
    const screenHeight = window.innerHeight;
    const scrollHeight = (this.itemSize + 60) - (screenHeight - 56);

    this.feedData$.pipe(takeUntil(this.destroy$)).subscribe(feedData => {
      if (this.viewport && feedData.length > 0) {
        const lastPage = feedData.length - 1;
        const lastLine = feedData[lastPage].data.length - 1;
        const totalLines = 25;
        const lineHeight = 29;
        const scrollOffset = (totalLines - lastLine) * lineHeight;
        this.viewport.scrollToIndex(feedData.length - 1);

        const currentScrollPosition = this.viewport.measureScrollOffset();
        this.viewport.scrollToOffset(currentScrollPosition - (scrollOffset - scrollHeight - 30));
      }
    });
  }
  isBold(line: string[], index: number, data: any[]): boolean {
   return this.fds.isBold(line, index, data);
  }
  private calculatePageHeight() {
    const screenHeight = window.innerHeight;
    const linesPerPage = 25;
    const lineHeight = 29;
    this.itemSize = (lineHeight * linesPerPage) + 60;

    if (this.viewport) {
      this.viewport.checkViewportSize();
    }
  }
}
