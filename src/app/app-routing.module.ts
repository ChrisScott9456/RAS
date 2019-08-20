import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//Components
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SuiteComponent } from './components/suite/suite.component';
import { QueueComponent } from './components/queue/queue.component';
import { HistoryComponent } from './components/history/history.component';
import { DataComponent } from './components/data/data.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';

//Router Guard
import { AuthGuard } from './services/auth-guard';

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'suite', component: SuiteComponent, canActivate: [AuthGuard] },
  { path: 'queue', component: QueueComponent, canActivate: [AuthGuard] },
  { path: 'history', component: HistoryComponent, canActivate: [AuthGuard] },
  { path: 'stats', component: DataComponent, canActivate: [AuthGuard] },
  { path: 'accessdenied', component: AccessDeniedComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '', canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
