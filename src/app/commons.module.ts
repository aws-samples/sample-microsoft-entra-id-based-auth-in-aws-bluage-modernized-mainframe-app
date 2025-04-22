import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';


@NgModule({
    imports: [
		CommonModule,
        FormsModule,
        NgxMaskDirective, 
        NgxMaskPipe
	],

    exports: [
        CommonModule,
        FormsModule,
        NgxMaskDirective, 
        NgxMaskPipe
    ]
})
export class CommonsModule { }
