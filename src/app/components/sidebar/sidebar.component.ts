import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Input() currentRoute: string;
  @Output() changeRoute = new EventEmitter<any>();
  buttonList: Array<{name: string, icon_val: string, buttonRoute: string, selected: boolean}>;
  
  constructor(private router: Router, private afAuth: AngularFireAuth) {
    this.buttonList = [
      {
        'name': 'Dashboard',
        'icon_val': 'home',
        'buttonRoute': '/',
        'selected': true
      },
      {
        'name': 'Suite',
        'icon_val': 'assignment',
        'buttonRoute': '/suite',
        'selected': false
      },
      {
        'name': 'Queue',
        'icon_val': 'cached',
        'buttonRoute': '/queue',
        'selected': false
      },
      {
        'name': 'History',
        'icon_val': 'date_range',
        'buttonRoute': '/history',
        'selected': false
      },
      {
        'name': 'Stats',
        'icon_val': 'assessment',
        'buttonRoute': '/stats',
        'selected': false
      }
    ];
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.currentRoute){
      //Reset all "selected" values to false
      this.buttonList.map((elem) => {
        elem.selected = false;
      });

      let newVal = changes.currentRoute.currentValue;
      let newIndex = this.buttonList.findIndex((elem) => {
        return elem.buttonRoute === newVal;
      });

      if(newIndex >= 0) {
        this.buttonList[newIndex].selected = true;
        this.changeRoute.emit(this.buttonList[newIndex].name);
      }
    }
  }

  getSelected(i) {
    if(this.buttonList[i].selected == true) return 'var(--primary-color)';
  }

  logout() {
    console.log('Logging out...');
    console.log(this.router.url);

    //Sign Out
    this.afAuth.auth.signOut();
    
    if(this.router.url === '/') {
      this.router.navigate(['accessdenied']);
    } else {
      this.router.navigate(['']);
    }
  }
}
