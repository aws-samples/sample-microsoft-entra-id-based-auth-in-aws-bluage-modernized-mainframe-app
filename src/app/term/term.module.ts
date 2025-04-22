import { NgModule } from '@angular/core';

import { TermService } from './term.service';
import { TransactionService } from './transaction.service';
import { TermCommonModule } from './common/common.module';

@NgModule({
    imports: [
        TermCommonModule
    ],
    exports: [
        TermCommonModule
    ],
    providers: [
    ],
})
export class TermModule { }
