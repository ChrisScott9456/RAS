import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { Test } from '../suite/suite.component';
import { MatDialog } from '@angular/material';
import { ContinueModalComponent } from '../modals/continue-modal/continue-modal.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-test-card',
  templateUrl: './test-card.component.html',
  styleUrls: ['./test-card.component.css']
})
export class TestCardComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  @Input() test: Test; //Contains actual values of fields
  @Input() primary_fields: {name: string}[]; //Contains list of primary_fields needed to render
  @Input() test_fields: {fields: {name: string}[], locations: string[]}; //Contains list of test_fields and locations needed to render
  @Input() dropdowns: {};
  @Input() editMode: boolean;
  @Input() queueMode: boolean;
  @Input() oddEven: boolean;
  @Output() testDeleteEvent = new EventEmitter<number>();
  @Output() changeIDEvent = new EventEmitter<{}>();
  @Input() expanded: boolean;
  @Input() newID: any; //The new ID value

  constructor(public dialog: MatDialog) {
  }

  ngOnInit() {
    // this.test.selected = true;
    // this.test['buildEnable'] = true;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    //When reordering, make newID and test._id match
    if(changes['test'] && changes['test'].currentValue && (changes['test'].currentValue['_id'] !== this.newID)) {
      this.newID = changes['test'].currentValue['_id'];
    }
  }

  toggleDetails() {
    this.test['expanded'] = !this.test['expanded'];
    console.log(this);
  }

  deleteTest() {
    const dialogRef = this.dialog.open(ContinueModalComponent, {
      data: {
        name: 'Delete Test', 
        message: `Are you sure you want to delete test: ${this.test._id}-${this.test.test_id} ?`,
        confirm: 'DELETE',
        cancel: 'CANCEL'
      }
    });

    this.subscriptions.add(
      dialogRef.afterClosed().subscribe(result => {
        if(result === true) {
          this.testDeleteEvent.emit(this.test._id);
        }
      })
    );
  }

  updateTest(field: {name: string, value: string}) {
    let isPrimaryField = this.primary_fields.findIndex((elem) => {
      return elem.name === field.name;
    });

    let isTestField;
    if(this.test_fields) {
      isTestField = this.test_fields.fields.findIndex((elem) => {
        return elem.name === field.name;
      });
    }
    
    if(isPrimaryField >= 0) {
      this.test.primary_fields[field.name] = field.value;

      //Update the test_id
      let tempTestID = this.test.test_id;
      this.test.test_id = this.test.primary_fields['Function'];
      if(tempTestID !== this.test.test_id) {
        this.test.test_fields = {};
      }
    } else if(isTestField >= 0) {
      this.test.test_fields[field.name] = field.value;
    } else {
      console.log(`Failed to update since ${field.name} does not exist in schema!`);
    }
  }

  changeID() {
    this.newID = parseInt(this.newID);
    this.changeIDEvent.emit({newID: this.newID, oldID: this.test._id});
  }

  //Function to optimize ngFor for each field
  trackByFunc(index: number): number {
    if(!index) return null;
    return index;
  }
}
