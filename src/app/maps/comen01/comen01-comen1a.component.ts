import { Component } from '@angular/core';
import { Overlay } from "./../commonMap/overlay";

@Component({
    moduleId: module.id,
    selector: 'comen01-comen1a',
    templateUrl: './comen01-comen1a.component.html'
})
export class Comen01Comen1aComponent extends Overlay {
    trnname: any = {};
    title01: any = {};
    curdate: any = {'value': 'mm\/dd\/yy'};
    pgmname: any = {};
    title02: any = {};
    curtime: any = {'value': 'hh:mm:ss'};
    optn001: any = {};
    optn002: any = {};
    optn003: any = {};
    optn004: any = {};
    optn005: any = {};
    optn006: any = {};
    optn007: any = {};
    optn008: any = {};
    optn009: any = {};
    optn010: any = {};
    optn011: any = {};
    optn012: any = {};
    option: any = {};
    errmsg: any = {};

    public FIELDS: string[] = ['trnname', 'title01', 'curdate', 'pgmname', 'title02', 'curtime', 'optn001', 'optn002', 'optn003', 'optn004', 'optn005', 'optn006', 'optn007', 'optn008', 'optn009', 'optn010', 'optn011', 'optn012', 'option', 'errmsg'];
    public LINES: number[] = [1, 2, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 20, 23, 24];

    ngAfterViewInit(): void {
    }
}
