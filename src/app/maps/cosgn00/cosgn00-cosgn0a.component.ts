import { Component } from '@angular/core';
import { Overlay } from "./../commonMap/overlay";

@Component({
    moduleId: module.id,
    selector: 'cosgn00-cosgn0a',
    templateUrl: './cosgn00-cosgn0a.component.html'
})
export class Cosgn00Cosgn0aComponent extends Overlay {
    trnname: any = {};
    title01: any = {};
    curdate: any = {'value': 'mm\/dd\/yy'};
    pgmname: any = {};
    title02: any = {};
    curtime: any = {'value': 'Ahh:mm:ss'};
    applid: any = {};
    sysid: any = {};
    userid: any = {};
    passwd: any = {'value': '________'};
    errmsg: any = {};

    public FIELDS: string[] = ['trnname', 'title01', 'curdate', 'pgmname', 'title02', 'curtime', 'applid', 'sysid', 'userid', 'passwd', 'errmsg'];
    public LINES: number[] = [1, 2, 3, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 19, 20, 23, 24];

    ngAfterViewInit(): void {
    }
}
