import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AngularFireDatabase  } from '@angular/fire/database';
import { SuiteService } from 'src/app/services/suite.service';
import { Test } from '../suite/suite.component';
import { ContinueModalComponent } from '../modals/continue-modal/continue-modal.component';
import { MatDialog, MAT_DIALOG_SCROLL_STRATEGY_PROVIDER } from '@angular/material';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.css']
})
export class QueueComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  subQueue: Observable<any[]>; 
  queue: Test[];
  primary_fields: {name: string}[]; //primary_fields: Object > fields: Object[] > [Object, Object, ...]
  test_fields: Object;
  dropdowns: Object;
  
  constructor(private suiteService: SuiteService, private firebase: AngularFireDatabase, public dialog: MatDialog) {
  }

  async ngOnInit() {
    await this.getPrimaryFields();
    await this.getTestFields();
    await this.getDropdowns();

    this.subQueue = this.firebase.list('queue').valueChanges();
    this.subscriptions.add(
      this.subQueue.subscribe((newQueue) => {
        this.queue = newQueue;
        this.changeQueue();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  getStatus(status: string) {
    if(status) {
      if(status === 'Finished') return 'Green';
      if(status === 'Queued') return 'Yellow';
      if(status === 'Running') return 'Orange';
      if(status.includes('Error') || status === 'Bad Input') return 'LRed';
      if(status === 'Stopped' || status === 'CRASHED') return 'DRed';
    }
  }

  changeQueue() {
    //Construct objects into structure suitable for frontend
    let newQueue = this.queue.map((test, index) => {
      let newElem = {
        _id: test['ID'].substring(0, test['ID'].indexOf('-')),
        test_id: test['ID'].substring(test['ID'].indexOf('-') + 1, test['ID'].length),
        primary_fields: {},
        test_fields: {},
        selected: true,
        buildEnable: true,
        status: test['TestStatus'],
        time: test['TestTime'],
        result: test['TestResult']
      }

      //Get all primary field values and add to output object
      this.primary_fields.forEach((field) => {
        if(test[field.name]) {
          newElem.primary_fields[field.name] = test[field.name];
        }
      });

      //Get all test field values and add to output object
      if(this.test_fields[newElem.test_id] && this.test_fields[newElem.test_id].fields) {
        this.test_fields[newElem.test_id].fields.forEach((field) => {
          if(test[field.name]) {
            newElem.test_fields[field.name] = test[field.name];
          }
        });
      }
      return newElem;
    });
    
    this.queue = newQueue;
  }

  rerunErrors() {
    const dialogRef = this.dialog.open(ContinueModalComponent, {
      data: {
        name: 'Rerun Errors', 
        message: 'Are you sure you want to rerun all tests with an error status?',
        confirm: 'RUN',
        cancel: 'CANCEL'
      }
    });

    this.subscriptions.add(
      dialogRef.afterClosed().subscribe( result => {
        if(result) {
          let runQueue = []; //The queue of tests to rerun
          let emptyQueue = false; //A flag to determine if the queue is still running or not

          for(let i = 0; i < this.queue.length; i++) {
            //If the test status was an error, push it into the new run
            if(this.queue[i]['status'].toLowerCase().includes('error')) {
              runQueue.push(this.queue[i]);
            }
          }

          if(runQueue.length > 0) {
            this.subscriptions.add(
              this.suiteService.runSuite(runQueue, this.primary_fields, this.test_fields)
              .subscribe(result => {
                //Should create a modal if an error message is returned
                if(result['message']) {
                  const dialogRef = this.dialog.open(ContinueModalComponent, {
                    data: {
                      name: 'Failed to Run', 
                      message: result['message'],
                      cancel: 'OK'
                    }
                  });
                }
              })
            );
          } else {
            const dialogRef = this.dialog.open(ContinueModalComponent, {
              data: {
                name: 'Cannot Rerun Errors', 
                message: 'There are no tests with an error status to rerun!',
                cancel: 'OK'
              }
            });
          }
        }
      })
    );
  }

  rerunAll() {
    const dialogRef = this.dialog.open(ContinueModalComponent, {
      data: {
        name: 'Rerun All', 
        message: 'Are you sure you want to rerun all tests?',
        confirm: 'RUN',
        cancel: 'CANCEL'
      }
    });

    this.subscriptions.add(
      dialogRef.afterClosed().subscribe( result => {
        if(result) {
          if(this.queue.length > 0) {
            this.subscriptions.add(
              this.suiteService.runSuite(this.queue, this.primary_fields, this.test_fields)
              .subscribe(result => {
                //Should create a modal if an error message is returned
                if(result['message']) {
                  const dialogRef = this.dialog.open(ContinueModalComponent, {
                    data: {
                      name: 'Failed to Run', 
                      message: result['message'],
                      cancel: 'OK'
                    }
                  });
                }
              })
            );
          } else {
            const dialogRef = this.dialog.open(ContinueModalComponent, {
              data: {
                name: 'Cannot Rerun All', 
                message: 'There are no tests in the queue to rerun!',
                cancel: 'OK'
              }
            });
          }
        }
      })
    );
  }
  
  stopRun() {
    const dialogRef = this.dialog.open(ContinueModalComponent, {
      data: {
        name: 'Stop Run', 
        message: 'Are you sure you want to stop all remaining queued tests?',
        confirm: 'CONFIRM',
        cancel: 'CANCEL'
      }
    });

    this.subscriptions.add(
      dialogRef.afterClosed().subscribe( result => {
        if(result) {
          this.suiteService.stopSuite()
          .subscribe(result => {
            if(result['message']) {
              const dialogRef = this.dialog.open(ContinueModalComponent, {
                data: {
                  name: 'Stop Run', 
                  message: result['message'],
                  cancel: 'OK'
                }
              });
            }
          })
        }
      })
    );
  }

  getPrimaryFields() {
    return new Promise((resolve, reject) => {
      this.subscriptions.add(
        this.suiteService.getPrimaryFields()
        .subscribe((data: {name: string}[]) => {
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
