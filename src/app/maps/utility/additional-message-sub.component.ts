import { Component } from '@angular/core';
import { Window } from "../commonMap/window";
import { LanguageService } from './../../language/language-service';

@Component({
    moduleId: module.id,
    selector: 'additional-message',
    templateUrl: './additional-message.component.html'
})
export class AdditionalMessageSubComponent extends Window {
    messageId: any = {};
    messageline: any = {};
    secondMessageline: any = {};

    constructor(public languageService: LanguageService) {
        super();
    }

    public FIELDS: string[] = ['messageId', 'messageline', 'secondMessageline'];

}
