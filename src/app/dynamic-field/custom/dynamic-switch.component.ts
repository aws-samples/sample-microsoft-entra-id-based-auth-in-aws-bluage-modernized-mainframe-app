import { Component, Input, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { CustomDynamicFieldComponent } from '../custom-dynamic-field.component';

@Component({
    moduleId: module.id,
    selector: 'dynamic-switch',
    template: `
		<p-inputSwitch [id]="id" [(ngModel)]="checked" 
			(onChange)="onChange()"></p-inputSwitch>
	`,
	styles: [ `
		.ui-inputswitch { height: 28px; /* from .form-control */ font-weight: inherit; }
		.ui-inputswitch .ui-inputswitch-on, .ui-inputswitch .ui-inputswitch-off { padding-top: 3px; font-weight: normal; }
		.ui-inputswitch-on { background-color: #B81500 !important; }
	` ],
	encapsulation: ViewEncapsulation.None,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: DynamicSwitchComponent,
			multi: true
		},
	],

})
export class DynamicSwitchComponent extends CustomDynamicFieldComponent {
	/* FIELDS ============================================================== */
	checked: boolean;

	@Input() id: string; // inherited
	@Input() size: number; // inherited

	@Input() onLabel: string;
	@Input() onValue: any = true;
	@Input() offLabel: string;
	@Input() offValue: any = false;

    /* CONSTRUCTORS ======================================================== */
    constructor() {
    	super();
		this.registerOnChange( () => {
			this.checked = (this.value === this.onValue);
		} );
	}

    /* METHODS ============================================================= */
    /* Events -------------------------------------------------------------- */
    onChange() {
    	this.value = this.checked ? this.onValue : this.offValue;
	}
}
