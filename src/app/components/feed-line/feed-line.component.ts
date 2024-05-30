import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { BoldQADirective } from '../../directives/bold-qa.directive';

@Component({
  selector: 'app-feed-line',
  standalone: true,
  imports: [CommonModule,BoldQADirective],
  templateUrl: './feed-line.component.html',
  styleUrl: './feed-line.component.scss'
})
export class FeedLineComponent {
  @Input() line: any;
  @Input() lineIndex: number = 0;
  @Input() pageno: any;
  @Input() showTimestamp: boolean = false;
  @Input() searchTerm: string = '';
  @Input() highlightedIndexes: number[] = [];
  @Input() isBold: boolean = false;
  @Input() isCurrent: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm'] || changes['highlightedIndexes'] || changes['isCurrent']) {
      console.log('FeedLineComponent search term:', this.searchTerm);
      console.log('FeedLineComponent highlighted indexes:', this.highlightedIndexes);
      console.log('FeedLineComponent isCurrent:', this.isCurrent);
    }
  }

  getHighlightedText(text: string): string {
    if (!this.searchTerm) {
      return text;
    }

    const searchTermLength = this.searchTerm.length;
    let highlightedText = '';
    let lastIndex = 0;

    this.highlightedIndexes.forEach((index, i) => {
      highlightedText += text.substring(lastIndex, index);
      if (i === this.highlightedIndexes.length - 1 && this.isCurrent) {
        highlightedText += `<span class="highlight current">${text.substr(index, searchTermLength)}</span>`;
      } else {
        highlightedText += `<span class="highlight">${text.substr(index, searchTermLength)}</span>`;
      }
      lastIndex = index + searchTermLength;
    });

    highlightedText += text.substring(lastIndex);
    return highlightedText;
  }
}
