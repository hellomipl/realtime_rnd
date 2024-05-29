import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AnnotationDialogComponent } from '../components/annotation-dialog/annotation-dialog.component';
import { Annotation } from '../models/annotation.interface';
import { ChangeDetectorRef } from '@angular/core';
import { AnnotationService } from './annotation.service';

@Injectable({
  providedIn: 'root'
})
export class AnnotationDialogService {
  private dialogRef: MatDialogRef<AnnotationDialogComponent> | null = null;

  constructor(
    private dialog: MatDialog,
    private annotationService: AnnotationService
  ) {}

  openDialog(annotation?: Annotation): MatDialogRef<AnnotationDialogComponent> {
    if (this.dialogRef) {
      this.dialogRef.componentInstance.annotation = annotation || this.createEmptyAnnotation();
      this.dialogRef.componentInstance.uniqueId = this.dialogRef.componentInstance.annotation.id;
      this.dialogRef.componentInstance.selectedText = this.dialogRef.componentInstance.annotation.text;
    } else {
      this.dialogRef = this.dialog.open(AnnotationDialogComponent, {
        width: '400px',
        position: { right: '0' },
        data: { annotation: annotation || null },
        hasBackdrop: false
      });

      this.dialogRef.afterClosed().subscribe(() => {
        this.dialogRef = null;
      });
    }

    return this.dialogRef;
  }

  updateDialogSelection(selectedText: string, coordinates: any[]): void {
    if (this.dialogRef) {
      this.dialogRef.componentInstance.updateSelection(selectedText, coordinates);
    }
  }

  handleDialogResult(pageIndex: number, cdr: ChangeDetectorRef): void {
    if (this.dialogRef) {
      this.dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Update the annotations
          const annotations = this.annotationService.listAnnotations(pageIndex);
          this.annotationService.clearTempAnnotation();
          cdr.detectChanges(); // Trigger change detection
        } else {
          // Clear temporary annotation
          this.annotationService.clearTempAnnotation();
          cdr.detectChanges(); // Trigger change detection
        }
      });
    }
  }

  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  isOpen(): boolean {
    return this.dialogRef !== null;
  }

  private createEmptyAnnotation(): Annotation {
    return {
      id: '',
      pageIndex: 0,
      text: '',
      color: 'yellow',
      coordinates: [],
      timestamp: new Date()
    };
  }
}
