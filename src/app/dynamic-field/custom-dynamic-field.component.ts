import { Input, Directive } from '@angular/core';

import { DynamicFieldComponent } from './dynamic-field.component';

/**
 * Class to extends for custom implementations.
 */
 @Directive()
export class CustomDynamicFieldComponent extends DynamicFieldComponent {
	/* FIELDS ============================================================== */
	@Input() id: string; // inherited
	@Input() size: number = 0; // inherited

	/* METHODS ============================================================= */
	public get value(): string {
		return this.data.value;
	}

	public set value( value: string ) {
		this.data.value = this._formatValue( value );
	}
}
