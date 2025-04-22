import { Component } from '@angular/core';
import { Overlay } from "./../commonMap/overlay";

@Component({
    moduleId: module.id,
    selector: 'cocrdsl-ccrdsla',
    templateUrl: './cocrdsl-ccrdsla.component.html'
})
export class CocrdslCcrdslaComponent extends Overlay {
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
    infomsg: any = {};
    errmsg: any = {};
    fkeys: any = {'value': 'ENTER=Search Cards  F3=Exit'};

    public FIELDS: string[] = ['trnname', 'title01', 'curdate', 'pgmname', 'title02', 'curtime', 'acctsid', 'cardsid', 'crdname', 'crdstcd', 'expmon', 'expyear', 'infomsg', 'errmsg', 'fkeys'];
    public LINES: number[] = [1, 2, 4, 20, 7, 23, 8, 24, 11, 13, 15];

    ngAfterViewInit(): void {
    }
}
