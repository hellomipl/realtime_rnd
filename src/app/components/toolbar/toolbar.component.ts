import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'app-toolbar',standalone: true,
  imports: [CommonModule,SearchComponent],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Input() sessionDetails: any;
  @Input() itemSize: number=0;
  @Output() toggleTimestamp = new EventEmitter<void>();
  @Output() openLiveFeedDialog = new EventEmitter<void>();
  @Output() performAnnotation = new EventEmitter<void>();

  onToggleTimestamp() {
    this.toggleTimestamp.emit();
  }

  onOpenLiveFeedDialog() {
    this.openLiveFeedDialog.emit();
  }

  onPerformAnnotation() {
    this.performAnnotation.emit();
  }
}
