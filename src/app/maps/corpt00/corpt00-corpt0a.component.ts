import { Component } from '@angular/core';
import { Overlay } from "./../commonMap/overlay";

@Component({
    moduleId: module.id,
    selector: 'corpt00-corpt0a',
    templateUrl: './corpt00-corpt0a.component.html'
})
export class Corpt00Corpt0aComponent extends Overlay {
    trnname: any = {};
    title01: any = {};
    curdate: any = {'value': 'mm\/dd\/yy'};
    pgmname: any = {};
    title02: any = {};
    curtime: any = {'value': 'hh:mm:ss'};
    monthly: any = {};
    yearly: any = {};
    custom: any = {};
    sdtmm: any = {};
    sdtdd: any = {};
    sdtyyyy: any = {};
    edtmm: any = {};
    edtdd: any = {};
    edtyyyy: any = {};
    confirm: any = {};
    errmsg: any = {};

    public FIELDS: string[] = ['trnname', 'title01', 'curdate', 'pgmname', 'title02', 'curtime', 'monthly', 'yearly', 'custom', 'sdtmm', 'sdtdd', 'sdtyyyy', 'edtmm', 'edtdd', 'edtyyyy', 'confirm', 'errmsg'];
    public LINES: number[] = [1, 2, 19, 4, 7, 23, 24, 9, 11, 13, 14];

    ngAfterViewInit(): void {
    }
}
