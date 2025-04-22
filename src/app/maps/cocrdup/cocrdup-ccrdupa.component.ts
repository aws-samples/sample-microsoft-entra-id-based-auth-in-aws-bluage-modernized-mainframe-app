import { Component } from '@angular/core';
import { Overlay } from "./../commonMap/overlay";

@Component({
    moduleId: module.id,
    selector: 'cocrdup-ccrdupa',
    templateUrl: './cocrdup-ccrdupa.component.html'
})
export class CocrdupCcrdupaComponent extends Overlay {
    trnname: any = {};
    title01: any = {};
    curdate: any = {'value': 'mm\/dd\/yy'};
    pgmname: any = {};
    title02: any = {};
    curtime: any = {'value': 'hh:mm:ss'};
    acctsid: any = {};
    cardsid: any = {};
    crdname: any = {};
    crdstcd: any = {};
    expmon: any = {};
    expyear: any = {};
    expday: any = {};
    infomsg: any = {};
    errmsg: any = {};
    fkeys: any = {'value': 'ENTER=Process F3=Exit'};
    fkeysc: any = {'value': 'F5=Save F12=Cancel'};

    public FIELDS: string[] = ['trnname', 'title01', 'curdate', 'pgmname', 'title02', 'curtime', 'acctsid', 'cardsid', 'crdname', 'crdstcd', 'expmon', 'expyear', 'expday', 'infomsg', 'errmsg', 'fkeys', 'fkeysc'];
    public LINES: number[] = [1, 2, 4, 20, 7, 23, 8, 24, 11, 13, 15];

    ngAfterViewInit(): void {
    }
}
