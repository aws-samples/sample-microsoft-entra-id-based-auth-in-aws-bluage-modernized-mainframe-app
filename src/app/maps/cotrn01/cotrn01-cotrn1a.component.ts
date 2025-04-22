import { Component } from '@angular/core';
import { Overlay } from "./../commonMap/overlay";

@Component({
    moduleId: module.id,
    selector: 'cotrn01-cotrn1a',
    templateUrl: './cotrn01-cotrn1a.component.html'
})
export class Cotrn01Cotrn1aComponent extends Overlay {
    trnname: any = {};
    title01: any = {};
    curdate: any = {'value': 'mm\/dd\/yy'};
    pgmname: any = {};
    title02: any = {};
    curtime: any = {'value': 'hh:mm:ss'};
    trnidin: any = {};
    trnid: any = {};
    cardnum: any = {};
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
    errmsg: any = {};

    public FIELDS: string[] = ['trnname', 'title01', 'curdate', 'pgmname', 'title02', 'curtime', 'trnidin', 'trnid', 'cardnum', 'ttypcd', 'tcatcd', 'trnsrc', 'tdesc', 'trnamt', 'torigdt', 'tprocdt', 'mid', 'mname', 'mcity', 'mzip', 'errmsg'];
    public LINES: number[] = [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 23, 24];

    ngAfterViewInit(): void {
    }
}
