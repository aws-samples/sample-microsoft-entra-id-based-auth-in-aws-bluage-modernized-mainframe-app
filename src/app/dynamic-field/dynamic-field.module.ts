import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DynamicFieldCustomModule } from './custom/custom.module';

import { KeyEventDirective, MenuDirective } from './dynamic-field.directive';
import { DefaultDynamicFieldComponent } from './default-dynamic-field.component';
import { CommonsModule } from '../commons.module'

@NgModule({
    imports: [
        CommonsModule,
        DynamicFieldCustomModule
    ],
    declarations: [
        KeyEventDirective,
        MenuDirective,
        DefaultDynamicFieldComponent,
    ],
    exports: [
        CommonsModule,
        DynamicFieldCustomModule,
        KeyEventDirective,
        MenuDirective,
        DefaultDynamicFieldComponent,
    ]
})
export class DynamicFieldModule {}
