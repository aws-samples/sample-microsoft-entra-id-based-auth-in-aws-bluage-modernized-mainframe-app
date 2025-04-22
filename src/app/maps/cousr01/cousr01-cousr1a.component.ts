import { Component } from '@angular/core';
import { Overlay } from "./../commonMap/overlay";

@Component({
    moduleId: module.id,
    selector: 'cousr01-cousr1a',
    templateUrl: './cousr01-cousr1a.component.html'
})
export class Cousr01Cousr1aComponent extends Overlay {
    trnname: any = {};
    title01: any = {};
    curdate: any = {'value': 'mm\/dd\/yy'};
    pgmname: any = {};
    title02: any = {};
    curtime: any = {'value': 'hh:mm:ss'};
    fname: any = {};
    lname: any = {};
    userid: any = {};
    passwd: any = {};
    usrtype: any = {};
    errmsg: any = {};

    public FIELDS: string[] = ['trnname', 'title01', 'curdate', 'pgmname', 'title02', 'curtime', 'fname', 'lname', 'userid', 'passwd', 'usrtype', 'errmsg'];
    public LINES: number[] = [1, 2, 4, 23, 8, 24, 11, 14];

    ngAfterViewInit(): void {
    }
}
