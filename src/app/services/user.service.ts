import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable, Subscriber } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: Observable<any[]>;
  private currentUser: Object;

  constructor(private db: AngularFireDatabase, private afAuth: AngularFireAuth) { 
    this.users = db.list('users').valueChanges();
  }

  getUser() {
    return new Promise((resolve, reject) => {
      this.users.subscribe((data: any[]) => {
        if(this.afAuth.auth.currentUser) {
          this.currentUser = data.find((elem) => {
            return elem.email === this.afAuth.auth.currentUser.email;
          });
        } else {
          this.currentUser = {access: false};
        }
        resolve(this.currentUser);
      });
    });
  }

  getAccess() {
    if(this.currentUser && this.currentUser['access']) return this.currentUser['access'];
    return false;
  }
}
