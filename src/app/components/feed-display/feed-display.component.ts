import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, OnInit, SimpleChanges } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DataGenerationService } from '../../services/data-generation.service';
import { BoldQADirective } from '../../directives/bold-qa.directive';
import { LiveFeedDialogComponent } from '../live-feed-dialog/live-feed-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FeedData, LineData } from '../../models/data.interface';

@Component({
  selector: 'app-feed-display',
  standalone: true,
  imports: [CommonModule, ScrollingModule, BoldQADirective],
  templateUrl: './feed-display.component.html',
  styleUrls: ['./feed-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedDisplayComponent implements OnInit, AfterViewInit {
  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;

  sessionDetails: any;
  feedData = new BehaviorSubject<any[]>([]);
  showTimestamp: boolean = false;
  globalLineNumber: number = 0;
  itemSize: any = 835;
  needscroll: any = false;

  constructor(private dataService: DataGenerationService, public dialog: MatDialog, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.sessionDetails = this.dataService.getSessionDetails();
    const previousData = this.dataService.generatePreviousFetchData(this.sessionDetails.lastPage, this.sessionDetails.lastLineNumber);
    this.feedData.next(this.dataService.parsePreviousFetchData(previousData));
    this.globalLineNumber = this.sessionDetails.lastPage * 25 + this.sessionDetails.lastLineNumber;

  }
  ngAfterViewInit(): void {
    console.log('Initial Array:', this.feedData.value);
    setTimeout(() => {
      this.calculatePageHeight();
      this.scrollToLastLine();

    }, 10);
  }
  ngAfterViewChecked() {

    if (this.needscroll) {
      console.log('View has been checked and updated', this.needscroll, this.itemSize);
      this.needscroll = false;
      this.scrollToLastLine();
    }
    // You can also set a breakpoint here for debugging
  }
  getFirstLineIndexInNewPage(currentPages: number, feedData: any[]): number {
    let lastNonEmptyPageIndex = -1;
    for (let i = currentPages - 1; i >= 0; i--) {
      if (feedData[i].data.length > 0) {
        lastNonEmptyPageIndex = i;
        break;
      }
    }
    return (lastNonEmptyPageIndex + 1) * 25;
  }
  toggleTimestamp() {
    this.showTimestamp = !this.showTimestamp;
  }

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

  openLiveFeedDialog(): void {
    const dialogRef = this.dialog.open(LiveFeedDialogComponent, {
      width: '400px',
      position: { right: '0' }, hasBackdrop: false,
      data: { updateFeedData: this.updateFeedData.bind(this), baseLineNumber: this.globalLineNumber + 1, previousInputText: '' }
    });
  }

  updateFeedData(data: FeedData): void {
    const currentArray = this.feedData.value; // Reference to the existing array
    data.d.forEach((lineData: LineData) => {
      const { time, asciiValue, globalLineNumber } = lineData;
      const pageIndex = Math.floor((globalLineNumber - 1) / 25) - 1;
      const localLineNumber = (globalLineNumber - 1) % 25;
      const lineDataFormatted = { time, asciiValue, lineIndex: localLineNumber, lines: [String.fromCharCode(...asciiValue)] };

      if (!currentArray[pageIndex]) {
        this.needscroll = true
        // console.log('last  page', currentArray[pageIndex - 1])
        currentArray[pageIndex] = { msg: pageIndex + 1, page: pageIndex + 1, data: [] };
        // console.log('last  page', currentArray[pageIndex])
      }

      const pageData = currentArray[pageIndex].data;
      const existingLineIndex = pageData.findIndex((line: any) => line.lineIndex === localLineNumber);

      if (existingLineIndex >= 0) {
        pageData[existingLineIndex] = lineDataFormatted; // Replace the existing line
      } else {
        this.needscroll = true
        pageData.push(lineDataFormatted); // Add the new line
        pageData.sort((a: any, b: any) => a.lineIndex - b.lineIndex); // Ensure lines are sorted
      }
    });

    // Emit a new array instance for change detection
    this.feedData.next(currentArray.slice());

    // Update global line number to the highest line index received
    this.globalLineNumber = Math.max(this.globalLineNumber, ...data.d.map(line => line.globalLineNumber));

    // Trigger change detection
    this.cdr.markForCheck();
    this.cdr.detectChanges();

    // Delay scrolling to ensure the view is updated
    //clearTimeout(this.clrtime);
    // this.clrtime =  setTimeout(() => this.scrollToLastLine(), 100);
  }

  handleLiveFeedData(data: FeedData): void {
    this.updateFeedData(data);
  }

  trackByPage(index: number, item: any): number {
    return item.page;
  }

  trackByLine(index: number, item: any): number {
    return item.lineIndex;
  }


  private scrollToLastLine(): void {
    debugger;
    const screenHeight = window.innerHeight;

    const scrollheight = (this.itemSize + 60) - (screenHeight - 56);

    if (this.viewport && this.feedData.value.length > 0) {
      const lastpage = this.feedData.value.length - 1;
      const lastline = this.feedData.value[lastpage].data.length - 1;
      const totallines = 25;
      const lineheight = 29;
      const scrolloffset = (totallines - lastline) * lineheight;
      this.viewport.scrollToIndex(this.feedData.value.length - 1);

      const currentScrollPosition = this.viewport.measureScrollOffset();
      this.viewport.scrollToOffset(currentScrollPosition - (scrolloffset - scrollheight - 30));

    }
  }

  private calculatePageHeight() {
    const screenHeight = window.innerHeight;
    const linesPerPage = 25; // Adjust this value according to the session
    const lineHeight = 29;
    this.itemSize = (lineHeight * linesPerPage) + 60;

    // Apply the new item size
    if (this.viewport) {
      this.viewport.checkViewportSize();
    }
  }
  private calculateTotalItems(): number {
    const pages = this.feedData.value;
    let totalItems = 0;
    for (let i = 0; i < pages.length; i++) {
      totalItems += pages[i].data.length;
    }
    // console.log('Total items:', totalItems);
    return totalItems - 1; // subtract 1 to get the last index
  }
}
