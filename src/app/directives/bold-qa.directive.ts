import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appBoldQA]',
  standalone: true
})
export class BoldQADirective implements OnInit {
  @Input() appBoldQA: boolean = false;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    if (this.appBoldQA) {
      this.el.nativeElement.style.fontWeight = 'bold';
    }
  }
}
