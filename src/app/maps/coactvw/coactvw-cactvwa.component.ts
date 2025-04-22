import { Component } from '@angular/core';
import { Overlay } from "./../commonMap/overlay";

@Component({
    moduleId: module.id,
    selector: 'coactvw-cactvwa',
    templateUrl: './coactvw-cactvwa.component.html'
})
export class CoactvwCactvwaComponent extends Overlay {
    trnname: any = {};
    title01: any = {};
    curdate: any = {'value': 'mm\/dd\/yy'};
    pgmname: any = {};
    title02: any = {};
    curtime: any = {'value': 'hh:mm:ss'};
    acctsid: any = {};
    acsttus: any = {};
    adtopen: any = {};
    acrdlim: any = {};
    aexpdt: any = {};
    acshlim: any = {};
    areisdt: any = {};
    acurbal: any = {};
    acrcycr: any = {};
    aaddgrp: any = {};
    acrcydb: any = {};
    acstnum: any = {};
    acstssn: any = {};
    acstdob: any = {};
    acstfco: any = {};
    acsfnam: any = {};
    acsmnam: any = {};
    acslnam: any = {};
    acsadl1: any = {};
    acsstte: any = {};
    acsadl2: any = {};
    acszipc: any = {};
    acscity: any = {};
    acsctry: any = {};
    acsphn1: any = {};
    acsgovt: any = {};
    acsphn2: any = {};
    acseftc: any = {};
    acspflg: any = {};
    infomsg: any = {};
    errmsg: any = {};

    public FIELDS: string[] = ['trnname', 'title01', 'curdate', 'pgmname', 'title02', 'curtime', 'acctsid', 'acsttus', 'adtopen', 'acrdlim', 'aexpdt', 'acshlim', 'areisdt', 'acurbal', 'acrcycr', 'aaddgrp', 'acrcydb', 'acstnum', 'acstssn', 'acstdob', 'acstfco', 'acsfnam', 'acsmnam', 'acslnam', 'acsadl1', 'acsstte', 'acsadl2', 'acszipc', 'acscity', 'acsctry', 'acsphn1', 'acsgovt', 'acsphn2', 'acseftc', 'acspflg', 'infomsg', 'errmsg'];
    public LINES: number[] = [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24];

    ngAfterViewInit(): void {
    }
}
