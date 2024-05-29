import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Input() sessionDetails: any;
  @Input() itemSize: number = 0;
  @Output() toggleTimestamp = new EventEmitter<void>();
  @Output() openLiveFeedDialog = new EventEmitter<void>();
  @Output() performAnnotation = new EventEmitter<void>();
  
  // Search-related properties
  searchQuery: string = '';
  wholeWord: boolean = false;
  matchCase: boolean = false;
  currentPage: number = 0;
  currentLine: number = 0;

  @Output() search = new EventEmitter<{query: string, wholeWord: boolean, matchCase: boolean}>();
  @Output() searchNext = new EventEmitter<void>();
  @Output() searchPrevious = new EventEmitter<void>();

  onToggleTimestamp() {
    this.toggleTimestamp.emit();
  }

  onOpenLiveFeedDialog() {
    this.openLiveFeedDialog.emit();
  }

  onPerformAnnotation() {
    this.performAnnotation.emit();
  }

  onSearch() {
    this.search.emit({ query: this.searchQuery, wholeWord: this.wholeWord, matchCase: this.matchCase });
  }

  onSearchNext() {
    this.searchNext.emit();
  }

  onSearchPrevious() {
    this.searchPrevious.emit();
  }
}
