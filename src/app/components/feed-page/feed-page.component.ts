import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FeedLineComponent } from '../feed-line/feed-line.component';

@Component({
  selector: 'app-feed-page',
  standalone: true,
  imports: [CommonModule,FeedLineComponent],
  templateUrl: './feed-page.component.html',
  styleUrl: './feed-page.component.scss'
})
export class FeedPageComponent {
  @Input() page: any;
  @Input() itemSize: number=0;
  @Input() showTimestamp: boolean=false;

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
}
