import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
    searchTerm: string = '';
    private currentOccurrenceIndex: number = 0;
    public occurrences: any[] = [];
    private feedData: any[] = [];
  
    searchResults$ = new BehaviorSubject<any[]>([]);
    currentOccurrence$ = new BehaviorSubject<number>(0);
    totalOccurrences$ = new BehaviorSubject<number>(0);
  
    constructor() {}
  
    initialize(feedData: any[]) {
      this.feedData = feedData;
    }
  
    performSearch(term: string) {
      this.searchTerm = term.toLowerCase();
      this.occurrences = [];
      this.currentOccurrenceIndex = 0;
      
      if (!this.searchTerm) {
        this.resetSearch();
        return;
      }
  
      this.feedData.forEach((page, pageIndex) => {
        page.data.forEach((line: { lines: string[]; }, lineIndex: any) => {
          const text = line.lines[0].toLowerCase();
          let startIndex = 0;
          let index;
          while ((index = text.indexOf(this.searchTerm, startIndex)) > -1) {
            this.occurrences.push({ pageIndex, lineIndex, index });
            startIndex = index + this.searchTerm.length;
          }
        });
      });
  
      this.totalOccurrences$.next(this.occurrences.length);
      this.highlightOccurrences();
      this.updateCurrentOccurrence();
    }
  
    highlightOccurrences() {
      const updatedFeedData = this.feedData.map(page => {
        return {
          ...page,
          data: page.data.map((line: any) => {
            return {
              ...line,
              highlighted: false,
              highlightedIndexes: []
            };
          })
        };
      });
  
      this.occurrences.forEach((occurrence, index) => {
        const { pageIndex, lineIndex, index: charIndex } = occurrence;
        if (updatedFeedData[pageIndex] && updatedFeedData[pageIndex].data[lineIndex]) {
          updatedFeedData[pageIndex].data[lineIndex].highlightedIndexes.push(charIndex);
          if (index === this.currentOccurrenceIndex) {
            updatedFeedData[pageIndex].data[lineIndex].highlighted = true;
          }
        }
      });
  
      this.searchResults$.next(updatedFeedData);
    }
  
    navigateToNext() {
      if (this.occurrences.length === 0) return;
      this.currentOccurrenceIndex = (this.currentOccurrenceIndex + 1) % this.occurrences.length;
      this.updateCurrentOccurrence();
    }
  
    navigateToPrevious() {
      if (this.occurrences.length === 0) return;
      this.currentOccurrenceIndex = (this.currentOccurrenceIndex - 1 + this.occurrences.length) % this.occurrences.length;
      this.updateCurrentOccurrence();
    }
  
    resetSearch() {
      this.searchTerm = '';
      this.currentOccurrenceIndex = 0;
      this.occurrences = [];
      this.totalOccurrences$.next(0);
      this.searchResults$.next(this.feedData);
    }
  
    private updateCurrentOccurrence() {
      if (this.occurrences.length === 0) return;
      const currentOccurrence = this.occurrences[this.currentOccurrenceIndex];
      this.currentOccurrence$.next(this.currentOccurrenceIndex);
      this.highlightOccurrences();
    }
}
