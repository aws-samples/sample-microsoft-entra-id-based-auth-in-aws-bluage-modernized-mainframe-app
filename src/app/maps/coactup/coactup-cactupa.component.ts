import { Component } from '@angular/core';
import { Overlay } from "./../commonMap/overlay";

@Component({
    moduleId: module.id,
    selector: 'coactup-cactupa',
    templateUrl: './coactup-cactupa.component.html'
})
export class CoactupCactupaComponent extends Overlay {
    trnname: any = {};
    title01: any = {};
    curdate: any = {'value': 'mm\/dd\/yy'};
    pgmname: any = {};
    title02: any = {};
    curtime: any = {'value': 'hh:mm:ss'};
    acctsid: any = {};
    acsttus: any = {};
    opnyear: any = {};
    opnmon: any = {};
    opnday: any = {};
    acrdlim: any = {};
    expyear: any = {};
    expmon: any = {};
    expday: any = {};
    acshlim: any = {};
    risyear: any = {};
    rismon: any = {};
    risday: any = {};
    acurbal: any = {};
    acrcycr: any = {};
    aaddgrp: any = {};
    acrcydb: any = {};
    acstnum: any = {};
    actssn1: any = {'value': '999'};
    actssn2: any = {'value': '99'};
    actssn3: any = {'value': '9999'};
    dobyear: any = {};
    dobmon: any = {};
    dobday: any = {};
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
    acsph1a: any = {};
    acsph1b: any = {};
    acsph1c: any = {};
    acsgovt: any = {};
    acsph2a: any = {};
    acsph2b: any = {};
    acsph2c: any = {};
    acseftc: any = {};
    acspflg: any = {};
    infomsg: any = {};
    errmsg: any = {};
    fkeys: any = {'value': 'ENTER=Process F3=Exit'};
    fkey05: any = {'value': 'F5=Save'};
    fkey12: any = {'value': 'F12=Cancel'};

    public FIELDS: string[] = ['trnname', 'title01', 'curdate', 'pgmname', 'title02', 'curtime', 'acctsid', 'acsttus', 'opnyear', 'opnmon', 'opnday', 'acrdlim', 'expyear', 'expmon', 'expday', 'acshlim', 'risyear', 'rismon', 'risday', 'acurbal', 'acrcycr', 'aaddgrp', 'acrcydb', 'acstnum', 'actssn1', 'actssn2', 'actssn3', 'dobyear', 'dobmon', 'dobday', 'acstfco', 'acsfnam', 'acsmnam', 'acslnam', 'acsadl1', 'acsstte', 'acsadl2', 'acszipc', 'acscity', 'acsctry', 'acsph1a', 'acsph1b', 'acsph1c', 'acsgovt', 'acsph2a', 'acsph2b', 'acsph2c', 'acseftc', 'acspflg', 'infomsg', 'errmsg', 'fkeys', 'fkey05', 'fkey12'];
    public LINES: number[] = [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24];

    ngAfterViewInit(): void {
    }
}
