import { VirtualScrollStrategy, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Observable } from 'rxjs';

export class CustomVirtualScrollStrategy implements VirtualScrollStrategy {
  private viewport: CdkVirtualScrollViewport | null = null;
  private itemSize: number;
  private dataLength: number;

  constructor(itemSize: number, private data: any[]) {
    this.itemSize = itemSize;
    this.dataLength = data.length;
  }

  scrolledIndexChange!: Observable<number>;

  attach(viewport: CdkVirtualScrollViewport): void {
    this.viewport = viewport;
    this.updateTotalContentSize();
  }

  detach(): void {
    this.viewport = null;
  }

  onContentScrolled(): void {}

  onDataLengthChanged(): void {
    this.updateTotalContentSize();
  }

  onContentRendered(): void {}

  onRenderedOffsetChanged(): void {}

  scrollToIndex(index: number, behavior: ScrollBehavior): void {
    this.viewport?.scrollToOffset(this.itemSize * index, behavior);
  }

  setDataLength(length: number): void {
    this.dataLength = length;
    this.onDataLengthChanged();
  }

  private updateTotalContentSize(): void {
    if (this.viewport) {
      this.viewport.setTotalContentSize(this.dataLength * this.itemSize);
    }
  }
}