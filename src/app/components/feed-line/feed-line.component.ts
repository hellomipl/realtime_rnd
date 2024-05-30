import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BoldQADirective } from '../../directives/bold-qa.directive';

import { SearchService } from '../../services/search.service';
import { HighlightDirective } from '../../directives/highlight.directive';

@Component({
  selector: 'app-feed-line',
  standalone: true,
  imports: [CommonModule,BoldQADirective,HighlightDirective],
  templateUrl: './feed-line.component.html',
  styleUrl: './feed-line.component.scss'
})
export class FeedLineComponent {
  @Input() line: any;
  @Input() lineIndex: number = 0;
  @Input() pageno: any;
  @Input() showTimestamp: boolean = false;
  @Input() isBold: boolean = false;

  constructor(private searchService: SearchService) {}
  
  getCurrentMatchIndexInLine(): number {
    const currentMatch = this.searchService.getCurrentMatchIndex();
    const results = this.searchService.getSearchResults();
    const lineMatches = results.filter(result => result.lineIndex === this.lineIndex && result.pageIndex === this.pageno);
    return lineMatches.findIndex((result, index) => results.indexOf(result) === currentMatch);
  }

  isCurrentMatch(): boolean {
    const currentMatch = this.searchService.getCurrentMatchIndex();
    const results = this.searchService.getSearchResults();
    return results[currentMatch] && results[currentMatch].lineIndex === this.lineIndex && results[currentMatch].pageIndex === this.pageno;
  }
}
