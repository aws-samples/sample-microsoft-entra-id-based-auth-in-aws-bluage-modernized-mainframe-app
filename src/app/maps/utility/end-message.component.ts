import { Component } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'end-message',
    template: '<modal-window name="end-message"></modal-window>'
})
export class EndMessageComponent {
    messageline: any = {};
    
    public FIELDS: string[] = ['messageline']
}
