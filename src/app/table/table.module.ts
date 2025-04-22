import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableComponent } from './table.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: [
        TableComponent
    ],
    exports: [
        CommonModule,
        FormsModule,
        TableComponent
    ]
})
export class TableModule { }
