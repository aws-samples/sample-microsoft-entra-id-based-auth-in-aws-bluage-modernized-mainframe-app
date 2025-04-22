import { Input, OnInit , Directive, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

import { MaskFieldComponent } from './mask-field-component';
import { Attributes } from '../term/message';
import { Data } from '../term/term.model';
import { ConfigService } from 'app/config-service';

/**
 * Class to extends for dynamic-field implementations.
 */
@Directive()
export abstract class DynamicFieldComponent extends MaskFieldComponent implements OnInit, ControlValueAccessor {
	/* FIELDS ============================================================== */
	private _data: Data;
	private _defaultValue: string;

	public cursorClass: string;
	protected _insertMode = false;

	private configServiceInternal: ConfigService;
	
	mask: string;
	underline: boolean;
	allowLC: boolean;
	
	@Input() id: string;
	@Input() size: number = 0;
	@Input() styleClass: string;
	@Input() line: number;
	@Input() column: number;
	@Output() completeEvent = new EventEmitter();
	
	private _changed = new Array<( data: any ) => void>();
	private _touched = new Array<() => void>();

	/* METHODS ============================================================= */
	ngOnInit(): void {
		document.querySelector<HTMLElement>(':root').style.setProperty('caret-color', 'transparent');
		this.computeCursorClass();
		this._data = this._initData();
		this._defaultValue = '';
		while (this._defaultValue.length < this.size) {
			this._defaultValue += ' ';
		}
	}

	/* Value --------------------------------------------------------------- */
	protected get defaultValue(): string {
		return this._defaultValue;
	}

	protected _formatValue( value: string = null ): string {
		// Format value
		value = value || this.data.value;
		if (value.length < this.size) {
			value += this._defaultValue.substring(value.length);
			this.data.value = value;
		}
		return value;
	}

	/* Data ---------------------------------------------------------------- */
	get data(): Data {
		return this._data;
	}

	set data( data: Data ) {
		data = this._initData(data);
		if( this._data !== data ) {
			//Retain the unique ID upon data object update.
			data.uniqueId = this._data.uniqueId;
			this._data = data;
			this.changed();
			this.touch();
		}
	}

	private _initData( data: Data = null ): Data {
		// Build default
		let defaultData = new Data( this._defaultValue );
		if (!data) {
			return defaultData;
		}

		// Update data
		let consultMode = data.attributes && (data.attributes.protection === 'PROT' || data.attributes.protection === 'ASKIP')
		if( !consultMode ) {
			data.value = data.value ? this._formatValue(data.value) : defaultData.value;
		}
		return data;
	}
	
	/* CURSOR */
	protected changeCursorMode(){
		this.computeCursorClass();
	}

	private computeCursorClass() {
		if(this.configServiceInternal && this.configServiceInternal.terminalConfig && this.configServiceInternal.terminalConfig.style.insertCursor){
			this.cursorClass = this._insertMode ? 'cursor-' + this.configServiceInternal.terminalConfig.style.insertCursor.toLowerCase() 
			: 'cursor-' + this.configServiceInternal.terminalConfig.style.overwriteCursor.toLowerCase(); 
		}
	}

	protected setConfigService(configService: ConfigService){
		this.configServiceInternal = configService;
	}

	protected triggerComplete(){
		this.completeEvent.emit();
	}

	protected resetCursorAnimation(element: HTMLElement){
		element.style.animation = 'none';
		element.offsetHeight;
		element.style.animation = '';
	}

	/* ControlValueAccessor ------------------------------------------------ */
	changed(): void {
		this._changed.forEach( f => f( this._data ) );
	}

	touch(): void {
		this._touched.forEach( f => f() );
	}

	writeValue( data: any ) {
		this.data = data;
	}

	registerOnChange( fn: ( data: any ) => void ) {
		this._changed.push(fn);
	}

	registerOnTouched( fn: () => void ) {
		this._touched.push(fn);
	}
}