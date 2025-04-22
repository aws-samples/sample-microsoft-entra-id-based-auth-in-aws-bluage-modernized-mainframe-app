import { NgModule, APP_INITIALIZER} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS  } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CommonsModule } from './commons.module'
import { AppComponent } from './app.component';
import { TransactionRunnerComponent } from './transaction-runner.component';
import { TermComponent } from './term.component';

import { AppRoutingModule } from './app-routing.module';
import { AppService } from './app.service';
import { ConfigService } from './config-service';
import { AppConfigurationMessage } from './configuration-message.module';

// Provided to dynamically loaded components
import { SharedModule } from './shared.module';
import { TermModule } from './term/term.module';
import { DynamicFieldModule } from './dynamic-field/dynamic-field.module';
import { TermModalModule } from './term-modal/term-modal.module';
import { TermService } from './term/term.service';
import { TestingService } from './term/testing.service';
import { TransactionService } from './term/transaction.service';
import { TableModule } from './table/table.module';
import { ModalModule } from './modal.component';
import { FormsModule } from '@angular/forms';
import { HelpService } from './help.service';

import { Cobil00Module } from './maps/cobil00';
import { CoactvwModule } from './maps/coactvw';
import { Coadm01Module } from './maps/coadm01';
import { CocrdliModule } from './maps/cocrdli';
import { Cousr00Module } from './maps/cousr00';
import { Cotrn02Module } from './maps/cotrn02';
import { Corpt00Module } from './maps/corpt00';
import { Comen01Module } from './maps/comen01';
import { CocrdupModule } from './maps/cocrdup';
import { Cousr02Module } from './maps/cousr02';
import { CocrdslModule } from './maps/cocrdsl';
import { Cotrn00Module } from './maps/cotrn00';
import { Cousr03Module } from './maps/cousr03';
import { Cotrn01Module } from './maps/cotrn01';
import { CoactupModule } from './maps/coactup';
import { Cosgn00Module } from './maps/cosgn00';
import { Cousr01Module } from './maps/cousr01';
import { UtilityModule } from './maps/utility';
import { UserInfoService } from './user-info/user-info.service';
import { UserInfoComponent } from './user-info.component';


import { MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalBroadcastService, MsalGuard, MsalGuardConfiguration, MsalInterceptor, MsalInterceptorConfiguration, MsalModule, MsalRedirectComponent, MsalService } from '@azure/msal-angular';
import { BrowserCacheLocation, IPublicClientApplication, InteractionType, LogLevel, PublicClientApplication } from '@azure/msal-browser';


import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { environment } from 'environments/environment';
import { LanguageService } from './language/language-service';

const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 ||
window.navigator.userAgent.indexOf('Trident/') > -1;

export function loggerCallback(logLevel : LogLevel, message : string) {
    console.log(message);
}

export function MSALInstanceFactory() : IPublicClientApplication {
    return new PublicClientApplication({
        auth: {
            clientId: environment.clientId,
            authority: environment.authority,
            redirectUri: environment.redirectUri
        },
        cache: {
            cacheLocation: BrowserCacheLocation.LocalStorage,
            storeAuthStateInCookie: isIE, //set to true for IE11
        },
        system: {
            loggerOptions: {
                loggerCallback,
                logLevel: LogLevel.Trace,
                piiLoggingEnabled: false
            }
        }
    })
}

//MSAL Interceptor is required to request access tokens in order to access the protected resource (Graph)

export function MSALInterceptorConfigFactory() : MsalInterceptorConfiguration {
    const protectedResourceMap = new Map<string, Array<string>>();
    //protectedResourceMap.set('https://graph.microsoft.com/v1.0/me',
    //['user.read']);
    protectedResourceMap.set(environment.apiUri, [environment.apiScope]);
    return {
        interactionType: InteractionType.Redirect,
        protectedResourceMap
    };
}

// MSAL Guard is required to protect routes and require authentication before accessing protected routes
export function MSALGuardConfigFactory() : MsalGuardConfiguration {
    return {
        interactionType: InteractionType.Redirect,
        authRequest: {
            scopes: [environment.apiScope]
        }
    };
}



/** Perform application configuration.
 * The application start will delay until the Promise is completed (avoid race conditions).
 * See https://github.com/angular/angular/issues/9047
  */
export function initializeApplication(http: HttpClient, 
    transactionService: TransactionService, userInfoService: UserInfoService, configService: ConfigService) {
    
    // Get backend URL
    return () => configService.configuration()
        .then((configuration: AppConfigurationMessage) => {
            transactionService.configure(configuration);
            userInfoService.configure(configuration);
            return true;
        });
}

@NgModule({
    imports: [
        MsalModule,
        CommonsModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,
        MatButtonModule,
        MatToolbarModule,
        MatListModule,
        MatTableModule,
        // Import the HTTP client. 
        HttpClientModule,
        MatProgressSpinnerModule,
        SharedModule,
        DynamicFieldModule,
        TableModule,
        TermModule,
        TermModalModule,
        ModalModule,
        Cobil00Module,
        CoactvwModule,
        Coadm01Module,
        CocrdliModule,
        Cousr00Module,
        Cotrn02Module,
        Corpt00Module,
        Comen01Module,
        CocrdupModule,
        Cousr02Module,
        CocrdslModule,
        Cotrn00Module,
        Cousr03Module,
        Cotrn01Module,
        CoactupModule,
        Cosgn00Module,
        Cousr01Module,
        UtilityModule
    ],
    declarations: [
        AppComponent,
        TermComponent,
        TransactionRunnerComponent,
        UserInfoComponent,
    ],
    bootstrap: [
        AppComponent,
        MsalRedirectComponent
    ],
    providers: [
        AppService,
        TermService,
        TransactionService,
        UserInfoService,
        ConfigService,
        LanguageService,
        HelpService,
        TestingService,
        {
            'provide': APP_INITIALIZER,
            'useFactory': initializeApplication,
            'deps': [HttpClient, TransactionService, UserInfoService, ConfigService, LanguageService],
            'multi': true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: MsalInterceptor,
            multi: true
        }
        ,
        {
            provide: MSAL_INSTANCE,
            useFactory: MSALInstanceFactory
           
        },
        {
            provide: MSAL_GUARD_CONFIG,
            useFactory: MSALGuardConfigFactory
            
        },
        {
            provide: MSAL_INTERCEPTOR_CONFIG,
            useFactory: MSALInterceptorConfigFactory
        },
        MsalGuard,
        MsalService,
        MsalBroadcastService
    ]
})
export class AppModule { }
