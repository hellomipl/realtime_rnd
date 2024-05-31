// src/app/components/search-bar/search-bar.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-search-bar',standalone: true,
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],imports: [CommonModule,FormsModule],
})
export class SearchBarComponent {
  @Input() data: any[] = [];
  searchTerm: string = '';
  wholeWord: boolean = false;
  matchCase:boolean=false

  constructor(private searchService: SearchService) {}

  onSearch() {
    this.searchService.search(this.searchTerm, this.data, this.wholeWord );
  }

  onNext() {
    this.searchService.nextMatch();
  }

  onPrevious() {
    this.searchService.previousMatch();
  }

  get totalMatches() {
    return this.searchService.matches$.value.length;
  }

  get currentMatch() {
    return this.searchService.currentMatch$.value + 1;
  }

  get currentPage() {
    const currentMatch = this.searchService.getCurrentMatch();
    return currentMatch ? currentMatch.page + 1 : 1;
  }
  get currentLine() {
    const Currentline = this.searchService.getCurrentLine();
    return Currentline ? Currentline.line + 1 : 1;
  }
}