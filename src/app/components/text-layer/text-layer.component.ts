import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FeedLineComponent } from '../feed-line/feed-line.component';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-text-layer',
  standalone: true,
  imports: [CommonModule,FeedLineComponent],
  templateUrl: './text-layer.component.html',
  styleUrl: './text-layer.component.scss'
})
export class TextLayerComponent {
  @Input() lines: any;
  @Input() pageno: any;
  @Input() showTimestamp: boolean=false;
  annotations:any=[];
  zoomLevel:any=1;


  constructor(private searchService: SearchService) {}
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

  isCurrentMatch(index: number): boolean {
    const currentMatch = this.searchService.getCurrentMatchIndex();
    const results = this.searchService.getSearchResults();
    return results[currentMatch] && results[currentMatch].lineIndex === index;
  }

}
