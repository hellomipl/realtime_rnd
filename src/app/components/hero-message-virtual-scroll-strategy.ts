import { VirtualScrollStrategy, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';



export class HeroMessageVirtualScrollStrategy implements VirtualScrollStrategy {
  scrolledIndexChange!: Observable<number>;
  onContentScrolled(): void {
      throw new Error('Method not implemented.');
  }
  onDataLengthChanged(): void {
      throw new Error('Method not implemented.');
  }
  onContentRendered(): void {
      throw new Error('Method not implemented.');
  }
  onRenderedOffsetChanged(): void {
      throw new Error('Method not implemented.');
  }
  scrollToIndex(index: number, behavior: ScrollBehavior): void {
      throw new Error('Method not implemented.');
  }
  private _viewport: CdkVirtualScrollViewport | null = null;
  private _messages: any[] = [];
  private _heightCache = new Map<string, number>();

  attach(viewport: CdkVirtualScrollViewport): void {
    this._viewport = viewport;
  }

  detach(): void {
    this._viewport = null;
  }

  updateMessages(messages: any[]): void {
    this._messages = messages;

    if (this._viewport) {
      this._viewport.checkViewportSize();
    }
  }

  private _getMsgHeight(message: any): number {
    let height = 50; // Default height
    const cachedHeight = this._heightCache.get(message.id);

    if (!cachedHeight) {
      // Calculate and cache the height
      height = this._calculateHeight(message);
      this._heightCache.set(message.id, height);
    } else {
      height = cachedHeight;
    }

    return height;
  }

  private _calculateHeight(message: any): number {
    // Calculate height based on message content
    // Example: calculate height based on text length, etc.
    return 50; // Replace with actual calculation logic
  }
}
