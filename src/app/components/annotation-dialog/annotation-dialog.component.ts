import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
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
    MatInputModule,
    MatButtonModule
  ]
})
export class AnnotationDialogComponent implements OnInit {
  viewMode: 'list' | 'create' | 'edit';
  annotation: Annotation;
  uniqueId: string;
  selectedText: string;

  constructor(
    public annotationService: AnnotationService,
    public dialogRef: MatDialogRef<AnnotationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.viewMode = data.viewMode;
    this.annotation = data.annotation || { id: '', pageIndex: 0, text: '', color: 'yellow', coordinates: [], timestamp: new Date() };
    this.uniqueId = this.annotation.id;
    this.selectedText = this.annotation.text;
  }

  ngOnInit(): void {}

  addAnnotation(): void {
    this.annotation.id = this.uniqueId;
    this.annotationService.addAnnotation(this.annotation.pageIndex, this.annotation);
    this.dialogRef.close(this.annotation); // Pass the annotation back when closing the dialog
  }

  saveAnnotation(): void {
    this.annotation.id = this.uniqueId;
    this.annotationService.updateAnnotation(this.annotation.pageIndex, this.annotation);
    this.dialogRef.close(this.annotation); // Pass the annotation back when closing the dialog
  }

  closeDialog(): void {
    this.annotationService.clearTempAnnotation();
    this.dialogRef.close();
  }

  onSelectionChange(): void {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      this.selectedText = selection.toString();
      this.annotation.text = this.selectedText;
    }
  }

  switchToCreateView(): void {
    this.viewMode = 'create';
    this.annotation = { id: '', pageIndex: 0, text: '', color: 'yellow', coordinates: [], timestamp: new Date() };
    this.uniqueId = this.annotation.id;
    this.selectedText = this.annotation.text;
  }

  switchToEditView(annotation: Annotation): void {
    this.viewMode = 'edit';
    this.annotation = annotation;
    this.uniqueId = this.annotation.id;
    this.selectedText = this.annotation.text;
  }

  deleteAnnotation(annotationId: string): void {
    this.annotationService.deleteAnnotation(this.annotation.pageIndex, annotationId);
    this.dialogRef.close();
  }
}
