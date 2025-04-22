import { Component } from '@angular/core';
import { Overlay } from "./../commonMap/overlay";

@Component({
    moduleId: module.id,
    selector: 'cousr02-cousr2a',
    templateUrl: './cousr02-cousr2a.component.html'
})
export class Cousr02Cousr2aComponent extends Overlay {
    trnname: any = {};
    title01: any = {};
    curdate: any = {'value': 'mm\/dd\/yy'};
    pgmname: any = {};
    title02: any = {};
    curtime: any = {'value': 'hh:mm:ss'};
    usridin: any = {};
    fname: any = {};
    lname: any = {};
    passwd: any = {};
    usrtype: any = {};
    errmsg: any = {};

    public FIELDS: string[] = ['trnname', 'title01', 'curdate', 'pgmname', 'title02', 'curtime', 'usridin', 'fname', 'lname', 'passwd', 'usrtype', 'errmsg'];
    public LINES: number[] = [1, 2, 4, 6, 23, 8, 24, 11, 13, 15];

    ngAfterViewInit(): void {
    }
}
