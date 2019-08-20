import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.css']
})
export class AccessDeniedComponent implements OnInit {
  user: string;
  email: string;
  access: boolean;

  constructor(private afAuth: AngularFireAuth, private userService: UserService) { 
    this.user = this.afAuth.auth.currentUser.displayName;
    this.email = this.afAuth.auth.currentUser.email;
  }

  async ngOnInit() {
    this.access = await this.getAccess();
  }

  async getAccess(): Promise<boolean> {
    return await this.userService.getAccess();
  }

  login() {
    this.afAuth.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
  }

}
