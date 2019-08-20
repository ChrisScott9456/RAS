import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Router, NavigationStart } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoadingSpinnerService {
  private subscriptions: Subscription = new Subscription();
  isLoading = new Subject<boolean>();
  queuedRequest: number = 0; //Prevent spinner from being removed until queuedRequest is empty

  constructor(private router: Router) { 
    this.subscriptions.add(
      router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.queuedRequest = 0;
          this.isLoading.next(false);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  showSpinner() {
    this.queuedRequest++;
    if(this.queuedRequest > 0) {
      this.isLoading.next(true);
    }
  }
  
  hideSpinner() {
    this.queuedRequest--;
    if(this.queuedRequest <= 0) {
      this.isLoading.next(false);
    }
  }
}
