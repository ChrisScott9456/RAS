import { Component } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string;
  currentRoute: string;
  access: boolean;
  
  constructor(private router: Router, public afAuth: AngularFireAuth, private userService: UserService) {
    this.title = "Dashboard";

    router.events.subscribe((event) => {
      if(event instanceof NavigationStart && event.url === '/accessdenied') {
        this.title = 'Access Denied';
      }
      
      if(event instanceof NavigationEnd) {
        this.currentRoute = this.router.url;
      }
    });
  }

  ngOnInit() {
  }

  changeRoute(route: string) {
    this.title = route;
  }
}