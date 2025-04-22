import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfigurationMessage } from '../configuration-message.module';
import { UserInfo, UserInfoResponse } from './user-info';

@Injectable()
export class UserInfoService {

    /** URL to web api */
    private getUserInfoUrl: string;
    private setUserInfoUrl: string;

    /** The global configuration */
    public configuration: AppConfigurationMessage;

    constructor(private http: HttpClient) {
    }

    /** Called during application initialization (V7-179) */
    public configure(configuration: AppConfigurationMessage) {

        this.configuration = configuration;

        if (this.configuration.backendURL === undefined) {
            throw new Error('Server did not provide us with backend URL, cannot initialize: ' + configuration);
        }

        let url: string = this.configuration.backendURL;
        if (!url.endsWith('/')) {
            url += '/';
        }

        this.getUserInfoUrl = url + 'getuserinfo';
        this.setUserInfoUrl = url + 'setuserinfo';
        console.log('UserInfoService initialized with URLs ' + this.setUserInfoUrl+' ; '+this.getUserInfoUrl);
    }

    getUserInfo (): Promise<UserInfo> {
        const url = `${this.getUserInfoUrl}`;
        // Use a POST to be able to send JSON message to the server
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type':  'application/json'
            })
          };
        return this.http.get(url, httpOptions)
            .toPromise();
    }

    setUserInfo (userInfo: UserInfo): Promise<any> {
        const url = `${this.setUserInfoUrl}`;
        // Use a POST to be able to send JSON message to the server
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type':  'application/json'
            })
          };
        return this.http.post(url, userInfo, httpOptions)
            .toPromise();
    }

}
