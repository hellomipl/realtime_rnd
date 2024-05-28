import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {
  private annotations: any[] = [];

  saveAnnotation(annotation: any): void {
    this.annotations.push(annotation);
  }

  getAnnotations(): any[] {
    return this.annotations;
  }

  removeAnnotationsByHid(hid: string): void {
    this.annotations = this.annotations.filter(annot => annot.Hid !== hid);
  }
}
