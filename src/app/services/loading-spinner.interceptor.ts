import { Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";
import { finalize } from "rxjs/operators";
import { LoadingSpinnerService } from './loading-spinner.service';

@Injectable({
  providedIn: 'root'
})
export class LoadingSpinnerInterceptor implements HttpInterceptor {

  constructor(public loadingSpinnerService: LoadingSpinnerService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loadingSpinnerService.showSpinner();
    
    return next.handle(req) //Receives the next intercepted Subject
    .pipe(
      finalize(() => this.loadingSpinnerService.hideSpinner()) //After the Subject completes or errors, finalize() runs
    );
  }
}