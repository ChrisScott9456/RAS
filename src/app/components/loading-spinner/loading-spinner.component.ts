import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { LoadingSpinnerService } from '../../services/loading-spinner.service';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent {
  color = 'primary';
  mode = 'indeterminate';
  value = '50';
  isLoading: Subject<boolean> = this.loaderService.isLoading;

  constructor(private loaderService: LoadingSpinnerService){}

}
