import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { MsalGuard } from '@azure/msal-angular';
import { TransactionRunnerComponent } from './transaction-runner.component';
import { TermComponent } from './term.component';
import { UserInfoComponent } from './user-info.component';
import { environment } from 'environments/environment'

const guards: any[] = environment.enableAuthentication ? [MsalGuard] : [];

const routes: Routes = [
    { path: '', redirectTo: '/transaction-runner', pathMatch: 'full' },
    { path: 'transaction-runner', component: TransactionRunnerComponent, canActivate:guards },
    { path: 'user-info', component: UserInfoComponent, canActivate:guards },
    { path: 'term/:transid/:commarea', component: TermComponent, canActivate:guards },
	{ path: 'code', component: TransactionRunnerComponent  }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash:true, initialNavigation: 'enabledNonBlocking'})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
