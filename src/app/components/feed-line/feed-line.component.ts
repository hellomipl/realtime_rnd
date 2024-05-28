
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BoldQADirective } from '../../directives/bold-qa.directive';

@Component({
  selector: 'app-feed-line',
  standalone: true,
  imports: [CommonModule,BoldQADirective],
  templateUrl: './feed-line.component.html',
  styleUrl: './feed-line.component.scss'
})
export class FeedLineComponent {
  @Input() line: any;
  @Input() lineIndex: number=0;
  @Input() page: any;
  @Input() showTimestamp: boolean=false;
  @Input() isBold: boolean=false;

  
}
