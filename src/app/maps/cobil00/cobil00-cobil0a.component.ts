import { Component } from '@angular/core';
import { Overlay } from "./../commonMap/overlay";

@Component({
    moduleId: module.id,
    selector: 'cobil00-cobil0a',
    templateUrl: './cobil00-cobil0a.component.html'
})
export class Cobil00Cobil0aComponent extends Overlay {
    trnname: any = {};
    title01: any = {};
    curdate: any = {'value': 'mm\/dd\/yy'};
    pgmname: any = {};
    title02: any = {};
    curtime: any = {'value': 'hh:mm:ss'};
    actidin: any = {};
    curbal: any = {};
    confirm: any = {};
    errmsg: any = {};

    public FIELDS: string[] = ['trnname', 'title01', 'curdate', 'pgmname', 'title02', 'curtime', 'actidin', 'curbal', 'confirm', 'errmsg'];
    public LINES: number[] = [1, 2, 4, 6, 23, 8, 24, 11, 15];

    ngAfterViewInit(): void {
    }
}
