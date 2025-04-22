import { Component, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { CustomDynamicFieldComponent } from '../custom-dynamic-field.component';

@Component({
    moduleId: module.id,
    selector: 'dynamic-select',
    template: `
		<select [id]="id" [ngClass]="styleClass" [(ngModel)]="value">
			<option *ngFor="let option of options" [ngValue]="option.value">{{ option.label }}</option>
		</select>
	`,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: DynamicSelectComponent,
			multi: true
		},
	],

})
export class DynamicSelectComponent extends CustomDynamicFieldComponent {
	/* FIELDS ============================================================== */
	@Input() id: string; // inherited
	@Input() size: number; // inherited

	@Input() styleClass: any;
	@Input() options: { label: string, value: string }[] = [];

    /* CONSTRUCTORS ======================================================== */
    constructor() {
    	super();
	}
}
