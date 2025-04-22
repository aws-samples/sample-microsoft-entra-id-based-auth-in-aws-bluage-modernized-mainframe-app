import { Component, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { CustomDynamicFieldComponent } from '../custom-dynamic-field.component';

@Component({
    moduleId: module.id,
    selector: 'dynamic-radio',
    template: `
        <ng-container *ngIf="mode == 'default'">
            <div class="radio" *ngFor="let option of options">
                <label>
                    <input type="radio" [attr.name]="id + '_radio'" [value]="option.value" />
                    {{ option.label }}
                </label>
            </div>
        </ng-container>
		<ng-container *ngIf="mode == 'inline'">
            <label class="radio-inline" *ngFor="let option of options">
                <input type="radio" [attr.name]="id + '_radio'" [value]="option.value" />
                    {{ option.label }}
            </label>
        </ng-container>
	`,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: DynamicRadioComponent,
			multi: true
		},
	],

})
export class DynamicRadioComponent extends CustomDynamicFieldComponent {
	/* FIELDS ============================================================== */
	@Input() id: string; // inherited
	@Input() size: number; // inherited

	@Input() mode: string = 'default';
	@Input() options: { label: string, value: string }[] = [];

    /* CONSTRUCTORS ======================================================== */
    constructor() {
    	super();
	}
}
