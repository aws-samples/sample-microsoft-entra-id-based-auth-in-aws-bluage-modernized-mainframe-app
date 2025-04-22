import { Component, Input, ViewChild, ElementRef, inject, HostListener } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Attributes } from '../term/message';
import { DynamicFieldComponent } from './dynamic-field.component';
import { AppService } from '../app.service';
import { FieldSynchronizationService } from '../services/field-synchronization.service';
import { TransactionService } from '../term/transaction.service';
import { ConfigService } from 'app/config-service';
import { EditCodeService } from './utility/editcode.service';
import { EditWordService } from './utility/editword.service';
import { NumericalService } from './utility/numerical.service';
import { ModalService } from '../modal.service';
import { Subscription } from 'rxjs';
import { CHARSET } from './utility/charset.enum';

function isDefinedAndDifferentOf(value: string, notExpected: string) {
	return value && (value !== notExpected);
}

const enum Action {
	Insert = 1,
	Suppress,
	Delete,
	Copy
}

@Component({
	moduleId: module.id,
	selector: 'dynamic-field',
	// Spaces are significant => all on one line, no space or break-line outer tag
	template: `
	<div class="relative-pos" tabindex="-1" (click)="onClickDiv($event)">
		<input #input [disabled]="data.disabled" [readonly]="data.protected"
			[attr.id]="id" [attr.name]="id" type={{inputType}} [attr.size]="realSize" [attr.maxlength]="realSize"
			[attr.mask]="mask" [attr.underline]="underline" 
			[style.width]="computeWidth()" [class]="styleClass" [ngClass]="classes"
			[ngModel]="getValueToDisplay()" 
			(keydown)="onKeyDown($event)" (keypress)="onKeyPress($event)"
			(compositionstart)="onCompositionStart($event)" (compositionend)="onCompositionEnd($event)"
			(paste)="onPaste($event)"
			(focus)="onFocus($event)" (blur)="onBlur()" />
		<input #inputcursor *ngIf="!data.disabled && !data.protected && isShowCursor()" [style.width]="computeWidth()" 
			[attr.size]="realSize" [attr.maxlength]="realSize" [class]="styleClass" [ngClass]="classes" class="absolute-pos-cursor" [class]="cursorClass"
			type={{inputType}} readonly tabindex="-1">		
	</div>	
	`,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: DefaultDynamicFieldComponent,
			multi: true
		},
	],
})
export class DefaultDynamicFieldComponent extends DynamicFieldComponent {
	/* FIELDS ============================================================== */
	private _input: HTMLInputElement;
	private parentDiv;

	private _focused = false;
	private _showCursor: boolean = false;
	
	private _cursorStart = 0;
	private _cursorEnd = 0;
	private isComposing: boolean = false;
	
	private modalReadySubscription : Subscription;
	
	public classes = [];

	@Input() id: string; // inherited
	@Input() size: number = 0; // inherited
	@Input() styleClass: string;
	@Input() inputType: string = 'text';
	@Input() isLCAllowed: boolean = false;
	@Input() focused: Boolean;
	@Input() line: number;
	@Input() column: number;
	@Input() edtcde: string;
	@Input() edtwrd: string;
	@Input() digitNb: number;
	@Input() decSize: number;
	@Input() justify: string;

	public realSize: number = 0;
	public initialSize: number = 0;
	
	private regexDouble: RegExp;
	private regexOnlyDouble: RegExp;
	
	private origCharset: string;

	@ViewChild('input', { static: true}) inputRef: ElementRef;
	@ViewChild('inputcursor', {static: false}) inputCursor: ElementRef;
	
	// DIs
	private fieldSyncService: FieldSynchronizationService = inject(FieldSynchronizationService);

	/* CONSTRUCTORS ======================================================== */
	constructor(private appService: AppService, private transactionService: TransactionService, private elRef: ElementRef, private configService: ConfigService, private modalService: ModalService) {
		super();
		this.setConfigService(configService);
		this.regexDouble = new RegExp("[' '" + this.configService.getRegexDBCS() + "]");
		this.regexOnlyDouble = new RegExp('[' + this.configService.getRegexDBCS() + ']');
		this.registerOnChange(() => {
			if(this.initialSize !== 0){
				this.size = this.initialSize;
			}
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
		if (!this.fieldSyncService.shouldSyncFocusRequests()) {
			this.modalReadySubscription = this.modalService.modalReadyEvent.subscribe(() => {
				this.computeFocus();
			});
		}
	}

	/* METHODS ============================================================= */
	ngOnInit(): void {
		super.ngOnInit();
		this._input = this.inputRef.nativeElement;
		this.initialSize = this.size;
		this.realSize = this.initialSize;
	}
	
	ngAfterViewInit(): void {
		if(this.data && this.data.uniqueId){
			document.addEventListener('highlight-' + this.data.uniqueId, this.processHighlightEvent.bind(this));
		}
	}

	ngOnDestroy(): void {
		if(this.data && this.data.uniqueId){
			document.removeEventListener(this.data.uniqueId, this.processHighlightEvent);
		}
	}
	/* Compute ------------------------------------------------------------- */
	computeWidth(): string {
		// Needed since the "size"" attribute of input is not precise enough
		return this.computeFontWidth(this._input) * this.realSize + 'px';
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
		this.classes = [];
		// Decode attributes
		let attributes: Attributes = this.data.attributes;
		if (!attributes) {
			// May happen due to SEND TEXT
			return;
		}
		
		// Determinate classes
		if (isDefinedAndDifferentOf(attributes.intensity, 'NORM')) {
			this.classes.push(attributes.intensity.toLowerCase());
		}
		if (attributes.color !== undefined) {
			this.classes.push(attributes.color.toLowerCase());
		}
		if (isDefinedAndDifferentOf(attributes.highlight, 'OFF')) {
			this.classes.push(attributes.highlight.toLowerCase());
		}
		if (attributes.charsetMode !== undefined) {
			this.classes.push(attributes.charsetMode.toLowerCase());
		}

		// Add hidden class to parent div if needed
		if(this.parentDiv) {
			if (this.classes.indexOf('hidden') >= 0) {
				this.parentDiv.classList.add('hidden');
			} else {
				this.parentDiv.classList.remove('hidden');
			}
		}

		return this.classes;
	}

	private computeAttributes() {
		// Decode attributes
		let attributes: Attributes = this.data.attributes;
		if (!attributes) {
			// May happen due to SEND TEXT
			return;
		}
		
		if(this.data && !this.data.attributes.charsetMode){
			this.data.attributes.charsetMode = CHARSET.SINGLE;
		}
		
		if(attributes !== undefined && attributes !== null 
			&& this.inputType !== undefined && this.inputType === 'password'){
			attributes.isPassword = true;
		}
		
		if (attributes.isPassword) {
			this.inputType = 'password'
		}

		// Determine classes
		this.computeClasses();

		if (attributes.mask !== undefined) {
			this.mask = attributes.mask;
		}
		
		// Apply numeric properties such as scale and precision if applicable
		this.applyNumericProperties();

		// Perform conversion if applicable
		this.convertProgramData();
		
		//Set the line and column in data object
		this.data.attributes.line = this.line;
		this.data.attributes.column = this.column;

		this.formatValue();
		
		
		if (attributes.underline !== undefined) {
			this.underline = attributes.underline;
		}
		
		this.computeCharset();

		// Determinate consultation mode (readOnly)
		this.data.disabled =  attributes.protection === 'ASKIP';
		this.data.protected = attributes.protection === 'PROT';
	}

	// Modify sizes and class depending on charset mode
	private computeCharset() {
		this.origCharset = this.data.attributes.charsetMode;
		switch(this.data.attributes.charsetMode){
			case CHARSET.DOUBLE:
				this.realSize = this.initialSize;
				this.realSize *= 2;
				if (this.parentDiv && this.parentDiv.classList.contains("lgr_" + this.pad(this.size,2))) {
					this.parentDiv.classList.remove("lgr_" + this.pad(this.size,2));
					this.parentDiv.classList.add("lgr_" + this.size * 2);
				}
				this.classes.push('double')
				break;
			case CHARSET.EITHER:
				this.realSize = this.initialSize;
				if(this.regexOnlyDouble.test(this.data.value.charAt(0))){
					this.size = this.realSize / 2 - 1;
					this.classes.push('double');
				}
				break;
			case CHARSET.ONLY:
				this.realSize = this.initialSize;
				this.size = this.realSize / 2 - 1;
				this.classes.push('double');
				break;
			case CHARSET.MIXED:
				this.classes.push('doubleO');
				this.checkSizeO(this.data.value, 0, 0);
				this.realSize = this.initialSize;
				break;
		}
	}

	private computeFocus() {
		let focusRequested: boolean = false;
		if (this.data !== undefined) {
			// Cursor line takes more priority
			if (this.data.cursorLine !== undefined
				&& this.data.cursorColumn !== undefined 
				&& this.line == this.data.cursorLine 
				&& (this.column + 1) == this.data.cursorColumn) {
				this.requestOrFocusCurrentComponent(3);
				focusRequested = true;
			} else if (this.data.initialCursor) {
				// Backend requesting initial cursor takes next priority
				this.requestOrFocusCurrentComponent(2);
				focusRequested = true;
			}
		}
		if (!focusRequested && this.focused) {
			// Focused is least priority
			this.requestOrFocusCurrentComponent(1);
		}
	}

	/**
	 * Request or focus current component depending on the 
	 * should sync focus flag
	 * 
	 * @param subPriority the sub priority of the request
	 */
	private requestOrFocusCurrentComponent(subPriority: number) {
		if (this.fieldSyncService.shouldSyncFocusRequests()) {
			this.fieldSyncService.requestInitialCursor(
				this.data.parentIndex, subPriority, this.line, this.column, this
			);
		} else {
			this.focusCurrentComponent(true);
		}
	}
	
	/**
	 * Focus the current component
	 */
	public focusCurrentComponent(wrapFocus: boolean = false) {
		this._updateCursor(0, 0, true);
		if (wrapFocus) {
			setTimeout(() => this._input.focus(), 0);
		} else {
			this._input.focus();
		}
	}

	/* Events -------------------------------------------------------------- */
	/* Focus */
	public onFocus(event: FocusEvent) {
		this.triggerEvent('input');
		this._focused = true;
		this._showCursor = true;

		this.setPosition(this._input['_cursor'], this._input['_cursor']);
		this._cursorStart = this._cursorEnd = this._input['_cursor'];
		if (!this._cursorStart) {
			this.setPosition(0, 0);
		}

		this._updateCursor(0, 0);
		
		// If a numeric value is equal to 0 and must be displayed as empty
		if(NumericalService.isNumerical(this.data.numerical) && !this.data.protected){
			let strValue = NumericalService.convertDecimalFormat(this.data.value.trim(), this.configService.getQDECFMT());
			if(Number(strValue) == 0 && this.data.displayedValue.trim() === ""){
				this.data.value = this.data.displayedValue;
			}
		}

		this.checkSizeO(this.data.value, this._cursorEnd, this._cursorEnd);
	}

	public onBlur() {
		// Selenium IDE hack
		if (this._input.value && this._input.value !== undefined 
			&& !this.data.protected && !this.data.disabled) {
			this.data.value = this._input.value;
		}

		if(NumericalService.isNumerical(this.data.numerical) && !this.data.protected){
			// Editable numerical field => check if the typed value corresponds to the field numeric format
			if(!this.checkValue()){
				this._focused = false;
				this._showCursor = false;
				this.data.displayedValue = this.data.value;
				return;
			} 
		}

		// Reformat the value with the EDTCDE
		this.formatValue();
		
		this.triggerEvent('change', true);
		this._focused = false;
		this._showCursor = false;
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
		if(this.isComposing){
			return; //Exit early if IME composition is in progress
		}

		let keyCode = event.which || event.keyCode || -1;

		// Tab key pressed, shift cursor to next field
		if (event.key === 'Tab' || keyCode === 9) {
			if(event.shiftKey && this._cursorStart !== 0){
				this._updateCursor(0, 0, true);
				return false;
			} 
			// Forward (or back if shift down) tab
			this._nextInput(event.shiftKey ? -1 : +1, true);
			return false;
		}

		// If the field is protected, ignore the key
		if(this.data.protected){
			return false;
		}
		
		if(this.inputCursor){
			this.resetCursorAnimation(this.inputCursor.nativeElement);
		}

		if(event.key === 'a' && event.ctrlKey || this.isFullRange()){
			this.setPosition(0, this.size);
		} 

		let start = this._cursorStart;
		let end = this._cursorEnd;

		// Selenium IDE hack
        if((event.key === 'Enter' || keyCode === 13) && this._input.value && this._input.value !== this.data.initialValue) {
		    this.data.value = this._input.value;
		} else if (event.key === 'Backspace' || keyCode === 8) {
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
				return false;
			}
		} else if (event.key === 'Delete' || keyCode === 46) {
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
				return false;
			}		
		} else if (event.key === 'ArrowUp' || keyCode === 38) {
			this._nextInput(-1, true);
			return false;
		} else if (event.key === 'ArrowDown' || keyCode === 40) {
			this._nextInput(+1, true);
			return false;
		} else if (event.key === 'ArrowLeft' || keyCode === 37) {
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
		} else if (event.key === 'ArrowRight' || keyCode === 39) {
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
		}

		// Case of key being enter or function key or pageup/pagedown. All these cases, zero value should be restored for numerical fields.
		if (NumericalService.isNumerical(this.data.numerical)) {
			let shouldRestoreZeroValue = false;
			// Check for Enter
			shouldRestoreZeroValue = shouldRestoreZeroValue || (event.key === 'Enter' || keyCode === 13);
			// Check for Pageup/Pagedown
			shouldRestoreZeroValue = shouldRestoreZeroValue || keyCode == 33 || event.key === 'PageUp' || keyCode == 34 || event.key === 'PageDown';
			// Check for function key pressed.
			shouldRestoreZeroValue = shouldRestoreZeroValue || (keyCode >= 112 && keyCode <= 123);
			if (shouldRestoreZeroValue) {
				if(NumericalService.isNumerical(this.data.numerical) && !this.data.protected){
					// Editable numerical field => check if the typed value corresponds to the field numeric format
					if(!this.checkValue()){
						this._focused = false;
						this.data.displayedValue = this.data.value;
						return;
					}
				}

				// Reformat the value with the EDTCDE
				this.formatValue();
				this._focused = false;

			}
		}
	}

	public onKeyPress(event: KeyboardEvent) {
		if(this.isComposing){
			return; //Exit early if IME composition is in progress
		}
		if(!event.key){
			return false;
		}

		if(this.transactionService.is5250() && NumericalService.isNumerical(this.data.numerical)) {
			if(!NumericalService.isNumericValue(event.key)){
				document.dispatchEvent( new MessageEvent( 'message', { data: 'Field_requires_numeric_characters' } ) );
				return;
			}
		}
		
		let value = event.key;
		if(this._cursorStart === 0 && this.origCharset === CHARSET.EITHER){
			if(!this.regexOnlyDouble.test(value)){
				this.classes = this.classes.filter(c => c !== 'double');
				this.size = this.realSize;
				this.data.attributes.charsetMode = CHARSET.SINGLE;
				this.data.value = ' '.repeat(this.size);
			} else {
				this.classes.push('double');
				this.size = this.realSize / 2 - 1; 
				this.data.attributes.charsetMode = CHARSET.EITHER;
				this.data.value = '\u{3000}'.repeat(this.size);
			}
		}

		if(this.data.attributes.charsetMode !== CHARSET.MIXED){
			if(!this.onBeforeInput(value)){
				return false;
			}
		}

		if(this.isDBCS() && value === ' '){
				value = '\u{3000}';
		}

		const currentVal = this.data.value;

		let start = this._cursorStart;
		let end = this._cursorEnd;

		const endO = this._cursorEnd;

		let prevVal = ' ';
		if(this._cursorStart > 0){
			prevVal = this.data.value.charAt(this._cursorStart -1);
		}

		if (start < this.size) {
			end = this.mask ? this._manageFixCharacterFromMask(Action.Insert, start, end, value).end : this._insertValue(start, end, value).end;
			end = this.checkSizeO(currentVal, end, endO);
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
		
		if(start === this.size - 1){
			this.triggerComplete();
		}
		return false;
	}
	
	// Prevent input SB on DB fields and DB on SB fields
	public onBeforeInput(data: string){
		if(data != null){
			if(this.isDBCS() && !this.regexDouble.test(data)){
				return false;
			} else if(!this.isDBCS() && this.regexOnlyDouble.test(data)){
				return false;
			}
		}
		return true;
	}

	public onCompositionStart(event: any) {
		console.log('Composition Started');
		this.isComposing = true;
	}

	public onCompositionEnd(event: any) {
		console.log('Composition Ended');
		this.isComposing = false;
		const value = event.data;
		for (let i = 0; i < value.length; i++) {
			let element = value.charAt(i);
			const ev = new KeyboardEvent('keypress', {key: element});
			this.onKeyPress(ev);

			if(this._cursorEnd === this.size){
				break;
			}
		}
		return false;
	}

	public onPaste(event: ClipboardEvent) {
		let start = this._cursorStart;
		let end = this._cursorEnd;
		let value: string = event.clipboardData.getData('text');

		for (let i = 0; i < value.length; i++) {
			let element = value.charAt(i);
			const ev = new KeyboardEvent('keypress', {key: element});
			this.onKeyPress(ev);

			if(this._cursorEnd === this.size){
				break;
			}
		}
		return false;
	}

	private processHighlightEvent(event) {
		const eventData = event.data.toString();
		if(eventData === 'OFF'){
			this.classes = this.classes.filter((entry) => entry !== 'reverse');
		} else if (eventData === 'reverse'){
			this.classes.push(eventData);
		}
		
	}
	/* Navigation ---------------------------------------------------------- */
	private _nextInput(step: number, forceStart?: boolean): void {
		// First get all input-capable elements from the most on top document
		let inputs : NodeListOf<Element>;
		let modals: NodeListOf<Element> = document.querySelectorAll('modal-window');
		if(modals.length > 0){
			// Most on top modal window
			inputs = modals[modals.length - 1].querySelectorAll('.relative-pos > input:not([type=hidden]):not(:disabled):not(.hidden):not(:read-only):not(.absolute-pos-cursor)');
		} else {
			// Main document
			inputs = document.querySelectorAll('.relative-pos > input:not([type=hidden]):not(:disabled):not(.hidden):not(:read-only):not(.absolute-pos-cursor)');
		}

		// Search for current field in available fields to select the next one
		let input = null;
		for (let i = 0; i < inputs.length; i++) {
			if (inputs.item(i) === this._input) {
				let j = i + step;
				if ((j >= 0) && (j < inputs.length)) {
					input = <HTMLInputElement>inputs[j];
				} else if(j < 0) {
					input = <HTMLInputElement>inputs[inputs.length - 1];
				} else if(j >= inputs.length){
					input = <HTMLInputElement>inputs[0];
				}
			}
		}
		// Current field not found (maybe because the field is on read-only), select the first available one
		if(input == null && inputs.length > 0){
			input = <HTMLInputElement>inputs[0];
		}

		// Set focus on the input
		if(input !== this._input){
			input['_cursor'] = (step > 0 || forceStart) ? 0 : this._insertMode ? input.value.length : input.value.length - 1;
			input.selectionStart = input.selectionEnd = input['_cursor'];
			setTimeout(() => input.focus(), 0);
		}
	}

	private _updateCursor(offsetStart: number, offsetEnd: number, reset:boolean = false) {
		this.updatePosition(offsetStart, offsetEnd);
		if(reset){
			this.setPosition(0, 0);
		}
		
		this.computeCssSizeO();
		this.checkCharacterO();
		this.changeCursorMode();
		document.querySelector<HTMLElement>(':root').style.setProperty('--cursor-pos', this._cursorStart.toString());
	}

	/* Value --------------------------------------------------------------- */
	private _insertValue(start: number, end: number, value: string, oldValue: string = ""): { start: number, end: number } {
	    value = value ? value : '';
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
	
	/**
	 * Function that determines if cursor should be shown at current field
	 */
	 public isShowCursor():boolean {
		return this._showCursor;
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

	private formatValue() {
		if(!!this.mask){
			this.data.displayedValue = this.formatMaskedValue(this.mask, this.getRawValue(this.mask, this.data.value));
		} else if(!!this.edtcde){
			this.data.displayedValue = EditCodeService.buildValue(this.data.value, this.size, this.decSize, this.edtcde, this.configService.getQDECFMT());
		} else if(!!this.edtwrd){
			this.data.displayedValue = EditWordService.buildValue(this.data.value, this.edtwrd, this.decSize, this.configService.getQDECFMT());
		} else if(!!this.justify){
			this.data.displayedValue = this.justifyValue();
		} else {
			this.data.displayedValue = this.data.value;
		}
	}

	protected justifyValue(): string {
		let formatedValue : string = "";
		let replaceToken : string = "";
		let replacement : string = "";
		var justifySplited = this.justify.split(" ");
		const align = justifySplited[0];
		const fillWith = justifySplited[1];
		formatedValue = this.data.value.trim();
		let replaceLength = this.size - formatedValue.length;
		let isNumerical = NumericalService.isNumerical(this.data.numerical);
		let isSigned = NumericalService.isSignedNumeric(this.data.numerical); 
		let isNegative = isSigned ? formatedValue.endsWith("-") : formatedValue.startsWith("-");
		
		// remove minus sign : left position in number and right position in display 
		if(isNumerical && isNegative){
			if (isSigned) {
				formatedValue = formatedValue.substring(0, formatedValue.length - 1);
			} else {
				formatedValue = formatedValue.substring(1, formatedValue.length);
			}
		}
		if (isSigned) {
			// Reserve space for sign at the end
			replaceLength--;
		}
	    // determine the padding token
		if (fillWith === "BLANK") {
			replaceToken = " ";
		} else if (fillWith === "ZERO") {
			replaceToken = "0";
		} else {
			replaceToken = " ";
		}
		
		//compute the padding
		for (let i=0; i < replaceLength; i++) {
			replacement += replaceToken;
		}

        // handle right or left padding
		if(align === "RIGHT") {
			formatedValue = replacement + formatedValue;
			// for negative numerical and  numerical signed -> ends with the sign 
			if(isNumerical && (isNegative || isSigned)){
				if (isNegative) {
					replacement = "-";
				} else {
					replacement = " ";
				}
				formatedValue = formatedValue + replacement;
			}
		} else {
			// for negative numerical -> ends with the sign 
			if(isNumerical && (isNegative)){
				formatedValue = formatedValue + "-";
			} else if (isSigned) {
				// Signed numeric positive integer has space in the end. 
				formatedValue = formatedValue + " ";
			}
			formatedValue = formatedValue + replacement;
		}
		
		
		return formatedValue;
	}

	// Check if the value is numerical and if digits fit with field definition
	private checkValue() : boolean {
		let qdecfmt = this.configService.getQDECFMT();
		let isDPcomma = (qdecfmt == "J" || qdecfmt == "I");
		
		// In case of Signed numeric, test for 0-9 or blank and sign at the end.
		if (NumericalService.isSignedNumeric(this.data.numerical)) {
			if(!NumericalService.isValidSignedNumeric(this.data.value)) {
				document.dispatchEvent( new MessageEvent( 'message', { data: 'Only_Chars_0_to_9' } ) );
				return false;
			}
			return true;
		}
		// Need to restore zero value displayed as blanks (data.value need to be restored to prevent the data to be set as modified)
		this.restoreZeroValue(isDPcomma);
		let strValue = NumericalService.convertDecimalFormat(this.data.value.trim(), this.configService.getQDECFMT());
		if (!EditCodeService.isNumber(strValue)) {
			document.dispatchEvent( new MessageEvent( 'message', { data: 'Numeric_value' } ) );
			return false;
		}
		// Check for valid numeric format
		if(NumericalService.isStandardNumerical(this.data.numerical) && 
        this.data.hasNumericProperties &&
        !NumericalService.isValidNumericFormat(this.data.value, this.data.numericProperties)){
            return false;
        }
        
		return true;
	}

	restoreZeroValue(isDPcomma : boolean) {
		if(this.data.value.trim() === ""){
			this.data.value = "0";
			if(this.decSize > 0){
				this.data.value += (isDPcomma ? "," : ".") + '0'.repeat(this.decSize);
			}
		}
	}

	getValueToDisplay() : string {
		if (this.isFocused() && !this.data.protected){
			return this.data.value;
		} else {
			return this.data.displayedValue;
		}
	}

	private isFullRange(){
		return this._input.selectionStart <= 0 && this._input.selectionEnd >= this.size;
	}
	
	private pad(num: number, size: number) {
		let strnum = num.toString();
		while (strnum.length < size) { 
			strnum = "0" + strnum; 
		}
		return strnum;
	}
	
	/**
	 * Convert the program data if applicable
	 * Conversion happens in case of
	 *  -> Signed numeric
	 */
	private convertProgramData() {
		let isUnedited: boolean = !this.edtcde && !this.edtwrd && !this.mask;
		this.data.isConversionActive = false;
		// if signed numeric, convert program value to displayed value.
		if (NumericalService.isSignedNumeric(this.data.numerical)) {
			this.data.isConversionActive = true;
			this.data.value = NumericalService.convertToSignedNumeric(this.data.value, this.decSize);
			// Convert the initial data so that modified check doesn't cause issues.
			this.data.initialValue = NumericalService.convertToSignedNumeric(this.data.initialValue, this.decSize);
		} else if (NumericalService.isDigitsOnlyNumeric(this.data.numerical)) {
			this.data.isConversionActive = true;
			this.data.value = NumericalService.convertToUneditedNumericOnly(this.data.value, this.digitNb, this.decSize);
			this.data.initialValue = NumericalService.convertToUneditedNumericOnly(this.data.initialValue, this.digitNb, this.decSize);
		} else if (NumericalService.isNumerical(this.data.numerical)) {
			if (isUnedited) {
				this.data.isConversionActive = true;
				this.data.value = NumericalService.convertToUneditedNumericOnly(this.data.value, this.digitNb, this.decSize);
				this.data.initialValue = NumericalService.convertToUneditedNumericOnly(this.data.initialValue, this.digitNb, this.decSize);
			}
		}
	}

	// Change css variables depending on the number of SB and DB characters
	private computeCssSizeO(){
		if(this.data.attributes && this.data.attributes.charsetMode === CHARSET.MIXED){
			let single = 0;
			let double = 0;

			for (let i = 0; i < this._cursorStart; i++) {
				const element = this.data.value.charAt(i);
				if(this.regexOnlyDouble.test(element)){
					double++;
				} else {
					single++;
				}
			}
			document.documentElement.style.setProperty('--num-single', single.toString());
			document.documentElement.style.setProperty('--num-double', double.toString());
		}
	}

	// Change field size depending on the number of SB and DB characters
	private checkSizeO(currentDataValue: string, end: number, endO: number) {
		if(this.data.attributes && this.data.attributes.charsetMode === CHARSET.MIXED){
			const origSize = this.size;
			this.size = this.realSize;
			const origClasses = this.classes;
			const curVal = this.data.value.replace(/\s+$/, '');

			for (let i = 0; i < curVal.length; i++) {
				const element = curVal.charAt(i);
				if(i === 0){
					if(this.regexOnlyDouble.test(element)){
						this.size -= 3;
					}
				} else {
					if(this.regexOnlyDouble.test(element) && this.regexOnlyDouble.test(this.data.value.charAt(i - 1))) {
						this.size -= 1;
					} else if(this.regexOnlyDouble.test(element) && !this.regexOnlyDouble.test(this.data.value.charAt(i - 1))){
						this.size -= 3;
					}
				}
			}

			if(this.size < curVal.length){
				this.data.value = currentDataValue;
				this.size = origSize;
				this.classes = origClasses;
				return endO;
			}
		}

		return end;
	}

	// Change cursor display depending on current character
	private checkCharacterO() {
		if(this.data.attributes && this.data.attributes.charsetMode === CHARSET.MIXED){
			if(this.regexOnlyDouble.test(this.data.value.charAt(this._cursorStart))){
				this.classes.push('double');
			} else {
				this.classes = this.classes.filter(c => c !== 'double');
			}
		}
	}

	private isDBCS(){
		if(this.data.attributes.charsetMode === CHARSET.EITHER || this.data.attributes.charsetMode === CHARSET.ONLY || this.data.attributes.charsetMode === CHARSET.DOUBLE){
			return true;
		}
		return false;
	}
	
	private applyNumericProperties(){
		if (NumericalService.isNumerical(this.data.numerical) && (this.data.attributes !== undefined && this.data.attributes.intensity !== 'HIDDEN')) {
			this.data.hasNumericProperties = true;
			if(this.data.numericProperties === undefined){
				this.data.initializeNumericProperties();
			}
			this.data.numericProperties.scale = this.decSize;
			this.data.numericProperties.precision = this.digitNb;
		}
	}
}
