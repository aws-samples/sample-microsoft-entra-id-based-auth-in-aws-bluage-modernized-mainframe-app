import { Component } from '@angular/core';
import { Window } from "./../commonMap/window";

@Component({
    moduleId: module.id,
    selector: 'end-message',
    templateUrl: './end-message.component.html'
})
export class EndMessageSubComponent extends Window {
    messageline: any = {};
    
    public FIELDS: string[] = ['messageline']
}
