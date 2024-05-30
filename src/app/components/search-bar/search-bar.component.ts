import { Component } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent {
  searchTerm: string = '';
  totalOccurrences: number = 0;
  currentOccurrence: number = 0;
  currentPageIndex: number = 0;
  currentLineIndex: number = 0;

  constructor(private searchService: SearchService) {
    this.searchService.totalOccurrences$.subscribe(count => this.totalOccurrences = count);
    this.searchService.currentOccurrence$.subscribe(index => this.currentOccurrence = index + 1);
    this.searchService.currentOccurrenceDetails$.subscribe(details => {
      this.currentPageIndex = details.pageIndex + 1; // Adjusting for display purposes
      this.currentLineIndex = details.lineIndex;
    });
  }

  onSearch() {
    this.searchService.performSearch(this.searchTerm);
  }

  onNext() {
    this.searchService.navigateToNext();
  }

  onPrevious() {
    this.searchService.navigateToPrevious();
  }

  onReset() {
    this.searchService.resetSearch();
    this.searchTerm = '';
  }
}