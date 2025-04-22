import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { UserInfo, UserInfoResponse } from './user-info/user-info';
import { UserInfoService } from './user-info/user-info.service';

@Component({
    moduleId: module.id,
    selector: 'user-info',
    templateUrl: './user-info.component.html',
    styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {
    
    userInfoInitialized:boolean = false;
    userInfo: UserInfo = new UserInfo ();
    userInfoResponse: UserInfoResponse = new UserInfoResponse ();
    userInfoSaved: UserInfo;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private location: Location,
        private userInfoService: UserInfoService
    ) { }

    ngOnInit(): void {
        this.getUserInfo();
    }

    goBack(): void {
        this.location.back();
    }
    
    getUserInfo(): void {
        this.userInfoService.getUserInfo()
            .then( (userInfo) => {
                this.userInfoInitialized = true;
                this.userInfo = userInfo;
                this.userInfoResponse.success = true;
                this.userInfoResponse.message = 'User info loaded!';
            })
            .catch( (error : any) => {
                console.error('An error occurred', error);
                this.userInfoResponse.success = false;
                this.userInfoResponse.message = error.message || error;
            });
    }

    saveUserInfo(): void {
        this.userInfoService.setUserInfo(this.userInfo)
            .then( (resp) => {
                this.userInfoResponse = resp;
                if (this.userInfoResponse.success) {
                    this.userInfoSaved = new UserInfo();
                    this.userInfoSaved.termId = this.userInfo.termId;
                    this.userInfoSaved.userId = this.userInfo.userId;
                    this.userInfoSaved.userName = this.userInfo.userName;
                    this.userInfoSaved.netName = this.userInfo.netName;
                    this.userInfoSaved.opId = this.userInfo.opId;
                }
            })
            .catch( (error : any) => {
                console.error('An error occurred', error);
                this.userInfoResponse = new UserInfoResponse ();
                this.userInfoResponse.success = false;
                this.userInfoResponse.message = error.message || error;
            });
    }

}