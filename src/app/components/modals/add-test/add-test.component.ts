import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Test } from '../../suite/suite.component';

export interface AddTestData {
  newTest: Test,
  primary_fields: {name: string, required: boolean}[];
  dropdowns: string[];
}

@Component({
  selector: 'app-add-test',
  templateUrl: './add-test.component.html',
  styleUrls: ['./add-test.component.css']
})
export class AddTestComponent {
  filled: boolean;

  constructor(
    public dialogRef: MatDialogRef<AddTestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddTestData) {
      this.filled = false;
      data.newTest['buildEnable'] = true;
      data.newTest['selected'] = true;
      data.newTest['expanded'] = true;
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

  updatePrimary(field: {name: string, value: string}) {
    let isPrimaryField = this.data.primary_fields.findIndex((elem) => {
      return elem.name === field.name;
    });
    
    if(isPrimaryField >= 0) {
      this.data.newTest.primary_fields[field.name] = field.value;
    } else {
      console.log(`Failed to update since ${field.name} does not exist in schema!`);
    }
    this.checkFilled();
  }

  checkFilled() {
    let index = this.data.primary_fields.findIndex((elem) => {
      if(elem.required && !this.data.newTest.primary_fields[elem.name]) {
        return true;
      }
      return false;
    });

    if(index < 0) {
      this.filled = true;
      this.data.newTest.test_id = this.data.newTest.primary_fields['Function'];
    } else {
      this.filled = false;
    }
  }
}
