import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { take, map, tap } from 'rxjs/operators';
import { UserService } from './user.service';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/auth';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private afAuth: AngularFireAuth, private router: Router, private userService: UserService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | boolean {
      return this.afAuth.authState.pipe(
        take(1),
        map((user) => {
            return !!user
        }),
        tap(async (loggedIn) => {
          //If not logged in, send to login screen
          if (!loggedIn) {
            console.log("Access Denied!");
            this.afAuth.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
            
          } else {
            //Check if the user has access, otherwise navigate to access denied page
            await this.userService.getUser();
            const userAccess = this.userService.getAccess();

            if(!userAccess) {
              this.router.navigate(['accessdenied']);
              return false;

            } else if(next.url.length > 0 && next.url[0].path === 'accessdenied') {
              this.router.navigate(['']);
              return false;
              
            } else {
              return true;
            }
          }
        })
      );
  }
}