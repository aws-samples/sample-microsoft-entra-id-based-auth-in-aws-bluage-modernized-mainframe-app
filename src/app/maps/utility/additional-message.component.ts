import { Component } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'additional-message',
    template: '<modal-window class="modal-window" name="additional-message"></modal-window>'
})
export class AdditionalMessageComponent {
    messageId: any = {};
    messageline: any = {};
    secondMessageline: any = {};

    public FIELDS: string[] = ['messageId', 'messageline', 'secondMessageline'];
}
