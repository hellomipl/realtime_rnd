import { InputModalityDetector } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-annotation-layer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './annotation-layer.component.html',
  styleUrl: './annotation-layer.component.scss'
})
export class AnnotationLayerComponent {
@Input() annotations: any;
}
