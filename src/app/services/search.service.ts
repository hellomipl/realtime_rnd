import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  public searchTerm: string = '';
  private matches: { page: number, line: number, position: number }[] = [];
  private currentMatchIndex: number = 0;

  matches$ = new BehaviorSubject<{ page: number, line: number, position: number }[]>([]);
  currentMatch$ = new BehaviorSubject<number>(0);

  constructor() {}

  search(term: string, data: any[], wholeWord: boolean ) {
    let matchCase: boolean = !wholeWord;
    this.searchTerm = matchCase ? term : term.toLowerCase();
    this.matches = [];
    const regexFlags = matchCase ? 'g' : 'gi';
    let regexTerm = term;
    if (wholeWord) {
      regexTerm = `\\b${term}\\b`;
    }
    const regex = new RegExp(regexTerm, regexFlags);

    data.forEach((page, pageIndex) => {
      page.data.forEach((line: { lines: any[]; }, lineIndex: any) => {
        let text = line.lines.join(' ');
        if (!matchCase) {
          text = text.toLowerCase();
        }
        let match;
        while ((match = regex.exec(text)) !== null) {
          this.matches.push({ page: pageIndex, line: lineIndex, position: match.index });
        }
      });
    });

    this.matches$.next(this.matches);
    this.currentMatchIndex = 0;
    this.currentMatch$.next(this.currentMatchIndex);
  }

  nextMatch() {
    if (this.matches.length === 0) return;
    this.currentMatchIndex = (this.currentMatchIndex + 1) % this.matches.length;
    this.currentMatch$.next(this.currentMatchIndex);
  }

  previousMatch() {
    if (this.matches.length === 0) return;
    this.currentMatchIndex =
      (this.currentMatchIndex - 1 + this.matches.length) % this.matches.length;
    this.currentMatch$.next(this.currentMatchIndex);
  }

  getCurrentMatch() {
    debugger;
    return this.matches[this.currentMatchIndex];
  }
}
