import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Annotation } from '../../models/annotation.interface';
import { AnnotationIconComponent } from '../annotation-icon/annotation-icon.component';

@Component({
  selector: 'app-annotation-layer',
  standalone: true,
  imports: [CommonModule, AnnotationIconComponent],
  templateUrl: './annotation-layer.component.html',
  styleUrls: ['./annotation-layer.component.scss'],
})
export class AnnotationLayerComponent {
  @Input() annotations: Annotation[] = [];

  updateIcon(rects: { y: number; height: number }[]): { lowest: number; highest: number; difference: number } {
    if (rects.length === 0) {
      return { lowest: 0, highest: 0, difference: 0 };
    }


    let { lowest, highest } = rects.reduce((acc, rect) => ({
      lowest: Math.min(acc.lowest, rect.y),
      highest: Math.max(acc.highest, rect.y)
    }), { lowest: rects[0].y, highest: rects[0].y });

    let difference = (highest - lowest) + rects[0].height;

    if (rects.length === 1) {
      lowest = lowest - 30;
    }

    if (difference < 60) {
      difference = 60;
    }

    return { lowest, highest, difference };
  }
}
