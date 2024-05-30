import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
 private searchTermSubject = new BehaviorSubject<string>('');
  private searchOptionsSubject = new BehaviorSubject<{ wholeWord: boolean, regex: boolean }>({ wholeWord: false, regex: false });
  private searchResultsSubject = new BehaviorSubject<{ pageIndex: number, lineIndex: number, matchIndex: number }[]>([]);
  private currentMatchIndexSubject = new BehaviorSubject<number>(0);

  searchTerm$ = this.searchTermSubject.asObservable();
  searchOptions$ = this.searchOptionsSubject.asObservable();
  searchResults$ = this.searchResultsSubject.asObservable();
  currentMatchIndex$ = this.currentMatchIndexSubject.asObservable();

  updateSearchTerm(term: string) {
    this.searchTermSubject.next(term);
  }

  updateSearchOptions(options: { wholeWord: boolean, regex: boolean }) {
    this.searchOptionsSubject.next(options);
  }

  updateSearchResults(results: { pageIndex: number, lineIndex: number, matchIndex: number }[]) {
    this.searchResultsSubject.next(results);
  }

  updateCurrentMatchIndex(index: number) {
    this.currentMatchIndexSubject.next(index);
  }

  getSearchTerm(): string {
    return this.searchTermSubject.getValue();
  }

  getSearchOptions() {
    return this.searchOptionsSubject.getValue();
  }

  getSearchResults() {
    return this.searchResultsSubject.getValue();
  }

  getCurrentMatchIndex() {
    return this.currentMatchIndexSubject.getValue();
  }
}