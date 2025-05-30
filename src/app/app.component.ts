import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { AppService } from './app.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MSAL_GUARD_CONFIG, MsalBroadcastService, MsalGuardConfiguration, MsalService } from '@azure/msal-angular';
import { AuthenticationResult, InteractionStatus, InteractionType, PopupRequest, RedirectRequest } from '@azure/msal-browser';
import { filter, takeUntil } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Component({
    moduleId: module.id,
    selector: 'carddemo-l3-ready-web',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    loginDisplay = false;
    private readonly _destroying$ = new Subject<void>();
    isIframe: boolean;
    /* CONSTRUCTORS ======================================================== */
    constructor(
        private appService: AppService, /* necessary for provide appService */
        @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration, 
        private msalBroadcastService: MsalBroadcastService,
        private authService: MsalService
    ) {}

    ngOnInit():void {
		
		this.isIframe = window !== window.parent && !window.opener;

	    this.msalBroadcastService.inProgress$
	    .pipe(
	      filter((status: InteractionStatus) => status === InteractionStatus.None),
	      takeUntil(this._destroying$)
	    )
	    .subscribe(() => {
	      this.setLoginDisplay();
	    })
	  }

    setLoginDisplay() {
        this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
      }

login() {
  if (this.msalGuardConfig.interactionType == InteractionType.Popup){
      if (this.msalGuardConfig.authRequest){
          this.authService.loginPopup({...this.msalGuardConfig.authRequest} as PopupRequest)
              .subscribe((response: AuthenticationResult) => {
                  this.authService.instance.setActiveAccount(response.account);
          });
      } else {
          this.authService.loginPopup()
              .subscribe((response: AuthenticationResult) => {
                                  this.authService.instance.setActiveAccount(response.account);
      });
      }
      } else {
          if (this.msalGuardConfig.authRequest){
                this.authService.loginRedirect({...this.msalGuardConfig.authRequest} as RedirectRequest);
              } 
          else {
                  this.authService.loginRedirect();
                }
      }
}

logout() { 
  if (this.msalGuardConfig.interactionType == InteractionType.Popup){
      this.authService.logoutPopup({
          postLogoutRedirectUri: "/",
          mainWindowRedirectUri: "/"
      });
      } else {
          this.authService.logoutRedirect({
                    postLogoutRedirectUri: environment.postLogoutRedirectUri
                  });
      }
  }
  
  ngOnDestroy(): void {
     this._destroying$.next(undefined);
     this._destroying$.complete();
   }
  
}
