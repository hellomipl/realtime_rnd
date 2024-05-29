import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Annotation } from '../../models/annotation.interface';
import { AnnotationService } from '../../services/annotation.service';

@Component({
  selector: 'app-annotation-dialog',
  templateUrl: './annotation-dialog.component.html',
  styleUrls: ['./annotation-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class AnnotationDialogComponent implements OnInit {
  annotation: Annotation;
  uniqueId: string;
  selectedText: string;

  constructor(
    private annotationService: AnnotationService,
    public dialogRef: MatDialogRef<AnnotationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.annotation = data.annotation || this.createEmptyAnnotation();
    this.uniqueId = this.annotation.id;
    this.selectedText = this.annotation.text;
  }

  ngOnInit(): void {}

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

  addAnnotation(): void {
    this.annotation.id = this.uniqueId;
    this.annotationService.addAnnotation(this.annotation.pageIndex, this.annotation);
    this.dialogRef.close(this.annotation); // Pass the annotation back when closing the dialog
  }

  updateAnnotation(): void {
    this.annotationService.updateAnnotation(this.annotation.pageIndex, this.annotation);
    this.dialogRef.close(this.annotation); // Pass the annotation back when closing the dialog
  }

  closeDialog(): void {
    this.annotationService.clearTempAnnotation();
    this.dialogRef.close();
  }

  updateSelection(selectedText: string, coordinates: any[]): void {
    this.selectedText = selectedText;
    this.annotation.text = selectedText;
    this.annotation.coordinates = coordinates;
  }
}
