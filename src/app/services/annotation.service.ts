import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Annotation } from '../models/annotation.interface';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {
  private annotations: { [pageIndex: number]: Annotation[] } = {};
  private annotationsSubject: BehaviorSubject<{ [pageIndex: number]: Annotation[] }> = new BehaviorSubject(this.annotations);
  private localStorageKey = 'annotations';
  private tempAnnotation: Annotation | null = null;

  constructor() {
    this.loadAnnotationsFromLocalStorage();
  }

  getAnnotations(pageIndex: number): BehaviorSubject<Annotation[]> {
    return new BehaviorSubject(this.annotations[pageIndex] || []);
  }

  setTempAnnotation(annotation: Annotation): void {
    this.tempAnnotation = annotation;
  }

  getTempAnnotation(): Annotation | null {
    return this.tempAnnotation;
  }

  clearTempAnnotation(): void {
    this.tempAnnotation = null;
  }

  addAnnotation(pageIndex: number, annotation: Annotation): void {
    if (!this.annotations[pageIndex]) {
      this.annotations[pageIndex] = [];
    }
    this.annotations[pageIndex].push(annotation);
    this.annotationsSubject.next(this.annotations);
    this.saveAnnotationsToLocalStorage();
  }

  updateAnnotation(pageIndex: number, annotation: Annotation): void {
    const annotations = this.annotations[pageIndex];
    const index = annotations.findIndex(a => a.id === annotation.id);
    if (index !== -1) {
      annotations[index] = annotation;
      this.annotationsSubject.next(this.annotations);
      this.saveAnnotationsToLocalStorage();
    }
  }

  deleteAnnotation(pageIndex: number, annotationId: string): void {
    const annotations = this.annotations[pageIndex];
    const index = annotations.findIndex(a => a.id === annotationId);
    if (index !== -1) {
      annotations.splice(index, 1);
      this.annotationsSubject.next(this.annotations);
      this.saveAnnotationsToLocalStorage();
    }
  }

  listAnnotations(pageIndex: number): Annotation[] {
    return this.annotations[pageIndex] || [];
  }

  saveAnnotationsToLocalStorage(): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.annotations));
  }

  loadAnnotationsFromLocalStorage(): void {
    const savedAnnotations = localStorage.getItem(this.localStorageKey);
    if (savedAnnotations) {
      this.annotations = JSON.parse(savedAnnotations);
      this.annotationsSubject.next(this.annotations);
    }
  }

  clearAnnotations(): void {
    this.annotations = {};
    this.annotationsSubject.next(this.annotations);
    localStorage.removeItem(this.localStorageKey);
  }
}
