import { Attributes } from './message';
import { NumericalService } from '../dynamic-field/utility/numerical.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Represents a data for dynamic fields.
 */
export class Data {
    /* FIELDS ============================================================== */
    public initialValue: string;
    public displayedValue: string;
    public authorizedValues: string[];
    public range: string[];
    public comp: string[];
    public forceModified: boolean;
    public disabled: boolean;
    public protected: boolean;
    public allowAllBlank: boolean;
    public numerical: string;
    public numericProperties: NumericProperties;
    public hasNumericProperties: boolean;
	public uniqueId: string;
    // Field Program data Conversion attributes.
    public isConversionActive: boolean;
    public parentIndex: number = -1;
	

    
    /** Equivalent to the 3270/5250 input field MDT flag: true if the field was modified or if forced by the backend */
    private modified: boolean;

    /* CONSTRUCTORS ======================================================== */
    constructor(
        public value?: string,
        public legacyName?: string,
        public attributes?: Attributes,
        public initialCursor?: boolean,
	    public cursorLine?: number,
	    public cursorColumn?: number
    ) {
        this.initialValue = value;
        this.forceModified = false; // Unused from now on, see AbstTermComponent#fillData
        this.disabled = false;
        this.protected = false;
        this.modified = false;
        this.authorizedValues = [];
        this.range = [];
        this.comp = [];
        this.allowAllBlank = false;
        this.numerical = "NO";
        this.numericProperties = new NumericProperties();
		this.hasNumericProperties = false;
        this.isConversionActive = false;
		this.uniqueId = uuidv4();
		this.parentIndex = -1;
    }

    public clone(): Data {
        let cloneData = new Data(undefined, this.legacyName, this.attributes, this.initialCursor, this.cursorLine, this.cursorColumn);
        cloneData.value = this.value;
        cloneData.initialValue = this.initialValue;
        cloneData.forceModified = this.forceModified;
        cloneData.disabled = this.disabled;
        cloneData.protected = this.protected;
        cloneData.modified = this.modified;
        cloneData.authorizedValues = this.authorizedValues;
        cloneData.allowAllBlank = this.allowAllBlank;
        cloneData.numerical = this.numerical;
		cloneData.range = this.range;
		cloneData.comp = this.comp;
        if(this.numericProperties !== undefined){
			cloneData.numericProperties = this.numericProperties.clone();
		}
        cloneData.hasNumericProperties = this.hasNumericProperties;
        cloneData.isConversionActive = false;
		cloneData.uniqueId = this.uniqueId;
		cloneData.parentIndex = this.parentIndex;
        return cloneData;
    }

    /**
     * Returns true if user entered a value in this field, or if field is "forced modified".
     * Equivalent to the 3270 MDT field (stays true once set).
     */
    public isModified(): boolean {
        // Sanitize existing value; may not be initialized since objects generated in components
        // are "properties only" objects and not instances of Data (=> constructor not necessarily called)
        if (this.modified === undefined || this.modified === null) {
            this.modified = false;
        }

        // Set "modified" flag if forced or if user changed field value; keep its value otherwise (V7-7068)
        if (this.forceModified || this.isValueChangedByUser()) {
            this.modified = true;
        }

        return this.modified;
    }

    /** Reset the "modified" field */
    public clearModified(): void {
        this.modified = false;
    }

    /** Set the "modified" field */
    public setModified(): void {
        this.modified = true;
    }

    private isValueChangedByUser(): boolean {
        let modified: boolean = this.value != this.initialValue;

        // If no initial value, let's consider blank value as no modified field
        if (this.initialValue === undefined && typeof this.value === 'string' && this.value.trim() === '') {
            modified = false;
        }
        
        // If no initial value, let's consider 0 value as no modified field because of the post applied formating
		if (this.initialValue === undefined && this.numerical === 'NUM_STD' && parseInt(this.value) === 0) {
			modified = false;
		}
		
	    return modified;
    }
    
    public checkValue(): string {
		let validValue = "valid";
		let invalidValue = "CPF5223";
		let invalidRange = "CPF523A";
        
    	if(this.allowAllBlank) {
    	    // If CHECK(AB) is specified, data management passes the input data to the program 
    	    //              blanks for a character field and zeros for a numeric field. 
    	    // No further validity checking is done.
    		if(this.value === undefined) {
    			return validValue;
    		} else if(!NumericalService.isNumerical(this.numerical) && this.value.trim() === '') {
    			return validValue;
    		} else if(NumericalService.isNumerical(this.numerical) && Number(this.value) === 0) {
    			return validValue;
    		}
    	}	    
    
		if(this.authorizedValues != undefined && this.authorizedValues.length > 0 && this.value !== undefined){
    		let authorizedValue: boolean = this.authorizedValues.map(String).indexOf(this.value) > -1;
    		if (!authorizedValue) {
    			authorizedValue = this.authorizedValues.map(String).indexOf(this.value.trim()) > -1;
    		}
    		return authorizedValue ? validValue : invalidValue;
		}
	
		
		if(this.range !== undefined && this.range.length > 0 && this.value !== undefined){
			let lowValue : string = this.range[0] + '';
			let highValue : string = this.range[1] + '';
			if (lowValue.startsWith('.')) {
				lowValue = "0" + lowValue;
			}
			if (highValue.startsWith('.')) {
				highValue = "0" + highValue;
			}
			if (this.value.startsWith('.')) {
				this.value = "0" + this.value;
			}
			
            let isAlphabetic = isNaN(Number(lowValue)) && isNaN(Number(highValue));
			if (isAlphabetic) {
				const str = "^[" + lowValue + '-' + highValue + "]$";
				const regex = new RegExp(str);
				if (regex.test(this.value)){
					return validValue;
				}
				return invalidRange;
			}
			if (!isNaN(Number(lowValue)) && !isNaN(Number(highValue)) && !isNaN(Number(this.value))) {
				let minValue : number = Number(lowValue);
				let maxValue : number = Number(highValue);
				if(Number(this.value) >= minValue && Number(this.value) <= maxValue){
					return validValue;
				}
			}
			return invalidRange;
		}

		if(this.comp !== undefined && this.comp.length > 0 && this.value !== undefined){
			let operator : string = this.comp[0] + '';
			let compValue : string = this.comp[1] + '';
			if (!isNaN(Number(this.value)) && !isNaN(Number(compValue))) {
				return this.checkComparison(Number(this.value), Number(compValue), operator);
			} else {
				return this.checkComparison(this.value, compValue, operator);
			}
		}
		
		return validValue;
	}
	
    private checkComparison(value1 : any, value2 : any, operator : any): string {
		switch (operator.toUpperCase()) {
			case "EQ":
				return value1 == value2 ? "valid" : "COMP_CPF522B";
			case "NE":
				return value1 != value2 ? "valid" : "COMP_CPF522A";
			case "LT":
				return value1 < value2 ? "valid" : "COMP_CPF522C";
			case "GT":
				return value1 > value2 ? "valid" : "COMP_CPF522E";
			case "NG":
			case "LE":
				return value1 <= value2 ? "valid" : "COMP_CPF522F";
			case "NL":
			case "GE":
				return value1 >= value2 ? "valid" : "COMP_CPF522D";		
		}
		return "CPF5223";
    }		
	
	
    /*
	 * Set good color with attributes
	 * See https://www.ibm.com/support/knowledgecenter/ssw_ibm_i_72/rzakc/rzakcmstdfcolor.htm
	 * 
	 */
	public setCombinationsAttributes(): void {
		// In some combinations of COLOR and DSPATR, both keywords have effect.
		// In some combinations of the COLOR and DSPATR keywords, some of the parameter values are ignored.
		let color: string = this.attributes.color;
		let highlight: string = this.attributes.highlight;
		let intensity: string = this.attributes.intensity;
		let protection: string = this.attributes.protection;
		let password = intensity === 'PWD';
		if (password) {
			this.attributes.isPassword = true;
			intensity = 'NORM';
			if (!color) {
				color = 'DEFAULT';
			}
		} else {
			// ND (nondisplay) - All colors are ignored
			if (intensity === 'DRK') {
				// Change dark to hidden to remove field space on screen
				intensity = 'HIDDEN'; 
				color = '';
			} else {
				if (color) {
					// HI is ignored
					intensity = '';
					// TODO CS is ignored
					// The only color that can blink is red.
					if (color !== 'RED' && highlight === 'BLINK') {
						highlight = '';
					}
				} else {
					if (this.attributes.columnSeparator) {
						if (intensity === 'high') {
							if (highlight === 'BLINK') {
								color = 'BLUE';
							} else {
								color = 'YELLOW';
							}
						} else {
							if (highlight === 'BLINK') {
								color = 'PINK';
							} else {
								color = 'TURQUOISE';
							}
						}
					} else {
						if (intensity === 'high') {
							if (highlight === 'BLINK') {
								color = 'RED';
							} else {
								color = 'WHITE';
							}
						} else {
							if (highlight === 'BLINK') {
								color = 'RED';
							} else {
								color = 'DEFAULT';
							}
						}
					}
				}
				// Set empty attributes with default value
				if (!color) {
					color = 'DEFAULT';
				}
				if (!intensity) {
					intensity = 'NORM';
				}
			}
		}
		if (!protection) {
			protection = 'ASKIP';
		}
		this.attributes.color = color;
		this.attributes.highlight = highlight;
		this.attributes.intensity = intensity;
		this.attributes.protection = protection;
	}
	
	public initializeNumericProperties() {
		this.numericProperties = new NumericProperties();
	}
}

/**
 * Represents a group of data for update fields in maps.
 */
export class Token {
    /* FIELDS ============================================================== */
    public modal: string;

    /* CONSTRUCTORS ======================================================== */
    constructor( public children: TokenField[] ) {}
}

/**
 * Represents an update operation on field in map with data.
 */
export class TokenField {
    /* CONSTRUCTORS ======================================================== */
    constructor(
        public map: string,
        public field: string,
        public data: string,
    ) {}
}


export class NumericProperties {
	/* FIELDS ============================================================== */
	public scale: number;
	public precision: number;

	constructor(pScale?: number, pPrecision?: number){
		this.scale = pScale;
		this.precision = pPrecision;
	}

	public clone(): NumericProperties {
		let clone = new NumericProperties(this.scale, this.precision);
		return clone;
	}
}

/**
 * Represents a help item in the assets/help-panel.json (V7-9673)
 */

export interface HelpPanel {
	panelId: string;
	helpItems: HelpItem[];
}

export interface HelpItem {
	helpId: string;
	helpTitle: string;
    helpContent: string;
}

export type FieldHelpMetadata = {
	fieldId: string;
	helpItemId: string;
	panelId: string;
}

export type ScreenHelpMetadata = {
	helpTitle: string;
	helpItemId: string;
	panelId: string;
}
