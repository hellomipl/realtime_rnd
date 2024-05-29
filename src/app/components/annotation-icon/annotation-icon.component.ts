import { Component, Input } from '@angular/core';

@Component({
  selector: 'annotation-icon',
  standalone: true,
  imports: [],
  templateUrl: './annotation-icon.component.html',
  styleUrl: './annotation-icon.component.scss'
})
export class AnnotationIconComponent {
  @Input() issueCount: number = 0;
}
