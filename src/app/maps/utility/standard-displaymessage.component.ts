
import { Component } from '@angular/core';
import { Overlay } from "./../commonMap/overlay";
import { LanguageService } from './../../language/language-service';

@Component({
    moduleId: module.id,
    selector: 'standard-displaymessage',
    templateUrl: './standard-displaymessage.component.html'
})
export class StandardDisplayMessageComponent extends Overlay {
    
    message: any = {};
    response: any = {};
    userresp: any = {};
    isResponseEmpty : boolean = false;
    
    public FIELDS: string[] = ['message', 'response', 'userresp'];

    constructor(public languageService: LanguageService) {
        super();
    }

    ngOnInit() {
        this.isResponseEmpty = Object.keys(this.response).length === 0; 
    }
}
