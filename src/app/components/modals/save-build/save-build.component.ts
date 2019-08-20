import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-save-build',
  templateUrl: './save-build.component.html',
  styleUrls: ['./save-build.component.css']
})
export class SaveBuildComponent {
  filled: boolean;
  buildName: string;

  constructor(public dialogRef: MatDialogRef<SaveBuildComponent>) {
    this.filled = false;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  changeName() {
    if(this.buildName) this.filled = true;
  }
}