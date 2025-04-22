
import { Component, Input, ViewChild } from '@angular/core';
import { Overlay } from "./../commonMap/overlay";

@Component({
    moduleId: module.id,
    selector: 'standard-messageline',
    templateUrl: './standard-messageline.component.html'
})
export class StandardMessageLineComponent extends Overlay {
    @Input() arraymessageline: any;

    messageId: any = {};
    messageline: any = {};
    secondMessageline: any = {};

    ngAfterContentChecked(): void {
        if (this.arraymessageline != undefined) {
            this.messageId = this.arraymessageline.messageId;
            this.messageline = this.arraymessageline.messageline;
            this.secondMessageline = this.arraymessageline.secondMessageline;
        }
    }

    public FIELDS: string[] = ['messageId', 'messageline', 'secondMessageline']
}