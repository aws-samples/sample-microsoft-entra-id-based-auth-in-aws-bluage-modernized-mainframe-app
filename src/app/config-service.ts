import { Injectable, isDevMode, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
//import * as config from '../assets/config.json';
import { AppConfigurationMessage, WebAppDetail, TerminalKind } from './configuration-message.module';
import { environment } from '../environments/environment';
import { Observable, of } from 'rxjs';

export interface TerminalConfig {
    emulatedTerminal: string;
    spinner: boolean;
    style: Style;
    widthMode: number;
    isDebugGrid: boolean;
    isInsertMode: boolean;
  }

export interface Style {
    overwriteCursor: string;
    insertCursor: string;
    defaultStyle: string;
    useOpenFont: boolean;
    templates: Template[];
}
  
export interface Template {
    name: string;
    displayName: string;
    elements: Element[];
}
  
export interface Element {
    key: string;
    value: string;
}
 
@Injectable()
export class ConfigService {

    private config: any;
	public terminalConfig: TerminalConfig;
	
    constructor(private location: Location, private http: HttpClient) {
    }

    private getConfig(): Promise<any> {
        if (!this.config) {
            let jsonFile = `config.json`;

            return this.http.get(jsonFile)
                .toPromise()
                .then((data) => {
                    this.config = data;
                    return this.config;
                }, (error) => console.log(error));
           
        }
        return Promise.resolve(this.config);
    }

    configuration(): Promise<AppConfigurationMessage> {
        let configuration : AppConfigurationMessage = {};
        return Promise.resolve(this.getConfig())
            .then((results: any) => {
				this.terminalConfig = results;
                configuration = results;

                if (!environment.production) {
                    // Port 4200 is used by the local development angular server
                    // configuration.useModernLegacyStyle = true;
                    configuration.backendURL = 'http://localhost:4200/gapwalk-application';
                    configuration.verbose = true;
                }

                configuration.useModernLegacyStyle = configuration.useModernLegacyStyle !== undefined && configuration.useModernLegacyStyle;
                if (configuration.webApp === undefined) {
                    let webAppDesc: WebAppDetail = {"name" : "WebApp","version" : "v0"}
                    configuration.webApp = webAppDesc;
                }
                
                // backendURL property is used to specify the URL to the "gapwalk-application" application
                // If not specified, it is inferred from the URL of the frontend server (this is the most common case)
                if (configuration.backendURL === undefined) {
                    let host = window.location.hostname;
                    let port = window.location.port;
                    configuration.backendURL = 'http://'+host+':'+port+'/gapwalk-application';
                }

                var is5250 : boolean;
                if (results.emulatedTerminal === undefined) {
                    // Older backend? Infer value (V7-3020)
                    is5250 = results.useCombinationsAttributes;
                } else {
                    is5250 = results.emulatedTerminal == '5250';
                }
                configuration.emulatedTerminal = is5250 ?  TerminalKind.Term5250 : TerminalKind.Term3270;

                if(results.style.useDefaultFont){
                    document.documentElement.style.setProperty('--font-family', 'Inconsolata');
                }
                
                return configuration;
            });
    }

    public getQDECFMT() : string{
        return this.config.QDECFMT;
    }

    public getLanguage() : string{
        return this.config.Language;
    }
    
    public getRegexDBCS(): string {
        return this.config.regexDBCS;
    }
}