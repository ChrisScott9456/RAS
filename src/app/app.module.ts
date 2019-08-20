import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCheckboxModule, MatDialogModule, MatTooltipModule } from '@angular/material';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';

//Components
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SuiteComponent } from './components/suite/suite.component';
import { TestCardComponent } from './components/test-card/test-card.component';
import { TestCardFieldComponent } from './components/test-card-field/test-card-field.component';
import { QueueComponent } from './components/queue/queue.component';
import { HistoryComponent } from './components/history/history.component';
import { DataComponent } from './components/data/data.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { HistoryListComponent } from './components/history-list/history-list.component';

//Modals
import { ContinueModalComponent } from './components/modals/continue-modal/continue-modal.component';
import { AddTestComponent } from './components/modals/add-test/add-test.component';
import { SaveBuildComponent } from './components/modals/save-build/save-build.component';

//Services
import { SuiteService } from './services/suite.service';
import { LoadingSpinnerService } from './services/loading-spinner.service';
import { AuthGuard } from './services/auth-guard';

//Interceptors
import { LoadingSpinnerInterceptor } from './services/loading-spinner.interceptor';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    DashboardComponent,
    SuiteComponent,
    TestCardComponent,
    QueueComponent,
    HistoryComponent,
    DataComponent,
    LoadingSpinnerComponent,
    TestCardFieldComponent,
    ContinueModalComponent,
    AddTestComponent,
    SaveBuildComponent,
    HistoryListComponent,
    AccessDeniedComponent,
  ],
  entryComponents: [
    ContinueModalComponent,
    AddTestComponent,
    SaveBuildComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    BrowserAnimationsModule,
    MatButtonModule, 
    MatCheckboxModule,
    MatDialogModule,
    MatTooltipModule,
    DragDropModule,
    VirtualScrollerModule
  ],
  providers: [
    SuiteService,
    LoadingSpinnerService,
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: LoadingSpinnerInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
