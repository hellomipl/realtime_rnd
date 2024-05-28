import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Annotation } from '../../models/annotation.interface';

@Component({
  selector: 'app-annotation-layer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './annotation-layer.component.html',
  styleUrls: ['./annotation-layer.component.scss']
})
export class AnnotationLayerComponent {
  @Input() annotations: Annotation[] =[];
}
