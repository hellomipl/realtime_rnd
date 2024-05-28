import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {
  private annotations: any[] = [];
  private annotationsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(this.annotations);

  constructor() { }

  getAnnotations(): Observable<any[]> {
    return this.annotationsSubject.asObservable();
  }

  addAnnotation(annotation: any): void {
    this.annotations.push(annotation);
    this.annotationsSubject.next(this.annotations);
  }

  deleteAnnotation(annotationId: string): void {
    this.annotations = this.annotations.filter(annotation => annotation.id !== annotationId);
    this.annotationsSubject.next(this.annotations);
  }

  listAnnotations(): any[] {
    return this.annotations;
  }
}
