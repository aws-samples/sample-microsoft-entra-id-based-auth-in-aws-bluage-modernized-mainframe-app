import { Component } from '@angular/core';
import { Overlay } from "./../commonMap/overlay";

@Component({
    moduleId: module.id,
    selector: 'cousr03-cousr3a',
    templateUrl: './cousr03-cousr3a.component.html'
})
export class Cousr03Cousr3aComponent extends Overlay {
    trnname: any = {};
    title01: any = {};
    curdate: any = {'value': 'mm\/dd\/yy'};
    pgmname: any = {};
    title02: any = {};
    curtime: any = {'value': 'hh:mm:ss'};
    usridin: any = {};
    fname: any = {};
    lname: any = {};
    usrtype: any = {};
    errmsg: any = {};

    public FIELDS: string[] = ['trnname', 'title01', 'curdate', 'pgmname', 'title02', 'curtime', 'usridin', 'fname', 'lname', 'usrtype', 'errmsg'];
    public LINES: number[] = [1, 2, 4, 6, 23, 8, 24, 11, 13, 15];

    ngAfterViewInit(): void {
    }
}
