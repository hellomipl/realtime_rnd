import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  searchTerm: string = '';
  wholeWord: boolean = false;
  regex: boolean = false;
  totalMatches: number = 0;
  currentMatchIndex: number = 0;

  constructor(private searchService: SearchService) {
    this.searchService.searchResults$.subscribe(results => {
      // Show the total count for all pages
      this.totalMatches = results.length;
  });
  this.searchService.currentMatchIndex$.subscribe(index => {
      this.currentMatchIndex = index;
  });
  }

  onSearchTermChange(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.performSearch();
    }
  }

  performSearch() {
    this.searchService.updateSearchTerm(this.searchTerm);
  }

  onWholeWordToggle() {
    this.wholeWord = !this.wholeWord;
    this.updateSearchOptions();
  }

  onRegexToggle() {
    this.regex = !this.regex;
    this.updateSearchOptions();
  }

  updateSearchOptions() {
    this.searchService.updateSearchOptions({ wholeWord: this.wholeWord, regex: this.regex });
  }

  navigateNext() {
    if (this.totalMatches > 0) {
      let newIndex = (this.currentMatchIndex + 1) % this.totalMatches;
      this.searchService.updateCurrentMatchIndex(newIndex);
    }
  }

  navigatePrevious() {
    if (this.totalMatches > 0) {
      let newIndex = (this.currentMatchIndex - 1 + this.totalMatches) % this.totalMatches;
      this.searchService.updateCurrentMatchIndex(newIndex);
    }
  }

  resetSearch() {
    this.searchTerm = '';
    this.wholeWord = false;
    this.regex = false;
    this.searchService.updateSearchTerm('');
    this.searchService.updateSearchResults([]);
    this.searchService.updateCurrentMatchIndex(0);
}

}