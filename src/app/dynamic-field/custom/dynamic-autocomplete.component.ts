import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';


import { CustomDynamicFieldComponent } from '../custom-dynamic-field.component';
import { Attributes } from '../../term/message';
import { ConfigService } from 'app/config-service';
import { TransactionService } from 'app/term/transaction.service';
import { AppService } from 'app/app.service';

const enum Action {
	Insert = 1,
	Suppress,
	Delete,
	Copy
}

function isDefinedAndDifferentOf(value: string, notExpected: string) {
	return value && (value !== notExpected);
}

export interface Option {
	label: string;
	value : string;
}
@Component({
    moduleId: module.id,
    selector: 'dynamic-autocomplete',
    template: `
	<div class="relative-pos" tabindex="-1" (click)="onClickDiv($event)">
		<input #input [disabled]="data.disabled" [readonly]="data.protected"
			[attr.id]="id" [attr.name]="id" type={{inputType}} [attr.size]="size" [attr.maxlength]="size"
			[attr.mask]="mask" [attr.underline]="underline" 
			[style.width]="computeWidth()" [class]="styleClass" [ngClass]="computeClasses()"
			[(ngModel)]="data.value" 
			(keydown)="onKeyDown($event)" (keypress)="onKeyPress($event)"
			(paste)="onPaste($event)"
			(focus)="onFocus($event)" (blur)="onBlur()" [matAutocomplete]="auto"/>
		<input #inputcursor *ngIf="!data.disabled && !data.protected && isFocused()" [style.width]="computeWidth()" 
			[attr.size]="size" [attr.maxlength]="size" [class]="styleClass" [ngClass]="computeClasses()" class="absolute-pos-cursor" [class]="cursorClass"
			type={{inputType}} readonly tabindex="-1">
		<mat-autocomplete #auto="matAutocomplete">
			<mat-option *ngFor="let option of filteredOptions" [value]="option.value" (click)="onOptionClick($event)">
				{{option.label}}
			</mat-option>
		</mat-autocomplete>
	</div>	
	`,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: DynamicAutoCompleteComponent,
			multi: true
		},
	],

})


export class DynamicAutoCompleteComponent extends CustomDynamicFieldComponent {
	/* FIELDS ============================================================== */
	private _input: HTMLInputElement;
	private parentDiv;

	private _focused = false;
	
	private _cursorStart = 0;
	private _cursorEnd = 0;

	filteredOptions: Option[];

	@Input() id: string; // inherited
	@Input() size: number = 0; // inherited
	@Input() styleClass: string;
	@Input() inputType: string = 'text';
	@Input() isLCAllowed: boolean = false;
	@Input() focused: Boolean;
	@Input() line: number;
	@Input() column: number;

	@Input() options: Option[];

	@ViewChild('input', {static: true}) inputRef: ElementRef;
	@ViewChild('input', {static: true, read: MatAutocompleteTrigger}) triggerRef: MatAutocompleteTrigger;
	@ViewChild('inputcursor', {static: false}) inputCursor: ElementRef;

    /* CONSTRUCTORS ======================================================== */
    constructor(private appService: AppService, private transactionService: TransactionService, private elRef: ElementRef, private configService: ConfigService) {
		super();
		this.setConfigService(configService);
		this.registerOnChange(() => {
			this.computeAttributes();
			this.computeFocus();
		});
		// Parent div element (typically contains lgr_ / lgo_ classes)
		if(elRef.nativeElement.parentElement != null && elRef.nativeElement.parentElement.tagName == 'DIV'){
			this.parentDiv = elRef.nativeElement.parentElement;
		}
		this._insertMode = appService.insertMode;
		appService.registerOnInsertModeChange((insertMode) => {
			this._insertMode = insertMode;
			this.changeCursorMode();
		});		
		this.changeCursorMode();
	}

	ngOnInit() {
		super.ngOnInit();
		this._input = this.inputRef.nativeElement;
		this.updateFiltered();

	}

	private updateFiltered() {
		this.filteredOptions = this._filter();
	}

	private _filter(): Option[] {
		let filterVal = '';
		if (this.data.value) {
			filterVal = this.data.value.trim().toLowerCase();
		}
		return this.options.filter(option => option.label.toLowerCase().includes(filterVal));
	}

	/* Compute ------------------------------------------------------------- */
	computeWidth(): string {
		// Needed since the "size"" attribute of input is not precise enough
		return this.computeFontWidth(this._input) * this.size + 'px';
	}

	private computeFontWidth(element: any): number {
		if (window['CACHED_FONT_WIDTH'] === undefined) {
			// Compute and cache font width, using an hidden canvas
			var st: CSSStyleDeclaration = window.getComputedStyle(element);

			// For firefox compatibility: do not use the "font" shorthand property of CSSStyleDeclaration
			var font: string = st.fontStyle + ' ' + st.fontVariant + ' ' + st.fontWeight + ' ' + st.fontSize + '/' + st.lineHeight + ' ' + st.fontFamily;

			var canvas = document.createElement('canvas');
			var context: CanvasRenderingContext2D = canvas.getContext('2d');
			context.font = font;
			window['CACHED_FONT_WIDTH'] = Math.ceil(context.measureText('W').width)
		}

		return window['CACHED_FONT_WIDTH'];
	}

	computeClasses(): string[] {
		// Decode attributes
		let attributes: Attributes = this.data.attributes;
		if (!attributes) {
			// May happen due to SEND TEXT
			return;
		}
		
		// Determinate classes
		let classes = [];
		if (isDefinedAndDifferentOf(attributes.intensity, 'NORM')) {
			classes.push(attributes.intensity.toLowerCase());
		}
		if (attributes.color !== undefined) {
			classes.push(attributes.color.toLowerCase());
		}
		if (isDefinedAndDifferentOf(attributes.highlight, 'OFF')) {
			classes.push(attributes.highlight.toLowerCase());
		}
		if (attributes.charsetMode !== undefined) {
			classes.push(attributes.charsetMode.toLowerCase());
		}

		// Add hidden class to parent div if needed
		if(this.parentDiv) {
			if (classes.indexOf('hidden') >= 0) {
				this.parentDiv.classList.add('hidden');
			} else {
				this.parentDiv.classList.remove('hidden');
			}
		}

		return classes;
	}

	private computeAttributes() {
		// Decode attributes
		let attributes: Attributes = this.data.attributes;
		if (!attributes) {
			// May happen due to SEND TEXT
			return;
		}
		
		if(attributes !== undefined && attributes !== null 
			&& this.inputType !== undefined && this.inputType === 'password'){
			attributes.isPassword = true;
		}
		
		if (attributes.isPassword) {
			this.inputType = 'password'
		}

		// Determinate classes
		this.computeClasses();

		if (attributes.mask !== undefined) {
			this.mask = attributes.mask;
			this.formatValueWithMask();
		}
		
		if (attributes.underline !== undefined) {
			this.underline = attributes.underline;
		}

		// Determinate consultation mode (readOnly)
		this.data.disabled =  attributes.protection === 'ASKIP';
		this.data.protected = attributes.protection === 'PROT';
	}

	private computeFocus() {
		if (this.focused !== null && this.focused) {
			this._input.focus();		
		} else if (this.data.initialCursor !== undefined && this.data.initialCursor) {
			this._input.focus();
			console.log('Focus set on field ' + this.id);
			this._updateCursor(0, 0, true);
		} else if (this.data.cursorLine !== undefined && this.data.cursorColumn !== undefined) {
			if (this.line == this.data.cursorLine && (this.column + 1) == this.data.cursorColumn) {
				this._input.focus();
			}
		}
	}

	/* Events -------------------------------------------------------------- */
	/* Focus */
	public onFocus(event: FocusEvent) {
		this.triggerEvent('input');
		this._focused = true;

		this.setPosition(this._input['_cursor'], this._input['_cursor']);
		this._cursorStart = this._cursorEnd = this._input['_cursor'];
		if (!this._cursorStart) {
			this.setPosition(0, 0);
		}
	
		this._updateCursor(0, 0);
	}

	public onBlur() {
		this.triggerEvent('change', true);
		this._focused = false;
	}

	public onClickDiv(e: MouseEvent){
		if ( e.target instanceof HTMLInputElement ) {
			if(this._input.selectionStart === this.size){
				this._updateCursor(0, 0, true);
			} else {
				this.setPosition(this._input.selectionStart, this._input.selectionEnd);
				this._updateCursor(0, 0);
			}
		}	
	}

	/* Keyboard */
	public onKeyDown(event: KeyboardEvent) {
		if(this.inputCursor){
			this.resetCursorAnimation(this.inputCursor.nativeElement);
		}

		if(event.key === 'a' && event.ctrlKey || this.isFullRange()){
			this.setPosition(0, this.size);
		} 

		let start = this._cursorStart;
		let end = this._cursorEnd;

		if (event.key === 'Backspace') {
			let tri = this._manageFixCharacterFromMask(Action.Suppress, start, end);
			end = tri.end;
			start = tri.start;
			let offset = tri.offset;

			if (start === end && start === 0) {
				return false;
			} else {
				let startValue = this.data.value.substring(0, start === end ? start - 1 : start) + this.data.value.slice(end);
				this.data.value = startValue + this.defaultValue.substring(startValue.length);
				this._updateCursor(start === end ? -1 : 0, start === end ? -1 : 0, this._cursorEnd - this._cursorStart === this.size);
				this._updateCursor(offset, offset);
				this.setEqualsPosition();
				this.data.value = this.formatRawValue(this.data.value, this.mask);
				this.updateFiltered();
				return false;
			}
		} else if (event.key === 'Delete') {
			let pair = this._manageFixCharacterFromMask(Action.Delete, start, end);
			end = pair.end;
			start = pair.start;

			if (start === end && start === this.size) {
				return false;
			} else {
				let startValue = this.data.value.substring(0, start) + this.data.value.slice(start === end ? end + 1 : end);
				this.data.value = startValue + this.defaultValue.substring(startValue.length, this.size);
				this._updateCursor(0, 0, this._cursorEnd - this._cursorStart === this.size);
				this.setEqualsPosition();
				this.data.value = this.formatRawValue(this.data.value, this.mask);
				this.updateFiltered();
				return false;
			}		
		} else if (event.key === 'ArrowUp') {
			this._nextInput(-1, true);
			return false;
		} else if (event.key === 'ArrowDown') {
			this._nextInput(+1, true);
			return false;
		} else if (event.key === 'ArrowLeft') {
			if(event.shiftKey){
				this._updateCursor(-1, 0);
			} else {
				this.setEqualsPosition();
				// Back tab
				if (this._cursorStart === 0) {
					this._nextInput(-1);
					return false;
				} else {
					this._updateCursor(-1,-1);
				}
			}
		} else if (event.key === 'ArrowRight') {
			if(event.shiftKey){
				this._updateCursor(0, 1);
			} else {
				this.setEqualsPosition();
				// Forward tab
				if (this._cursorStart === this.size - 1) {
					this._nextInput(+1, true);
					return false;
				} else {
					this._updateCursor(1,1);
				}
			}
		} else if (event.key === 'Tab') {
			if(event.shiftKey && this._cursorStart !== 0){
				this._updateCursor(0, 0, true);
				return false;
			} 
			// Forward (or back if shift down) tab
			this._nextInput(event.shiftKey ? -1 : +1, true);
			return false;
		}
	}

	public onKeyPress(event: KeyboardEvent) {
		let start = this._cursorStart;
		let end = this._cursorEnd;

		if (start < this.size) {
			end = this.mask ? this._manageFixCharacterFromMask(Action.Insert, start, end, event.key).end : this._insertValue(start, end, event.key).end;
			if (end === this.size) {
				this._nextInput(+1);
			} else {
				this.setPosition(0, 0);
				this._updateCursor(end,end);
			}
		}
		
		if(this.transactionService.is5250() && !this.isLCAllowed) {
			this.data.value = this.data.value.toUpperCase();
		}	

		this.updateFiltered();
		return false;
	}

	public onPaste(event: ClipboardEvent) {
		let start = this._cursorStart;
		let end = this._cursorEnd;
		let value: string = event.clipboardData.getData('text');

		if ((end - start) < value.length) {
			// Update selection
			const updateEnd = start + value.length;
			if(!this._insertMode){
				end = !!this.mask ? start + value.length + this.getFixedCharactersCount(this.mask, start, start+value.length) 
									: start + value.length;
			}
			if (updateEnd > this.size) {
				// Too long value (cut outside)
				value = value.substring(0, value.length - (updateEnd - this.size));
				end = this.size;
			}
		}

		end = this.mask ? this._manageFixCharacterFromMask(Action.Insert, start, end, value).end : this._insertValue(start, end, value).end;
		if (end === this.size) {
			this._nextInput(+1);
		} else {
			this.setPosition(0, 0);
			this._updateCursor(end,end);
		}

		return false;
	}

	public onOptionClick(event: any){
		console.log('EVENT', event);
	}

	/* Navigation ---------------------------------------------------------- */
	private _nextInput(step: number, forceStart?: boolean): void {
		let inputs: NodeListOf<Element> = document.querySelectorAll('.relative-pos > input:not([type=hidden]):not(:disabled):not(.hidden):not(:read-only):not(.absolute-pos-cursor)');
		for (let i = 0; i < inputs.length; i++) {
			if (inputs.item(i) === this._input) {
				let j = i + step;
				let input = null;
				if ((j >= 0) && (j < inputs.length)) {
					input = <HTMLInputElement>inputs[j];
				} else if(j < 0) {
					input = <HTMLInputElement>inputs[inputs.length - 1];
				} else if(j >= inputs.length){
					input = <HTMLInputElement>inputs[0];
				}

				if(input !== this._input){
					this.triggerRef.closePanel();
					input['_cursor'] = (step > 0 || forceStart) ? 0 : this._insertMode ? input.value.length : input.value.length - 1;
					input.selectionStart = input.selectionEnd = input['_cursor'];
					input.focus();
					break;
				} else {
					setTimeout(() => { this.triggerRef.openPanel(); }, 0);
				}
			}
		}
	}
	
	private _updateCursor(offsetStart: number, offsetEnd: number, reset:boolean = false) {
		this.updatePosition(offsetStart, offsetEnd);
		if(reset){
			this.setPosition(0, 0);
		}
		
		this.changeCursorMode();
		document.querySelector<HTMLElement>(':root').style.setProperty('--cursor-pos', this._cursorStart.toString());
	}

	/* Value --------------------------------------------------------------- */
	private _insertValue(start: number, end: number, value: string, oldValue: string = ""): { start: number, end: number } {
		// Filled
		if(this._insertMode && start === end &&
			((!!!this.mask && !this.data.value.endsWith(' ') ) || (!!this.mask && !oldValue.endsWith(' ')))) {
			return { start: start, end: end };
		}

		// Check cursor
		if (end < start) {
			return this._insertValue(end, start, value, oldValue);
		}

		// Insert value
		if(this._insertMode) {
			this.data.value = this.data.value.substring(0, start)
			+ value
			+ this.data.value.substring(end, this.size - 1);
		} else {
			this.data.value = this.data.value.substring(0, start)
			+ value
			+ this.data.value.substring(start === end ? Math.min(end + 1, this.size) : Math.min(end, this.size), this.size);
		}

		if(this.data.value.length < this.size){
			this.data.value += ' '.repeat(this.size - this.data.value.length);
		}
		this.data.value = this.data.value.slice(0, this.size);
		end = start + value.length;

		return { start: start, end: end };
	}

	private isAllowed(): boolean {
		return !this._input.getAttribute("mask")
	}

	private _manageFixCharacterFromMask(action: Action, start: number, end: number, value?: string): {start: number, end: number, offset: number } {
		let offset = 0;
		if (!!this.mask) {

			const isFixed = this.isFixedCharAtPos(this.data.value, this.mask, start);
			const res = this.getCursorPositionRaw(this.mask, this.data.value, start, end);
			start = res.start;
			end = res.end;
			const currentValue = this.data.value;
			this.data.value = this.getRawValue(this.mask, this.data.value);

			if (action === Action.Insert) {
				if(start < this.mask.length) {
					end = this._insertValue(res.start, res.end, value, currentValue).end;
					this.data.value = this.formatRawValue(this.data.value, this.mask);
					end += res.offset;
				}
			} else if(action === Action.Suppress) {
				offset = isFixed ? -1 : 0;
			}
		}

		return { start: start ,end: end, offset };
	}

	public isFocused(){
		return this._focused;
	}

	private triggerEvent(event: string, triggerIfModified = false){
		if(triggerIfModified && !this.data.isModified()){
			return;
		}
		const tmpVal = this.data.value;
		const changeEvent = new Event(event, { bubbles: true });
		this._input.dispatchEvent(changeEvent);
		this.data.value = tmpVal;
	}

	private setPosition(cursorStart: number, cursorEnd: number){
		this._cursorStart = this._input.selectionStart = cursorStart;
		this._cursorEnd = this._input.selectionEnd = cursorEnd;
	}

	private updatePosition(cursorStartOffset: number, cursorEndOffset: number){
		this._cursorStart += cursorStartOffset;
		this._cursorEnd += cursorEndOffset;

		this._cursorStart = this._input.selectionStart = Math.min(Math.max(0, this._cursorStart), this.size - 1);
		this._cursorEnd = this._input.selectionEnd = Math.min(Math.max(0, this._cursorEnd), this.size - 1);
	}

	private setEqualsPosition(){
		this._cursorEnd = this._cursorStart;
	}

	private formatValueWithMask() {
		if(!!this.mask){
			this.data.value = this.formatMaskedValue(this.mask, this.getRawValue(this.mask, this.data.value));
		}
	}

	private isFullRange(){
		return this._input.selectionStart <= 0 && this._input.selectionEnd >= this.size;
	}
}
