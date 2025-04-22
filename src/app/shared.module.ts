import { NgModule } from '@angular/core';

import { CommonsModule } from './commons.module'
// Provided to dynamically loaded components
import { DynamicFieldModule } from './dynamic-field/dynamic-field.module';
import { TermModule } from './term/term.module';
import { TableModule } from './table/table.module';
import { ModalModule } from './modal.component';
import { LineOverlayDirective } from "./shared/directives/line-overlay.directive";

@NgModule({
    imports: [
        CommonsModule,
		DynamicFieldModule,
        TableModule,
        TermModule,
        ModalModule
	],

    declarations: [
        LineOverlayDirective
    ],

    exports: [
        CommonsModule,
        DynamicFieldModule,
        TableModule,
        TermModule,
        ModalModule,
        LineOverlayDirective
    ]
})
export class SharedModule { }
