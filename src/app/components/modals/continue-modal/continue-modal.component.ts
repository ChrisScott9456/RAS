import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

export interface DialogData {
  name: string;
  message: string;
}

@Component({
  selector: 'app-continue-modal',
  templateUrl: './continue-modal.component.html',
  styleUrls: ['./continue-modal.component.css']
})
export class ContinueModalComponent {

  constructor(
    public dialogRef: MatDialogRef<ContinueModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
