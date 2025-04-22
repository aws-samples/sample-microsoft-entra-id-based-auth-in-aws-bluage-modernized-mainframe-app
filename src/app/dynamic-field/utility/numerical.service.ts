import { Injectable } from '@angular/core';
import { Data, NumericProperties } from '../../term/term.model';

const enum NumericalRule {
	/** not numerical. */
	NO, 
	/** numerical */
	NUM_STD, 
	/** numerical signed. */
	NUM_SIGNED
}

@Injectable()
export class NumericalService {
	/* FIELDS ============================================================== */

	/**
	 * Compute the size value for a numeric field according the given edit code
	 * 
	 * @param numerical the type of numerical
	 * @return true if the field is a numerical
	 */
	static isNumerical(numerical : string) : boolean {
		return "NUM_STD" === numerical || "NUM_SIGNED" === numerical || "NUM_DIG" === numerical;
	}
	
	/**
	 * Check if the numerical is a standard numerical
	 * 
	 * @param numerical the type of numerical
	 * @return true if the field is a standard numerical
	 */
	static isStandardNumerical(numerical : string) : boolean {
		return "NUM_STD" === numerical;
	}
	
	/**
	 * Reconvert the numeric data which was converted previously.
	 * 
	 * @param data the data object
	 */
	static reconvertNumericData(data: Data){
		if(data.isConversionActive){
			if (NumericalService.isSignedNumeric(data.numerical)) {
				// if signed numeric, convert input value to program value
				data.value = NumericalService.convertFromSignedNumeric(data.value, data.numericProperties.scale);
				// Convert the initial value back
				data.initialValue = NumericalService.convertFromSignedNumeric(data.initialValue, data.numericProperties.scale);
				data.isConversionActive = false;
				return true;
			} else if (NumericalService.isDigitsOnlyNumeric(data.numerical)) {
				data.value = NumericalService.convertFromUneditedNumericOnly(data.value);
				// Convert the initial value back
				data.initialValue = NumericalService.convertFromUneditedNumericOnly(data.initialValue);
				data.isConversionActive = false;
				return true;
			} else if(NumericalService.isNumerical(data.numerical)){
				data.value = NumericalService.convertFromUneditedNumericOnly(data.value);
				// Convert the initial value back
				data.initialValue = NumericalService.convertFromUneditedNumericOnly(data.initialValue);
				data.isConversionActive = false;
				return true;
			}
		}
		return false;
	}
	
	/**
	 * Check if the numeric type is signed numeric or not.
	 *
	 * @param numerical numeric type
	 * @return true if the type is signed numeric.
	 */
	static isSignedNumeric(numerical: string): boolean {
		return 'NUM_SIGNED' === numerical;
	}
	
	/**
	 * Check if the numeric type is Digits only numeric or not.
	 *
	 * @param numerical numeric type
	 * @return true if the type is digits only numeric.
	 */
	static isDigitsOnlyNumeric(numerical: string): boolean {
		return 'NUM_DIG' === numerical;
	}
	

	/**
	 * Check if a value is numeric or not
	 * 
	 * @param numerical the type of numerical
	 * @return true if the field is a numerical
	 */
	static isNumericValue(value : string) : boolean {
		return /^[ +-.,\d]+$/.test(value);
	}
	
	/**
	 * Check if the value is a valid signed numeric
	 * 
	 * @param value the user input
	 * 
	 * @return true if this is valid
	 */
	static isValidSignedNumeric(value: string): boolean {
		let formattedValue = value.trim();
		return formattedValue === '' || /^[\d \-+]*$/.test(formattedValue);
	}
	
	/**
	 * Check if the value entered respects the numeric format
	 * 
	 * @param value The value to check
	 * @return true if value is valid numeric format
	 */
	static isValidNumericFormat(value: string, numericProperties: NumericProperties): boolean {
	    if(value === undefined){
            return false;
        }
        if(typeof value !== 'string'){
            value = String(value);
        }
	    value = value.replace('-','').trim();
		let scale = numericProperties.scale;
		let precision = numericProperties.precision;
		let split = value.toString().split('.');
		let noLeadingZeroes = parseInt(split[0], 10);
		let wholePart = isNaN(noLeadingZeroes) ? 0 :  noLeadingZeroes.toString().length;
		let decimalPart = split.length == 2 ? split[1].length : 0;
		if((wholePart > precision - scale) || (decimalPart > scale))
		{
			return false;
		}
		return true;
	}

	/**
	 * Convert Decimal format of numerical value depending on config QDECFMT
	 * Replace comma with point and point with comma
	 * 
	 * @param data the value to format
	 * @returns the formatted value
	 */
	static convertDecimalFormat(value : string, qdecfmt : string) : string {
		// Ensure the type is really a string
		if(typeof value !== "string"){
			return value;
		}
	
		if(qdecfmt == "J" || qdecfmt == "I") {
			let result = "";
			for (var ch of value) {
				if (ch == ','){
					result += '.';
				} else if (ch == '.'){
					result += ',';
				} else {
					result += ch;
				}
			}
			return result;
		} else {
			return value;
		}
	}
	
	/**
	 * Converts a program value to signed numeric.
	 *
	 * @param value The value sent by the program
	 * @param scale the number of decimals
	 *
	 * @return The displayed value
	 */
	static convertToSignedNumeric(value: string, scale: number): string {
		scale = scale ? scale : 0;
		// Convert the value to string
		value = String(value);
		value = value.trim();
		let result: string;
		// Populate the last character (sign)
		if (value.indexOf('-') >= 0) {
			value = value.replace('-', '');
			result = '-';
		} else {
			result = ' ';
		}

		let sepLoc = value.indexOf('.');
		if (sepLoc < 0) {
			// substring handles the edge cases
			sepLoc = value.length;
		}
		// Populate the decimals
		result = this.rightPadWith(value.substring(sepLoc + 1, value.length), scale, '0') + result;
		// Populate the integers
		result = value.substring(0, sepLoc) + result;

		// Perform zero suppression
		let start = 0;
		while(result.charAt(start) === '0') {
			start++;
		}
		return result.substring(start);
	}

	/**
	 * Converts signed numeric input to program value.
	 *
	 * @param value The value sent by the program
	 * @param scale the number of decimals
	 *
	 * @return The program value
	 */
	static convertFromSignedNumeric(value: string, scale: number): string {
		scale = scale ? scale : 0;
		value = String(value);
		let result: string = '';
		if (value.indexOf('-') >= 0) {
			result += '-';
			value = value.replace('-', '');
		}
		value = value.trim();
		if(value.length === 0) {
			return '0';
		}
		// Convert all the blanks to zeroes
		value = value.replace(' ', '0');
		if (scale > 0) {
			if (value.length <= scale) {
				result += '0.';
			} else {
				result += value.slice(0, scale * -1) + '.';
			}
			result += this.leftPadWith(value.slice(scale * -1), scale, '0');
		} else {
			result += value;
		}
		return result;
	}
	
	
	/**
	 * Convert program value to unedited numeric value.
	 *
	 * @param value The value sent by the program
	 * @param precision precision
	 * @param scale scale
	 *
	 * @return unedited numeric value
	 */
	static convertToUneditedNumericOnly(value: string, precision: number, scale: number): string {
		let sign = '';
		// If value sent is not numeric => it is DFT value.
		value = String(value);
		if (value.trim() === '') {
			return value;
		}
		value = value.trim();
		// For negative numbers
		// The sign appears in the farthest right display position on
		// output and takes up one of the positions in the display length.
		if(value.indexOf('-') >= 0) {
			value = value.replace('-', '');
			sign = '-';
		}
		let sepLoc = value.indexOf('.');
		if (sepLoc < 0) {
			// substring handles the edge cases
			sepLoc = value.length;
		}
		// Populate the decimals
		let result = this.rightPadWith(value.substring(sepLoc + 1, value.length), scale, '0');
		// Populate the integers
		result = value.substring(0, sepLoc) + result;
		// left pad with zeroes.
		return this.leftPadWith(result + sign, precision, '0');
	}

	/**
	 * Convert unedited numeric input to program value.
	 *
	 * @param value Unedited numeric input
	 *
	 * @return program value
	 */
	static convertFromUneditedNumericOnly(value: string): string {
		value = String(value);
		let sign: string = '';
		// Remove sign for unedited.
		if(value.indexOf('-') >= 0) {
			value = value.replace('-', '');
			sign = '-';
		}
		// Just remove the leading zeroes.
		let start = 0;
		while(value.charAt(start) === '0') {
			start++;
		}
		return sign + (start > 0 ? value.substring(start - 1) : value);
	}

	private static leftPadWith(value: string, length: number, padChar: string) {
		// Only consider the required length
		if (value.length >= length) {
			return value.slice(length * -1);
		}
		return padChar.repeat(Math.max(0, length - value.length)) + value;
	}

	private static rightPadWith(value: string, length: number, padChar: string) {
		// Only consider the required length
		if (value.length >= length) {
			return value.slice(0, length);
		}
		return value + padChar.repeat(Math.max(0, length - value.length));
	}
}
