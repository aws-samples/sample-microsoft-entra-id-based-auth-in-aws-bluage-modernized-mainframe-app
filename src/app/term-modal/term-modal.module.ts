import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TermModalService } from './term-modal.service';
//import { TermModalCustomModule } from './custom/custom.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        //TermModalCustomModule,
    ],
    exports: [
        CommonModule,
        FormsModule,
        //TermModalCustomModule,
    ],
    providers: [
        [ TermModalService ],
    ]
})
export class TermModalModule { }
