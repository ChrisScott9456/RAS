import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Test } from '../components/suite/suite.component';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class SuiteService {
  private suite: Observable<any[]>;
  private primary_fields: Observable<any>;
  private test_fields: Observable<any>;
  private dropdowns: Observable<any>;
  private builds: Observable<any>;
  
  constructor(private http: HttpClient, private db: AngularFireDatabase) {
    this.suite = db.list('suite').valueChanges();
    this.primary_fields = db.list('primary_fields').valueChanges();
    this.test_fields = db.object('test_fields').valueChanges();
    this.dropdowns = db.object('dropdowns').valueChanges();
    this.builds = db.list('builds').valueChanges();
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  };

  parseOperator(testID: string, field: string, suite: Test[]) {
    let regex = /\${.+}/g;

    //If the field matches the regex
    if(regex.test(field)) {
      let randStr = /\${randStr}{[0-9]+}/i;
      let randNum = /\${randNum}{[0-9]+}/i;
      let randAlphaNum = /\${randAlphaNum}{[0-9]+}/i;
      let randASCII = /\${randASCII}{[0-9]+}/i;
      let chainField = /\${chainField}{[0-9]+-[a-zA-Z -]+,[a-zA-Z -]+}/i;

      //Replace all instances of ${randStr}{length}
      while(randStr.test(field)) {
        let matchVal = field.match(randStr)[0];
        field = field.replace(
          field.match(randStr)[0], () => {
            let count = parseInt(matchVal.substring(matchVal.match(/{[0-9]+}/).index + 1, matchVal.length - 1)); //Get value from {[1-9]} as an integer
            let output = '';
            for(let i = 0; i < count; i++) {
              let rand;
              //Randomly choose between uppercase or lowercase
              if(Math.floor(Math.random() * 2) > 0) {
                rand = Math.floor((Math.random() * 26) + 65); //Generate random uppercase character
              } else {
                rand = Math.floor((Math.random() * 26) + 97); //Generate random lowercase character
              }
              output += String.fromCharCode(rand); //Append random character to string
            }
            return output;
        });
      }

      //Replace all instances of ${randNum}{length}
      while(randNum.test(field)) {
        let matchVal = field.match(randNum)[0];
        field = field.replace(
          field.match(randNum)[0], () => {
            let count = parseInt(matchVal.substring(matchVal.match(/{[0-9]+}/).index + 1, matchVal.length - 1)); //Get value from {[1-9]} as an integer
            let output = '';
            for(let i = 0; i < count; i++) {
              output += Math.floor((Math.random() * 10)); //Generate and append random number between 0-9
            }
            return output;
        });
      }

      //Replace all instances of ${randAlphaNum}{length}
      while(randAlphaNum.test(field)) {
        let matchVal = field.match(randAlphaNum)[0];
        field = field.replace(
          field.match(randAlphaNum)[0], () => {
            let count = parseInt(matchVal.substring(matchVal.match(/{[0-9]+}/).index + 1, matchVal.length - 1)); //Get value from {[1-9]} as an integer
            let output = '';
            for(let i = 0; i < count; i++) {
              let rand;
              let picker = Math.ceil(Math.random() * 3);
              //Randomly choose between uppercase char, lowercase char, or number 0-9
              if(picker > 2) {
                rand = Math.floor((Math.random() * 26) + 65); //Generate random uppercase character
              } else if(picker > 1){
                rand = Math.floor((Math.random() * 26) + 97); //Generate random lowercase character
              } else {
                rand = Math.floor((Math.random() * 10) + 48); //Generate random number between 0-9
              }
              output += String.fromCharCode(rand); //Append random character to string
            }
            return output;
        });
      }

      //Replace all instances of ${randASCII}{length}
      while(randASCII.test(field)) {
        let matchVal = field.match(randASCII)[0];
        field = field.replace(
          field.match(randASCII)[0], () => {
            let count = parseInt(matchVal.substring(matchVal.match(/{[0-9]+}/).index + 1, matchVal.length - 1)); //Get value from {[1-9]} as an integer
            let output = '';
            for(let i = 0; i < count; i++) {
              let rand = Math.floor((Math.random() * 94) + 33); //Generate random ascii value from 33 to 126
              output += String.fromCharCode(rand); //Append random character to string
            }
            return output;
        });
      }

      //Replace all instances of ${chainField}{id,field}
      while(chainField.test(field)) {
        let matchVal = field.match(chainField)[0];
        field = field.replace(
          field.match(chainField)[0], () => {
            let id = matchVal.substring(matchVal.match(/{[0-9]-.+,/).index + 1, matchVal.indexOf(',')); //Get id value as integer
            let fieldName = matchVal.substring(matchVal.indexOf(',') + 1, matchVal.length - 1); //Get the field value
            let index = suite.findIndex((elem) => {
              return `${elem._id}-${elem.test_id}` === id && testID !== `${elem._id}-${elem.test_id}`; //If id matches and isn't the testID (ID of the test the field is in)
            });

            if(index > -1) {
              //If the fieldName is in primary_fields, return its value
              if(suite[index].primary_fields[fieldName]) {
                return suite[index].primary_fields[fieldName];
              }

              //If the fieldName is in test_fields, return its value
              if(suite[index].test_fields[fieldName]) {
                return suite[index].test_fields[fieldName];
              }
            }

            return ''; //If not found in primary_fields or test_fields, return blank
          }
        );
      }
    }
    return field;
  }

  //Builds the suite array into a suitable structure for the backend
  buildSuite(suite: Test[], primary_fields: {name: string}[], test_fields: Object) {
    return suite.map((test) => {
      let newElem = {
        Project: 'Salesgear-INT',
        ID: `${test._id}-${test.test_id}`,
      }

      //Get all primary field values and add to output object
      primary_fields.forEach((field) => {
        if(test.primary_fields[field.name]) {
          newElem[field.name] = this.parseOperator(newElem.ID, test.primary_fields[field.name], suite);
        }
      });

      //Get all test field values and add to output object
      if(test_fields[test.test_id] && test_fields[test.test_id].fields) {
        test_fields[test.test_id].fields.forEach((field) => {
          if(test.test_fields[field.name]) {
            newElem[field.name] = this.parseOperator(newElem.ID, test.test_fields[field.name], suite);
          }
        });
      }
      return newElem;
    });
  }

  getSuite() {
    return this.suite;
  }

  updateSuite(suite: Test[]) {
    suite = suite.map((elem) => { 
      delete elem.selected;
      delete elem['buildEnable'];
      delete elem['expanded'];
      return elem;
    }); //Remove UI only values from tests

    //Go through the suite and set each value in the db.list('suite')
    for(let i = 0; i < suite.length; i++) {
      //If test_id exists, update value
      if(suite[i].test_id) {
        this.db.list('suite').set(`${suite[i]._id}`, suite[i]);

      } else { //If test_id doesn't exist, delete from suite based on _id
        this.db.list('suite').remove(`${suite[i]._id}`);
      }
    };
    return this.suite;
  }

  runSuite(suite: Test[], primary_fields: {name: string}[], test_fields: Object): Observable<Object[]> {
    let newSuite = this.buildSuite(suite, primary_fields, test_fields);

    return this.http.post<Object[]>('http://localhost:8100/runSuite', newSuite)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateBuild(builds: [{ name: string, tests: number[] }]) {
    for(let i = 0; i < builds.length; i++) {
      this.db.list('builds').set(`${i}`, builds[i]);
    }
    return this.builds;
  }

  stopSuite() {
    return this.http.get('http://localhost:8100/stop')
    .pipe(
      // catchError(this.handleError)
    );
  }

  getBuilds() {
    return this.builds;
  }

  getTestFields() {
    return this.test_fields;
  }

  getPrimaryFields() {
    return this.primary_fields;
  }

  getDropdowns() {
    return this.dropdowns;
  }
}
