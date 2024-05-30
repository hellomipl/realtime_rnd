import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, OnInit, SimpleChanges } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { BehaviorSubject, Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DataGenerationService } from '../../services/data-generation.service';
import { BoldQADirective } from '../../directives/bold-qa.directive';
import { LiveFeedDialogComponent } from '../live-feed-dialog/live-feed-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FeedData, LineData } from '../../models/data.interface';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { FeedDisplayService } from './feed-display.service';
import { FeedPageComponent } from '../feed-page/feed-page.component';
import { AnnotationDialogService } from '../../services/annotation-dialog.service';
import { Annotation } from '../../models/annotation.interface';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-feed-display',
  standalone: true,
  imports: [CommonModule, ScrollingModule, BoldQADirective, ToolbarComponent, FeedPageComponent],
  templateUrl: './feed-display.component.html',
  styleUrls: ['./feed-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedDisplayComponent implements OnInit, AfterViewInit {
  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;
  feedData$: Observable<any[]> = new BehaviorSubject<any[]>([]);
  lastlines: Number = 0;
  sessionDetails: any;
  showTimestamp: boolean = false;
  itemSize: any = 835;
  lineHeight: Number = 29;
  private destroy$ = new Subject<void>();
  searchTerm: string = '';
  searchOptions = { wholeWord: false, regex: false };
  private subscriptions: Subscription[] = [];
  currentMatchIndex: number = 0;

  constructor(
    private searchService: SearchService,
    private fds: FeedDisplayService,
    public dialog: MatDialog,
    private dataService: DataGenerationService,
    private cdr: ChangeDetectorRef,
    private annotationDialogService: AnnotationDialogService // Add AnnotationDialogService
  ) {}

  ngOnInit() {
    this.sessionDetails = this.dataService.getSessionDetails();
    this.fds.initialize(this.sessionDetails);
    this.feedData$ = this.fds.feedData$;
    this.lastlines = this.fds.sd.globalLineNo;

    this.subscriptions.push(
      this.searchService.searchTerm$.subscribe(term => {
        this.searchTerm = term;
        this.performGlobalSearch();
      })
    );

    this.subscriptions.push(
      this.searchService.searchOptions$.subscribe(options => {
        this.searchOptions = options;
        this.performGlobalSearch();
      })
    );

    this.subscriptions.push(
      this.searchService.currentMatchIndex$.subscribe(index => {
        this.scrollToCurrentMatch(index);
      })
    );
  }

  performGlobalSearch() {
    if (!this.searchTerm) return;

    const results:any = [];
    this.feedData$.pipe(takeUntil(this.destroy$)).subscribe(feedData => {
      feedData.forEach((page, pageIndex) => {
        page.data.forEach((line: any, lineIndex: number) => {
          const matchIndices = this.findMatches(line.lines[0], this.searchTerm, this.searchOptions);
          matchIndices.forEach(matchIndex => {
            results.push({ pageIndex, lineIndex, matchIndex });
          });
        });
      });
      this.cdr.detectChanges();
      this.searchService.updateSearchResults(results);
    });
  }

  findMatches(line: string, term: string, options: { wholeWord: boolean, regex: boolean }): number[] {
    const matches = [];
    let regex;
    if (options.regex) {
      regex = new RegExp(term, 'g');
    } else if (options.wholeWord) {
      regex = new RegExp(`\\b${term}\\b`, 'g');
    } else {
      regex = new RegExp(term, 'gi');
    }

    let match;
    while ((match = regex.exec(line)) !== null) {
      matches.push(match.index);
    }
    return matches;
  }

  private scrollToCurrentMatch(index: number): void {
    
    const results = this.searchService.getSearchResults();
    if (results.length === 0) return;

    const currentMatch = results[index];
    const currentPage = currentMatch.pageIndex;
    const currentLine = currentMatch.lineIndex;

    // Scroll to the page containing the current match
    this.viewport.scrollToIndex(currentPage, 'smooth');

    // After scrolling to the page, scroll to the specific line
    setTimeout(() => {
      const lineOffset = currentLine * this.itemSize;
      this.viewport.scrollToOffset(lineOffset, 'smooth');
    }, 300);
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

  performAnnotation() {
    const annotation: Annotation = {
      id: this.generateUniqueId(),
      pageIndex: 0,
      text: '',
      color: 'yellow',
      coordinates: [],
      timestamp: new Date()
    };

    this.annotationDialogService.openDialog(annotation);
    this.annotationDialogService.handleDialogResult(0, this.cdr); // Use 0 as placeholder page index
  }

  private generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  trackByPage(index: number, item: any): number {
    return item.page;
  }

  trackByLine(index: number, item: any): number {
    return item.lineIndex;
  }

  ngOnDestroy(): void {
    
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
  }

  private scrollToLastLine(): void {
    const screenHeight = window.innerHeight;
    const scrollHeight = (this.itemSize + 60) - (screenHeight - 56);

    this.feedData$.pipe(takeUntil(this.destroy$)).subscribe(feedData => {
      if (this.viewport && feedData.length > 0) {
        const lastLine = Number(this.fds.sd.lastLineNumber - 1);
        const totalLines = Number(this.fds.sd.settings.lineNumber)

        const scrollOffset = (totalLines - lastLine) * Number(this.lineHeight);
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
    const linesPerPage = this.fds.sd.settings.lineNumber;
    this.itemSize = (Number(this.lineHeight) * linesPerPage) + 60;
    this.cdr.detectChanges();
    if (this.viewport) {
      this.viewport.checkViewportSize();
    }
  }










  
}
