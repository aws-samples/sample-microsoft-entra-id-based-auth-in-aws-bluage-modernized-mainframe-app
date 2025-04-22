import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransactionDirective } from './term.directive';

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        TransactionDirective,
    ],
    exports: [
        TransactionDirective,
    ]
})
export class TermCommonModule { }
