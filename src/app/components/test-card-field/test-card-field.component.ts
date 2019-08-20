import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-test-card-field',
  templateUrl: './test-card-field.component.html',
  styleUrls: ['./test-card-field.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TestCardFieldComponent implements OnInit {
  @Input() fieldName: string; //The name of the field
  @Input() fieldVal: string; //The value of the field
  @Input() fieldType: string; //The type of the field
  @Input() fieldRequired: boolean; //Alert to trigger the text that the field is required
  @Input() dropdowns: string[]; //The dropdown values of the field (if testFieldObj.type === dropdown)
  @Input() editMode: boolean; //Whether the test is in editMode
  @Output() fieldUpdate = new EventEmitter<Object>();

  constructor() {
  }

  ngOnInit(){
  }

  updateField() {
    this.fieldUpdate.emit({name: this.fieldName, value: this.fieldVal});
  }

  trackByFunc(index: number): number {
    if(!index) return null;
    return index;
  }
}
