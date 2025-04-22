import { Component } from '@angular/core';
import { Overlay } from "./../commonMap/overlay";

@Component({
    moduleId: module.id,
    selector: 'cocrdli-ccrdlia',
    templateUrl: './cocrdli-ccrdlia.component.html'
})
export class CocrdliCcrdliaComponent extends Overlay {
    trnname: any = {};
    title01: any = {};
    curdate: any = {'value': 'mm\/dd\/yy'};
    pgmname: any = {};
    title02: any = {};
    curtime: any = {'value': 'hh:mm:ss'};
    pageno: any = {};
    acctsid: any = {};
    cardsid: any = {};
    crdsel1: any = {};
    acctno1: any = {};
    crdnum1: any = {};
    crdsts1: any = {};
    crdsel2: any = {};
    crdstp2: any = {};
    acctno2: any = {};
    crdnum2: any = {};
    crdsts2: any = {};
    crdsel3: any = {};
    crdstp3: any = {};
    acctno3: any = {};
    crdnum3: any = {};
    crdsts3: any = {};
    crdsel4: any = {};
    crdstp4: any = {};
    acctno4: any = {};
    crdnum4: any = {};
    crdsts4: any = {};
    crdsel5: any = {};
    crdstp5: any = {};
    acctno5: any = {};
    crdnum5: any = {};
    crdsts5: any = {};
    crdsel6: any = {};
    crdstp6: any = {};
    acctno6: any = {};
    crdnum6: any = {};
    crdsts6: any = {};
    crdsel7: any = {};
    crdstp7: any = {};
    acctno7: any = {};
    crdnum7: any = {};
    crdsts7: any = {};
    infomsg: any = {};
    errmsg: any = {};

    public FIELDS: string[] = ['trnname', 'title01', 'curdate', 'pgmname', 'title02', 'curtime', 'pageno', 'acctsid', 'cardsid', 'crdsel1', 'acctno1', 'crdnum1', 'crdsts1', 'crdsel2', 'crdstp2', 'acctno2', 'crdnum2', 'crdsts2', 'crdsel3', 'crdstp3', 'acctno3', 'crdnum3', 'crdsts3', 'crdsel4', 'crdstp4', 'acctno4', 'crdnum4', 'crdsts4', 'crdsel5', 'crdstp5', 'acctno5', 'crdnum5', 'crdsts5', 'crdsel6', 'crdstp6', 'acctno6', 'crdnum6', 'crdsts6', 'crdsel7', 'crdstp7', 'acctno7', 'crdnum7', 'crdsts7', 'infomsg', 'errmsg'];
    public LINES: number[] = [1, 2, 4, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 20, 23, 24];

    ngAfterViewInit(): void {
    }
}
