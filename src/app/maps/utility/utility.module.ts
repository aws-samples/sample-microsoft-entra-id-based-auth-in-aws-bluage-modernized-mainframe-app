import { NgModule } from '@angular/core';
import { EndMessageComponent } from './end-message.component';
import { EndMessageSubComponent } from './end-message-sub.component';
import { RawtextComponent } from './rawtext.component'
import { StandardMessageLineComponent } from './standard-messageline.component';
import { StandardArrayMessageLineComponent } from './standard-arraymessageline.component';
import { StandardDisplayMessageComponent } from './standard-displaymessage.component';
import { AdditionalMessageSubComponent } from './additional-message-sub.component';
import { AdditionalMessageComponent } from './additional-message.component';
import { SharedModule } from '../../shared.module';
import { HelpModalComponent } from './help-modal.component';
import { HelpModalSubComponent } from './help-modal-sub.component';

@NgModule({
    imports: [SharedModule],
    exports: [],
    declarations: [EndMessageComponent, EndMessageSubComponent, AdditionalMessageSubComponent, HelpModalSubComponent,
        RawtextComponent, StandardMessageLineComponent, StandardDisplayMessageComponent, AdditionalMessageComponent, HelpModalComponent,
        StandardArrayMessageLineComponent]
})
export class UtilityModule { }