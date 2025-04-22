import { Injectable } from '@angular/core';
import { NumericalService } from './numerical.service';

const enum MinusSignRule {
	/** The no. */
	NO, 
	/** The left. */
	LEFT, 
	/** The right. */
	RIGHT, 
	/** The cr. */
	CR, 
	/** The all. */
	ALL
}

@Injectable()
export class EditCodeService {
	/* FIELDS ============================================================== */
	static BLANK: string = ' ';
	static ZERO: string = '0';
	static INTEGER_PATTERN: string = '#,###';
	static INTEGER_PATTERN_J: string = "#,##0";

	static QDECFMT: String = "";

	/**
	 * Compute the size value for a numeric field according the given edit code
	 * 
	 * @param numericRange the number to process
	 * @param editCode the edit code to use to format the number
	 * @param currency the currency to include in the result
	 * @return the size value for a numeric field according the given edit code
	 */
	static buildValue(rawValue : String, fieldSize: number, decSize: number, editCode : string, qdecfmt : string) : string {
		this.QDECFMT = qdecfmt;
		// Reformat the number to business value so the value can be handled as a Number
		rawValue = NumericalService.convertDecimalFormat(rawValue.toString(), qdecfmt);

		const chars = editCode.split(' ');
		let currency = null;
		if(chars.length > 1){
			currency = chars[1];
		}
		editCode = chars[0];

		let result = "";
		let fractionalFormat = null;
			
		if (!EditCodeService.isNumber(rawValue.toString())) {
			return rawValue.toString();
		}

		if(decSize>0){
			fractionalFormat = "0".repeat(decSize);

			// for decimal number, if the decimal separator is not displayed we take the unscaled value
			if(!EditCodeService.isDecimalPointsDisplayed(editCode)){
				rawValue = rawValue.replace(EditCodeService.getDecimalSeparator(), '');
			}
		}

		// Remove grouping separator if present.
		let numberValue = Number(rawValue.replace(/,/g, ''));


		// specific case when Zero Balance
		if (numberValue == 0) {
			if (EditCodeService.isDisplayZeroBalance(editCode)) {
				// no decimal positions
				if (fractionalFormat == null) {
					result = "0";
				} else {
					result = EditCodeService.buildZeroValue(fractionalFormat);
				}
			} else {
				result = "";
			}
		} else {
            // not a Zero Balance
			var dollarFormat = EditCodeService.numberFormat(editCode, decSize);

		    // format the number with the target formatter
			result = dollarFormat.format(numberValue);

			if(this.QDECFMT != "J"){
				result = EditCodeService.removeUnitZero(result, numberValue);
			}
		}

		// add sign if required
		result = EditCodeService.handleSign(result, numberValue < 0, editCode);

		// add currency if required 
		result = EditCodeService.handleCurrency(result, currency);
		
		if (fieldSize > result.length) {
			let padChar = EditCodeService.isSuppressZeroes(editCode) ? EditCodeService.BLANK : EditCodeService.ZERO;
			result  = EditCodeService.padLeft(result, fieldSize, padChar); 
		}
		
		return result;
	}

	/**
	 * Build the string value for the number 0
	 *  Blank value of QDECFMT > .00
	 *	I value of QDECFMT     > ,00
	 *	J value of QDECFMT     > 0,00
	 * @param fractionalFormat
	 * @return the string value for the number 0
	 */
	 static buildZeroValue(fractionalFormat : string) : string {
		let sbZero = '';
		if (EditCodeService.QDECFMT == "J") {
			sbZero += "0";
		}
		sbZero += EditCodeService.getDecimalSeparator() + fractionalFormat;
		return sbZero.toString();
	}

	static isNumber(value: string | number): boolean
	{
	   return ((value != null) &&
			   (value !== '') &&
			   !isNaN(Number(value.toString().replace(/,/g, ''))));
	}

	static numberFormat(editCode : string, decSize : number) : Intl.NumberFormat {
		const options = {style: 'decimal'};

		if(EditCodeService.isGroupingSepDisplayed(editCode)) {
			options['useGrouping'] = true;
		} else {
			options['useGrouping'] = false;
		}	

		options['maximumFractionDigits'] = decSize;
		options['minimumFractionDigits'] = decSize;
		options['minimumIntegerDigits '] = 2;

		let minusSignRule = EditCodeService.determineMinusSignRule(editCode);
		if(minusSignRule == MinusSignRule.ALL) {
			options['signDisplay'] = 'always';
		} else if( minusSignRule == MinusSignRule.LEFT) {
			options['signDisplay'] = 'auto';
		} else {
			options['signDisplay'] = 'never';
		}

		let region = this.QDECFMT == "J" || this.QDECFMT == "I" ? 'de-DE' : 'en-US';
		return new Intl.NumberFormat(region, options);
	}

	static isDisplayZeroBalance(editCode : String) : boolean {
		let isDisplayZeroBalance = true;
		// DisplayZeroValue
		switch (editCode) {
		case "2":
		case "4":
		case "B":
		case "D":
		case "K":
		case "M":
		case "O":
		case "Q":
		case "Z":
			isDisplayZeroBalance = false;
			break;
		}
		return isDisplayZeroBalance;
	}

	static getDecimalSeparator() : string {
		return (this.QDECFMT == "J" || this.QDECFMT == "I") ? ',': '.';
	}

	/**
	 * When you specify floating currency symbol, the symbol appears to the left of the first significant digit.
	 *
	 * @param result the result
	 * @param currency the currency
	 * @return the string
	 */
	private static handleCurrency(result: string, currency: string) : string {
		if (result.trim().length > 0 && currency !== null && currency !== '') {
			result = currency + result;
		}
		return result;
	}

	/**
	 * set the sign to the right or to the left according minusSignRule.
	 *
	 * @param result the result
	 * @param isNegativeNumber the is negative number
	 * @param editCode the edit code
	 * @return the string
	 */
	private static handleSign(result : string, isNegativeNumber : boolean, editCode : string) : string {
		let minusSignRule = EditCodeService.determineMinusSignRule(editCode);
		if (minusSignRule == MinusSignRule.RIGHT || minusSignRule == MinusSignRule.CR) {
			// negative number
			if (isNegativeNumber) {
				result = result + EditCodeService.getMinusSignForMinusSignRule(minusSignRule);
			} else {
				// Positive number
				// reserve the space for the plus sign
				if (minusSignRule == MinusSignRule.CR) {
					result = result + "  ";
				} else {
					result = result + EditCodeService.BLANK;
				}
			}
		} 
		
		return result;
	}

		/**
	 * Determine minus sign rule.
	 *
	 * @param editCode the edit code
	 * @return the minus sign rule
	 */
	private static determineMinusSignRule(editCode: string) : MinusSignRule {
		let minusSign = MinusSignRule.NO;
		// MinusSign
		switch (editCode) {
		case "1":
		case "2":
		case "3":
		case "4":
		case "W":
		case "Z":
			minusSign = MinusSignRule.NO;
			break;
		case "A":
		case "B":
		case "C":
		case "D":
			minusSign = MinusSignRule.CR;
			break;
		case "J":
		case "K":
		case "L":
		case "M":
			minusSign = MinusSignRule.RIGHT;
			break;
		case "X":
		    // Do not reserve space for sign
			minusSign = MinusSignRule.NO;
			break;
		case "N":
		case "O":
		case "P":
		case "Q":
			minusSign = MinusSignRule.LEFT;
			break;
		}
		return minusSign;
	}

	/**
	 * Gets the minus sign for minus sign rule.
	 *
	 * @param minusSignRule the minus sign rule
	 * @return the minus sign for minus sign rule
	 */
	static getMinusSignForMinusSignRule(minusSignRule : MinusSignRule) : string {
		let minusSign = "-";
		if (minusSignRule == MinusSignRule.CR) {
			minusSign = "CR";
		}
		return minusSign;
	}

	/**
	 * Checks if is commas displayed.
	 *
	 * @param editCode the edit code
	 * @return true, if is commas displayed
	 */
	static isGroupingSepDisplayed(editCode : string) : boolean {
		let isCommasDisplayed = false;
		switch (editCode) {
		case "1":
		case "2":
		case "A":
		case "B":
		case "J":
		case "K":
		case "N":
		case "O":
			isCommasDisplayed = true;
			break;
		}
		
		return isCommasDisplayed;
	}

	/**
	 * Checks if is decimal points displayed.
	 *
	 * @param editCode the edit code
	 * @return true, if is decimal points displayed
	 */
	private static isDecimalPointsDisplayed(editCode : string) : boolean {
		let isDecimalPointsDisplayed = false;
		switch (editCode) {
		case "1":
		case "2":
		case "3":
		case "4":
		case "A":
		case "B":
		case "C":
		case "D":
		case "J":
		case "K":
		case "L":
		case "M":
		case "N":
		case "O":
		case "P":
		case "Q":
			isDecimalPointsDisplayed = true;
			break;
		case "W":
			break;
		case "Y":
			return false;
		case "Z":
		case "X":
			break;
		}
		
		return isDecimalPointsDisplayed;
	}
	
	private static isSuppressZeroes(editCode: string): boolean {
		return editCode !== 'X';
	}

	static padLeft = (value: string, length: number, character: string = '0'): string => {
		for (let i = value.length; i < length; ++i) {
			value = character + value;
		}
		return value;
	}


	  static removeUnitZero(value : string, numberValue: number) : string {
		if(Math.abs(numberValue) < 1 ){
			let index = value.indexOf('0'+EditCodeService.getDecimalSeparator());
			value = value.slice(0, index) + value.slice(index+1);
		}
		return value;
	  }
}
