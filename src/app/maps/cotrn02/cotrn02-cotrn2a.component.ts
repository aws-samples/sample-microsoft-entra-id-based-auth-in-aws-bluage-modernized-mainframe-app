import { Component } from '@angular/core';
import { Overlay } from "./../commonMap/overlay";

@Component({
    moduleId: module.id,
    selector: 'cotrn02-cotrn2a',
    templateUrl: './cotrn02-cotrn2a.component.html'
})
export class Cotrn02Cotrn2aComponent extends Overlay {
    trnname: any = {};
    title01: any = {};
    curdate: any = {'value': 'mm\/dd\/yy'};
    pgmname: any = {};
    title02: any = {};
    curtime: any = {'value': 'hh:mm:ss'};
    actidin: any = {};
    cardnin: any = {};
    ttypcd: any = {};
    tcatcd: any = {};
    trnsrc: any = {};
    tdesc: any = {};
    trnamt: any = {};
    torigdt: any = {};
    tprocdt: any = {};
    mid: any = {};
    mname: any = {};
    mcity: any = {};
    mzip: any = {};
    confirm: any = {};
    errmsg: any = {};

    public FIELDS: string[] = ['trnname', 'title01', 'curdate', 'pgmname', 'title02', 'curtime', 'actidin', 'cardnin', 'ttypcd', 'tcatcd', 'trnsrc', 'tdesc', 'trnamt', 'torigdt', 'tprocdt', 'mid', 'mname', 'mcity', 'mzip', 'confirm', 'errmsg'];
    public LINES: number[] = [1, 2, 4, 6, 8, 10, 12, 14, 15, 16, 18, 21, 23, 24];

    ngAfterViewInit(): void {
    }
}
