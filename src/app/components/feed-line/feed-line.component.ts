import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { BoldQADirective } from '../../directives/bold-qa.directive';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-feed-line',
  standalone: true,
  imports: [CommonModule,BoldQADirective],
  templateUrl: './feed-line.component.html',
  styleUrl: './feed-line.component.scss'
})
export class FeedLineComponent {
  @Input() line: any;
  @Input() lineIndex: number=0;
  @Input() pageno: any;
  @Input() showTimestamp: boolean=false;
  @Input() isBold: boolean=false;
  @ViewChild('lineText', { static: true }) lineText!: ElementRef;
  pageIndex: number = 0;
  lineNumber:number=0;
  constructor(private searchService: SearchService) {
    this.pageIndex = this.pageno;
    this.lineNumber = this.lineIndex;
  }



  ngOnInit() {
    this.updateHighlights();
    this.searchService.currentMatch$.subscribe(() => this.updateHighlights());
    this.searchService.matches$.subscribe(() => this.updateHighlights());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['line'] || changes['lineNumber'] || changes['pageIndex']) {
      this.updateHighlights();
    }
  }

  updateHighlights() {
  
    const searchTerm = this.searchService.searchTerm;
    if (!searchTerm) {
      this.lineText.nativeElement.innerHTML = this.line.lines.join(' ');
      return;
    }

    const matches = this.searchService.matches$.value.filter(
      (match) => match.page === this.pageno-1 && match.line === this.lineIndex
    );

    let text = this.line.lines.join(' ');
    let offset = 0;

    matches.forEach((match, index) => {
      const start = match.position + offset;
      const end = start + searchTerm.length;
      const beforeMatch = text.substring(0, start);
      const matchText = text.substring(start, end);
      const afterMatch = text.substring(end);
      const currentClass = match === this.searchService.getCurrentMatch() ? 'current' : '';
      text = `${beforeMatch}<span class="highlight ${currentClass}">${matchText}</span>${afterMatch}`;
      offset += `<span class="highlight ${currentClass}">`.length + '</span>'.length;
    });

    this.lineText.nativeElement.innerHTML = text;
  }
}
