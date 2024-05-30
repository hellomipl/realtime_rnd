import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';
import { SearchService } from '../services/search.service';

@Directive({
  selector: '[appHighlight]',standalone:true  
})
export class HighlightDirective implements OnChanges {
  @Input() appHighlight: string = '';
  @Input() current: boolean = false;
  @Input() matchIndex: number = -1;

  constructor(private el: ElementRef, private renderer: Renderer2, private searchService: SearchService) {}

  ngOnChanges() {
    this.highlight();
  }

  private highlight() {
    const searchTerm = this.searchService.getSearchTerm();
    if (!searchTerm) {
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', this.appHighlight);
      return;
    }

    const searchOptions = this.searchService.getSearchOptions();
    let regex;
    if (searchOptions.regex) {
      regex = new RegExp(searchTerm, 'g');
    } else if (searchOptions.wholeWord) {
      regex = new RegExp(`\\b${searchTerm}\\b`, 'g');
    } else {
      regex = new RegExp(searchTerm, 'gi');
    }

    const matches = [];
    let match;
    while ((match = regex.exec(this.appHighlight)) !== null) {
      matches.push(match.index);
    }

    if (!matches.length) return;

    let html = this.appHighlight;
    matches.forEach((start, index) => {
      const end = start + searchTerm.length;
      const className = (index === this.matchIndex && this.current) ? 'current-highlight' : 'highlight';
      html = html.slice(0, start) + `<span class="${className}">${html.slice(start, end)}</span>` + html.slice(end);
    });

    this.renderer.setProperty(this.el.nativeElement, 'innerHTML', html);
  }
}