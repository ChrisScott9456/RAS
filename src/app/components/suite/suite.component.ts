import { Component, OnInit, ViewChild } from '@angular/core';
import { SuiteService } from '../../services/suite.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
import { ContinueModalComponent } from '../modals/continue-modal/continue-modal.component';
import { AddTestComponent } from '../modals/add-test/add-test.component';
import { Router } from '@angular/router';
import { VirtualScrollerComponent } from 'ngx-virtual-scroller';

export interface Test {
  _id: number,
  test_id: string,  
  primary_fields: {}, 
  test_fields: {},
  selected: boolean
}
@Component({
  selector: 'app-suite',
  templateUrl: './suite.component.html',
  styleUrls: ['./suite.component.css']
})
export class SuiteComponent implements OnInit {
  @ViewChild(VirtualScrollerComponent)
  private virtualScroller: VirtualScrollerComponent;
  private subscriptions: Subscription = new Subscription();
  suite: Test[]; //The original suite from /getSuite
  deleteSuite: Test[]; //The list of tests to be deleted (gets appended to suite before calling updateSuite() )
  primary_fields: {name: string, required: boolean}[]; //primary_fields: Object > fields: Object[] > [Object, Object, ...]
  test_fields: {};
  dropdowns: {};
  builds: [{ name: string, tests: number[] }]; //Array of build objects to list
  editMode: boolean; //If editing
  buildList: boolean; //Boolean to open build list menu
  buildMode: boolean; //If using a specific build
  currBuild: {name: string, index: number}; //Name of currently selected build
  editBuildMode: boolean;
  selectAll: boolean;
  focusTest: number;

  constructor(private router: Router, private suiteService: SuiteService, public dialog: MatDialog) {
    this.editMode = true;
    this.buildList = false;
    this.buildMode = false;
    this.currBuild = {name: 'Full Suite', index: -1};
    this.editBuildMode = false;
    this.selectAll = true;
    
  }

  async ngOnInit() {
    await this.getPrimaryFields();
    await this.getTestFields();
    await this.getDropdowns();
    await this.getSuite();
    await this.getBuilds();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  logThis() {
    console.log(this);
  }

  //Focuses the scroll on an input item
  focusItem(index) {
    if(typeof index === 'string') {
      index = parseInt(index);
    }
    this.virtualScroller.items = this.suite;
    this.virtualScroller.scrollToIndex(index);
  }

  setSelectAll() {
    for(let i = 0; i < this.suite.length; i++) {
      if(this.suite[i]['buildEnable']) {
        this.suite[i].selected = !this.selectAll;
      }
    };
  }

  addTest() {
    const dialogRef = this.dialog.open(AddTestComponent, {
      data: {
        newTest: {
          _id: this.suite.length + this.deleteSuite.length,
          test_id: '',  
          primary_fields: {}, 
          test_fields: {}
        },
        primary_fields: this.primary_fields,
        dropdowns: this.dropdowns,
      }
    });

    this.subscriptions.add(
      dialogRef.afterClosed().subscribe(result => {
        if(result) {
          this.suite.push(result);
          this.focusItem(this.suite.length - 1);
          this.virtualScroller.refresh();
        }
      })
    );
  }

  deleteTest(id: number) {
    console.log(`Deleting test with id: ${id}...`);
    let delTest = this.suite[id];
    delTest.test_id = '';
    this.deleteSuite.push(delTest);

    this.suite.splice(id, 1);
    this.virtualScroller.refresh();
  }

  confirmRun(): void {
    const dialogRef = this.dialog.open(ContinueModalComponent, {
      data: {
        name: 'Run Suite', 
        message: 'Are you sure you want to run the selected tests?',
        confirm: 'RUN',
        cancel: 'CANCEL'
      }
    });

    this.subscriptions.add(
      dialogRef.afterClosed().subscribe(result => {
        if(result === true) this.runSuite();
      })
    );
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    this.deleteSuite = [];
  }

  enableEditBuildMode() {
    this.editBuildMode = true;
    for(let i = 0; i < this.suite.length; i++) {
      this.suite[i]['buildEnable'] = true;
    };
  }

  toggleBuildList() {
    this.buildList = !this.buildList;
  }

  cancelEditBuildMode(disableDialog: boolean) {
    //If disableDialog is true, just exit the build mode without a dialog menu
    if(disableDialog) {
      this.editBuildMode = false;
      this.chooseBuild(this.currBuild.index);

    } else { //If disableDialog is false, prompt the user to accept before exiting build mode
      const dialogRef = this.dialog.open(ContinueModalComponent, {
        data: {
          name: 'Exit Build Edit Mode', 
          message: 'Are you sure you sure you want to exit build edit mode? All changes will be lost!',
          confirm: 'EXIT',
          cancel: 'CANCEL'
        }
      });

      this.subscriptions.add(
        dialogRef.afterClosed().subscribe(result => {
          if(result === true) {
            this.editBuildMode = false;
            this.chooseBuild(this.currBuild.index);
          }
        })
      );
    }
  }

  updateBuild() {
    const dialogRef = this.dialog.open(ContinueModalComponent, {
      data: {
        name: 'Save Build', 
        message: 'Are you sure you want to save the build with your new changes?',
        confirm: 'SAVE',
        cancel: 'CANCEL'
      }
    });

    this.subscriptions.add(
      dialogRef.afterClosed().subscribe(result => {
        if(result === true) {
          if(!this.builds[this.currBuild.index]) {
            this.builds.push({name: null, tests: null}); //Push new object into array if current index doesn't exist
          }
          //Change the name of the current build
          this.builds[this.currBuild.index].name = this.currBuild.name;

          //Clear list of tests in the current build
          this.builds[this.currBuild.index].tests = [];

          //Add each test that where selected = true to the build
          for(let i = 0; i < this.suite.length; i++) {
            if(this.suite[i].selected === true) {
              this.builds[this.currBuild.index].tests.push(this.suite[i]._id);
            }
          };

          //Update the build, then call cancelEditBuildMode() and getBuilds()
          this.suiteService.updateBuild(this.builds)
          .subscribe(builds => {
            this.cancelEditBuildMode(true);
            this.getBuilds();
          });
        }
      })
    );
  }

  resetBuild() {
    if(this.currBuild.name === 'Full Suite') {
      for(let i = 0; i < this.suite.length; i++) {
        this.suite[i]['buildEnable'] = true;
        this.suite[i].selected = true;
      };
    } else {
      for(let i = 0; i < this.suite.length; i++) {
        this.suite[i]['buildEnable'] = false;
        this.suite[i].selected = false;
      };
    }
  }

  chooseBuild(index: number) {
    if(this.builds[index]) {
      this.currBuild = {name: this.builds[index].name, index: index};
    } else {
      this.currBuild = {name: 'Full Suite', index: index};
      this.buildMode = false;
    }
    this.resetBuild();
    if(this.builds[index] && this.builds[index].tests) {
      this.builds[index].tests.forEach((elem) => {
        if(this.suite[elem]) {
          this.suite[elem]['buildEnable'] = true;
          this.suite[elem].selected = true;
        }
      });
    }
  }

  drop(event: CdkDragDrop<Object[]>) {
    moveItemInArray(this.suite, event.previousIndex, event.currentIndex);
  }

  runSuite() {
    let selectSuite = this.suite.filter((elem) => {
      return elem.selected === true;
    });

    if(selectSuite.length > 0) {
      this.subscriptions.add(
        this.suiteService.runSuite(selectSuite, this.primary_fields, this.test_fields)
        .subscribe(suite => {
          this.suite
          this.router.navigate(['queue']);
        })
      );
    } else {
      const dialogRef = this.dialog.open(ContinueModalComponent, {
        data: {
          name: 'Cannot Run', 
          message: 'You must select at least 1 test to run!',
          confirm: 'OK'
        }
      });
    }
  }
  
  cancelSuite() {
    const dialogRef = this.dialog.open(ContinueModalComponent, {
      data: {
        name: 'Exit Edit Mode', 
        message: 'Are you sure you sure you want to exit edit mode? All changes will be lost!',
        confirm: 'EXIT',
        cancel: 'CANCEL'
      }
    });

    this.subscriptions.add(
      dialogRef.afterClosed().subscribe(async (result) => {
        if(result === true) {
          this.toggleEditMode();
          this.getSuite();
        }
      })
    );
  }

  //Returns true if all tests have their required fields filled out
  checkRequired() {
    let reqFlag = true;
    let focusItem;
    
    for(let i = 0; i < this.suite.length; i++) {
      //Return false if any required primary_fields are blank
      this.primary_fields.forEach((field) => {
        if(field.required && !this.suite[i].primary_fields[field.name]) {
          if(!focusItem) focusItem = i;
          reqFlag = false;
        }
      });

      //Return false if any required test_fields are blank
      if(this.suite[i].test_id && this.test_fields[this.suite[i].test_id].fields) { //If test_id and a matching value in test_fields[test_id] exists

        this.test_fields[this.suite[i].test_id].fields.forEach((field) => { //Go through each field listed in test_fields[test_id] and check if required

          if(!this.suite[i].test_fields) this.suite[i].test_fields = {}; //If test_fields does not exist, create it as an empty Object
          if(field.required && !this.suite[i].test_fields[field.name]) { //If the field is required and does not have a value, expand the card
            if(!focusItem) focusItem = i;
            this.suite[i]['expanded'] = true; //Expand the affected card
            reqFlag = false;
          }
        });
      }
    };

    if(focusItem) this.focusItem(focusItem); //Call focusItem on the first card that fails the required check in the list
    return reqFlag;
  }

  //Changes the _id of each test to reorder the suite for /updateSuite
  orderSuite() {
    for(let i = 0; i < this.suite.length; i++) {
      this.suite[i]._id = i;
    }
  }

  //Inserts the test at its new index
  insertTest(update: {newID: number, oldID: number}) {
    if(update.newID !== update.oldID && update.newID > -1 && this.suite.length - 1 > update.newID) {

      if(update.newID > update.oldID) {
        this.suite.splice(update.newID + 1, 0, this.suite[update.oldID]); //Position the new test at the newID index
        this.suite.splice(update.oldID, 1); //Remove the item at the oldID index
      } else {
        this.suite.splice(update.newID, 0, this.suite[update.oldID]); //Position the new test at the newID index
        this.suite.splice(update.oldID + 1, 1); //Remove the item at the oldID index
      }
      
      this.orderSuite();
      this.focusItem(update.newID);
      this.suite[update.newID]['expanded'] = true;
    } else {
      const dialogRef = this.dialog.open(ContinueModalComponent, {
        data: {
          name: 'Invalid ID!', 
          message: `The ID you entered must be a number between 0 - ${this.suite.length}`,
          confirm: 'OK',
        }
      });
    }
  }

  //Changes the "tests" array in builds to match new suite reordering
  orderBuilds() {
    for(let i = 0; i < this.builds.length; i++) {
      let delBuildList = [];
      for(let j = 0; j < this.builds[i].tests.length; j++) {
        let index = this.suite.findIndex((elem) => {return elem._id === this.builds[i].tests[j]}); //Get the index where the tests[j] value matches the _id in the suite
        let delIndex = this.deleteSuite.findIndex((elem) => {return elem._id === this.builds[i].tests[j]}); //Get the index from the deleteSuite

        //If missing in the suite or present in the deleteSuite
        if(index <= -1 || delIndex > -1) {
          delBuildList.push(j); //this.builds[i].tests.splice(j); //Remove builds.tests[j]
        } else {
          this.builds[i].tests[j] = index; //Set the tests[j] value to the index
        }
      };
      
      //Go through delBuildList and remove the values from the build.tests array
      delBuildList.forEach((elem) => {
        this.builds[i].tests.splice(this.builds[i].tests.indexOf(elem), 1); //Remove "1" element starting from index "this.builds[i].tests.indexOf(elem)"
      });
    }
  }

  updateSuite() {
    if(this.checkRequired()) {
      const dialogRef = this.dialog.open(ContinueModalComponent, {
        data: {
          name: 'Save Suite', 
          message: 'Are you sure you want to save the suite with your new changes? This will alter all builds using these tests!',
          confirm: 'SAVE',
          cancel: 'CANCEL'
        }
      });

      this.subscriptions.add(
        dialogRef.afterClosed().subscribe(result => {
          if(result === true) {
            this.orderBuilds();
            this.suite.push(...this.deleteSuite); //Append deleteSuite to suite
            this.orderSuite();

            this.suiteService.updateSuite(this.suite)
            .subscribe(suite => {
              this.toggleEditMode();
              this.getSuite(); //getSuite after updateSuite

              this.suiteService.updateBuild(this.builds)
              .subscribe(suite => {
                this.getBuilds();
              });
            });
          }
        })
      );
    } else {
      const dialogRef = this.dialog.open(ContinueModalComponent, {
        data: {
          name: 'Save Alert', 
          message: 'You must fill out all required fields!',
          cancel: 'OK'
        }
      });
    }
  }

  getSuite() {
    if(!this.selectAll) this.selectAll = true;
    return new Promise((resolve, reject) => {
      this.subscriptions.add(
        this.suiteService.getSuite()
        .subscribe((data: Test[]) => {
          // console.log(data);
          this.suite = data;
          this.resetBuild();
          resolve();
        })
      );
    });
  }

  getBuilds() {
    if(!this.selectAll) this.selectAll = true;
    return new Promise((resolve, reject) => {
      this.subscriptions.add(
        this.suiteService.getBuilds()
        .subscribe((data: [{ name: string, tests: number[] }]) => {
          // console.log(data);
          this.builds = data;
          resolve();
        })
      );
    });
  }

  getPrimaryFields() {
    return new Promise((resolve, reject) => {
      this.subscriptions.add(
        this.suiteService.getPrimaryFields()
        .subscribe((data: {name: string, required: boolean}[]) => {
          // console.log(data);
          this.primary_fields = data;
          resolve();
        })
      );
    });
  }

  getTestFields() {
    return new Promise((resolve, reject) => {
      this.subscriptions.add(
        this.suiteService.getTestFields()
        .subscribe((data: Object) => {
          // console.log(data);
          this.test_fields = data;
          resolve();
        })
      );
    });
  }

  getDropdowns() {
    return new Promise((resolve, reject) => {
      this.subscriptions.add(
        this.suiteService.getDropdowns()
        .subscribe((data: Object) => {
          // console.log(data);
          this.dropdowns = data;
          resolve();
        })
      );
    });
  }

  trackByFunc(index: number, test: Test): number {
    return test ? test._id : null;
  }
}
