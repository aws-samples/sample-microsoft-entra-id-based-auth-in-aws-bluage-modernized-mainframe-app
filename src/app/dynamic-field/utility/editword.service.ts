import { NumericalService } from './numerical.service';

/**
 * The Enum EditWordBodyRule.
 */
const enum EditWordBodyRule {
	
	/** The blank. */
	BLANK, 
	
	/** The decimals and commas. */
	DECIMALS_AND_COMMAS, 
	
	// The first zero in the body of the edit word is interpreted as an end-zero-suppression character. 
	// This zero is placed where zero suppression is to end. 
	// The first asterisk in the body of an edit word also ends zero suppression
	/** The zeros or asterisk. */
	// If an asterisk is used as an end-zero-suppression character, all leading zeros that are suppressed are replaced with asterisks in the output
	ZEROS_OR_ASTERISK, 
	
	// A currency symbol followed directly by a first zero in the edit word (end-zero-suppression character) is said to float. 
	/** The float currency symbol. */
	// All leading zeros are suppressed in the output and the currency symbol appears in the output immediately to the left of the most significant digit.
	FLOAT_CURRENCY_SYMBOL,
			
	// If the currency symbol is put into the first position of the edit word, 
	/** The fix currency symbol. */
	// then it will always appear in that position in the output. 
	FIX_CURRENCY_SYMBOL,

	/** The ampersand. */
	AMPERSAND, 
	
	/** The constants. */
	CONSTANTS
}		

export class EditWordService {

	
	/** The Constant CURRENCY. */
	private static CURRENCY : string = "$";
	
	/** The Constant ASTERISK. */
	private static ASTERISK : string = "*";
	
	/** The Constant MINUSCR. */
	private static MINUSCR = "CR";
	
	/** The Constant MINUS_. */
	private static MINUS_ : string = "-";
	
	/** The Constant AMPERSAND. */
	private static AMPERSAND : string = "&";
	
	/** The Constant ZERO. */
	private static ZERO : string = "0";
	
	/** The Constant BLANK. */
	private static BLANK : string = " ";

	/** The body. */
	private static body : string = null;
	
	/** The status. */
	private static status : string = null;
	
	/** The expansion. */
	private static expansion : string = null;
	
	/** The list of body elt. */
	private static listOfBodyElt: BodyElement[] = [];
	
	/** The end zero suppression value. */
	private static endZeroSuppressionValue : string = null;
	
	/** The end zero suppression currency. */
	private static endZeroSuppressionCurrency : string = null;

	/**
	 * Compute the formated value for a numeric according the given editword.
	 *
	 * @param number 			the numeric to be formated
	 * @param editword          define the rules to format          
	 * @param length          the length of the number          
	 * @param decimalPosition          the decimalPosition of the number          
	 * @return 			the string formated value of the numeric
	 */
	public static buildValue(number : string, editword : string, decimalPosition : number, qdecfmt : string) : string {
		EditWordService.listOfBodyElt = [];
		EditWordService.decomposeEditword(editword);
		let bodyContentSize = EditWordService.computeBody(EditWordService.body);
		
		// Reformat the number to business value so the value can be handled as a Number
		number = NumericalService.convertDecimalFormat(number.toString(), qdecfmt);

		// call computeOutput with bodyContentSize as size
		return EditWordService.computeOutput(Number(number), bodyContentSize, decimalPosition);
	}

	/**
	 * Compute output.
	 *
	 * @param number the number
	 * @param length the length
	 * @param decimalPosition the decimal position
	 * @return the string
	 */
	private static computeOutput(number : number, length : number, decimalPosition : number) : string {
		let result = '';

		// format the number with the target formatter
		let numberAsString; 
		if (decimalPosition > 0) {
			let decimalFormat = EditWordService.numberFormat(length, decimalPosition);
			//new DecimalFormat(StringUtils.repeat(ZERO, length-decimalPosition) + "." + StringUtils.repeat(ZERO, decimalPosition));
			numberAsString = decimalFormat.format(number);
			numberAsString = numberAsString.replace(".", "");
			numberAsString = numberAsString.replace(",", "");
		} else {
			let decimalFormat = EditWordService.numberFormat(length, 0);
			numberAsString = decimalFormat.format(number);
		}
		let isNegativeNumber = numberAsString.startsWith(EditWordService.MINUS_);
		if (isNegativeNumber) {
			numberAsString = numberAsString.substring(1);
		}
		
		// 1 compute with the body
		result += EditWordService.computeOutputWithBody(numberAsString);

		// 2 compute with the status
		if (EditWordService.status != null) {
			result += EditWordService.computeStatus(isNegativeNumber);
		}
		
		// 2 compute with the expansion
		if (EditWordService.expansion != null) {
			result += EditWordService.computeExpansion();
		}

		return result;
	}

	/**
	 * Compute status.
	 *
	 * @param isNegativeNumber the is negative number
	 * @return the string
	 */
	private static computeStatus(isNegativeNumber : boolean) : string {
		if (isNegativeNumber) {
			return EditWordService.status.replace(EditWordService.AMPERSAND, EditWordService.BLANK);
		} else {
			return EditWordService.BLANK.repeat(EditWordService.status.length);
		}
	}

	/**
	 * Compute expansion.
	 *
	 * @return the string
	 */
	private static computeExpansion() : string {
		return EditWordService.expansion.replace(EditWordService.AMPERSAND, EditWordService.BLANK);
	}

	static numberFormat(intSize : number, decSize : number) : Intl.NumberFormat {
		const options = {style: 'decimal'};
		options['maximumFractionDigits'] = decSize;
		options['minimumFractionDigits'] = decSize;
		options['minimumIntegerDigits'] = intSize;
		options['useGrouping'] = false;

		return new Intl.NumberFormat('en-US', options);
	}

	/**
	 * this method builds the body output 
	 * It puts the digits of the number according the body pattern.
	 *
	 * @param numberAsString the number as string
	 * @return the body output
	 */
	private static computeOutputWithBody(numberAsString : string) : string {
		let result : string[] = [];
		let isLeadingZeros = false;

		let reverseNumber = EditWordService.reverse(numberAsString);
		let reverselistOfBodyElt = EditWordService.listOfBodyElt.reverse();
		
		// when no stops zero suppression is defined, then all leading zero are suppressed
		let stopsZeroSuppressiond = false;
		EditWordService.endZeroSuppressionValue = null;
		for(var bodyElement of EditWordService.listOfBodyElt){
			if(bodyElement.getBodyRule() == EditWordBodyRule.ZEROS_OR_ASTERISK || bodyElement.getBodyRule() == EditWordBodyRule.FLOAT_CURRENCY_SYMBOL){
				stopsZeroSuppressiond = true;
				break;
			}
		}

		if (!stopsZeroSuppressiond) {
			EditWordService.endZeroSuppressionValue = EditWordService.BLANK;
		}
		
		// go thru the body from the right to the left
		for (var bodyElement of reverselistOfBodyElt) {
			
			// determine if there are only leading zeros left 
			if (!isLeadingZeros && reverseNumber.length > 0) {
				isLeadingZeros = Number(reverseNumber) == 0;
			}
			
			// compute according current EditWordBodyRule
		    if (bodyElement.getBodyRule() == EditWordBodyRule.FIX_CURRENCY_SYMBOL) {
				result.push(bodyElement.getValue());
		    } else if (bodyElement.getBodyRule() == EditWordBodyRule.FLOAT_CURRENCY_SYMBOL) {
				EditWordService.endZeroSuppressionValue = EditWordService.BLANK;
		    	EditWordService.endZeroSuppressionCurrency = bodyElement.getValue();
				reverseNumber = EditWordService.computeCharForDigit(result, reverseNumber, isLeadingZeros);
		    } else if (bodyElement.getBodyRule() == EditWordBodyRule.ZEROS_OR_ASTERISK) {
				EditWordService.endZeroSuppressionValue = bodyElement.getValue();
				reverseNumber = EditWordService.computeCharForDigit(result, reverseNumber, isLeadingZeros);
			} else if (bodyElement.getBodyRule() == EditWordBodyRule.AMPERSAND) {
				result.push(EditWordService.BLANK);
			} else if (bodyElement.getBodyRule() == EditWordBodyRule.BLANK) {
				reverseNumber = EditWordService.computeCharForDigit(result, reverseNumber, isLeadingZeros);
			} else if (bodyElement.getBodyRule() == EditWordBodyRule.CONSTANTS) {
				EditWordService.computeCharForConstant(result, bodyElement, isLeadingZeros);
			} else if (bodyElement.getBodyRule() == EditWordBodyRule.DECIMALS_AND_COMMAS) {
				EditWordService.computeCharForDecimalSep(result, bodyElement, isLeadingZeros);
			}
		}
		
		return EditWordService.reverse(result.join(""));
	}
	
	/**
	 * Compute the char for the output for according end Zero Suppression rules
	 * Uses endZeroSuppressionCurrency if endZeroSuppressionValue and isLeadingZeros and endZeroSuppressionCurrency
	 *      endZeroSuppressionValue if endZeroSuppressionValue and isLeadingZeros,
	 *      replace1 if isLeadingZeros
	 *      replace2 otherwise.
	 *
	 * @param result the result
	 * @param isLeadingZeros the is leading zeros
	 * @param replace1 the replace 1
	 * @param replace2 the replace 2
	 */
	private static computeChar(result : string[], isLeadingZeros : boolean, replace1 : string, replace2 : string) {
		if (EditWordService.endZeroSuppressionValue != null && isLeadingZeros) {
			if (EditWordService.endZeroSuppressionCurrency != null) {
				result.push(EditWordService.endZeroSuppressionCurrency);
				EditWordService.endZeroSuppressionCurrency = null;
			} else {
				result.push(EditWordService.endZeroSuppressionValue);
			}
		} else if (isLeadingZeros) {
			result.push(replace1);
		} else {
			result.push(replace2);
		}
	}

	/**
	 * Compute the char for the output for a decimal separator
	 * In a standard case, the current decimal separator is used.
	 *
	 * @param result the result
	 * @param bodyElement the body element
	 * @param isLeadingZeros the is leading zeros
	 */
	private static computeCharForDecimalSep(result : string[], bodyElement : BodyElement, isLeadingZeros : boolean) {
		EditWordService.computeChar(result, isLeadingZeros, bodyElement.getValue(), bodyElement.getValue());
	}

	/**
	 * Compute the char for the output for a constant value
	 * In a standard case, the current digit of constant is used.
	 * It is blanked if we are in the leading zeros area
	 * Manage the end zero Suppression and the float currency
	 *
	 * @param result the result
	 * @param bodyElement the body element
	 * @param isLeadingZeros the is leading zeros
	 */
	private static computeCharForConstant(result : string[], bodyElement : BodyElement, isLeadingZeros : boolean) {
		EditWordService.computeChar(result, isLeadingZeros, bodyElement.getValue(), bodyElement.getValue());
	}

	/**
	 * Compute the char for the output for a digit value
	 * In a standard case, the current digit of the temporary number is used
	 * Manage the end zero Suppression and the float currency
	 * The current digit is removed from the temporary number.
	 *
	 * @param result the result
	 * @param reverseNumber the reverse number
	 * @param isLeadingZeros the is leading zeros
	 * @return the string
	 */
	private static computeCharForDigit(result : string[], reverseNumber : string, isLeadingZeros : boolean) : string {
		let replace = "" + reverseNumber.charAt(0);
		EditWordService.computeChar(result, isLeadingZeros, replace, replace);
		return reverseNumber.substring(1);
	}

	private static reverse(str : string) : string {
		let reverseString = "";
		for (let char of str) {
		reverseString = char + reverseString;
		}
		return reverseString;
	}

	/**
	 * This method decomposes the editword to determine the 3 elements
	 * - body : mandatory
	 * - status (sign) : optional
	 * - expansion : optional.
	 *
	 * @param editword the editword
	 */
	private static decomposeEditword(editword : string) {
		EditWordService.status = null;
	    EditWordService.expansion = null;
	    	
		// examples of mask
		// '0 :  : '
		// '  -  -   0'
		// '$ ,   ,  **Dollars&  &Cents'
		// '0 &HRS&;  &MINS&;  &SECS' 
		
		// 1 : the body > the end of the body is the last space
		let tempEditword = editword;
		let lastSpace = editword.lastIndexOf(EditWordService.BLANK, editword.length) + 1;
		EditWordService.body = editword.substring(0, lastSpace);
		if (lastSpace == editword.length) {
			EditWordService.status = null;
			EditWordService.expansion = null;
			return;
		} else {
			tempEditword = tempEditword.substring(lastSpace);
		}
		
		// the end of the body could be a leading zero od asterisk
		if (tempEditword.startsWith(EditWordService.ZERO) || tempEditword.startsWith(EditWordService.ASTERISK)) {
			EditWordService.body = EditWordService.body + tempEditword.substring(0, 1);
			tempEditword = tempEditword.substring(1, tempEditword.length);
		}
		
		// 2 : the status > optional
		let isStatusFound = false;
		let beginPosMinus = tempEditword.indexOf(EditWordService.MINUS_);
		let endPosMinus = 0;
		if (beginPosMinus != -1) {
			isStatusFound = true;
			endPosMinus = beginPosMinus + 1;
		} else {
			beginPosMinus = tempEditword.indexOf(EditWordService.MINUSCR);
			if (beginPosMinus != -1) {
				isStatusFound = true;
				endPosMinus = beginPosMinus + 2;
			}
		}
		if (isStatusFound) {
			EditWordService.status = tempEditword.substring(0, endPosMinus);

			// there is an expansion after the status
			if (endPosMinus < tempEditword.length) {
				tempEditword = tempEditword.substring(endPosMinus, tempEditword.length); 
			} else {
				return;

			}
		}
		
		// 3 : the expansion > optional
		// The expansion starts at the first position to the right of the status 
		// (or body, if status is not specified) and ends with the farthest right character of the edit word.
		if (tempEditword !== '') {
			EditWordService.expansion = tempEditword;
		}
	}

	/**
	 * Go thru the body of the editword and fill a corresponding list of BodyElement
	 * For now, there is one BodyElement by digit of the body
	 * @param editwordBody String
	 * @param length the length 
	 * @return the number of replaceable character in the body 
	 */
	private static computeBody(editwordBody : string) : number {
		let firstZeroOrAsterisk = true;
		let bodyContentSize = 0;
		
		for (let i = 0; i < editwordBody.length; i++) {
			let currentChar = editwordBody.charAt(i);
			let currentBodyElement : BodyElement;

			switch (currentChar) {
			case ' ':
				currentBodyElement = new BodyElement(EditWordBodyRule.BLANK);
				bodyContentSize++;
				break;
			case '.':
			case ',':
				currentBodyElement = new BodyElement(EditWordBodyRule.DECIMALS_AND_COMMAS);
				currentBodyElement.setValue(""+ editwordBody.charAt(i));
				break;
			case '0':
				if (firstZeroOrAsterisk) {
					currentBodyElement = new BodyElement(EditWordBodyRule.ZEROS_OR_ASTERISK);
					currentBodyElement.setValue(EditWordService.BLANK);
					firstZeroOrAsterisk = false;
				} else {
					currentBodyElement = new BodyElement(EditWordBodyRule.CONSTANTS);
					currentBodyElement.setValue(EditWordService.ZERO);
				}
				bodyContentSize++;
				break;
			case '*':
				if (firstZeroOrAsterisk) {
					currentBodyElement = new BodyElement(EditWordBodyRule.ZEROS_OR_ASTERISK);
					currentBodyElement.setValue(EditWordService.ASTERISK);
					firstZeroOrAsterisk = false;
				} else {
					currentBodyElement = new BodyElement(EditWordBodyRule.CONSTANTS);
					currentBodyElement.setValue(EditWordService.ASTERISK);
				}
				bodyContentSize++;
				break;
			case '$':
				if (i == 0) {
					currentBodyElement = new BodyElement(EditWordBodyRule.FIX_CURRENCY_SYMBOL);
			    } else if (i != 0 && editwordBody.charAt(i+1) == '0' && firstZeroOrAsterisk) {
					// 2 body elements : a BLANK and a FLOAT_CURRENCY_SYMBOL
			    	currentBodyElement = new BodyElement(EditWordBodyRule.BLANK);
					EditWordService.listOfBodyElt.push(currentBodyElement);
					bodyContentSize++;
					i++;
					currentBodyElement = new BodyElement(EditWordBodyRule.FLOAT_CURRENCY_SYMBOL);
					bodyContentSize++;
				} else {
					currentBodyElement = new BodyElement(EditWordBodyRule.CONSTANTS);
				}
				currentBodyElement.setValue(EditWordService.CURRENCY);
				break;
			case '&':
				currentBodyElement = new BodyElement(EditWordBodyRule.AMPERSAND);
				break;
			default :
				currentBodyElement = new BodyElement(EditWordBodyRule.CONSTANTS);
				currentBodyElement.setValue(""+ editwordBody.charAt(i));
			}
			EditWordService.listOfBodyElt.push(currentBodyElement);
		}
		
		return bodyContentSize;
		
	}

}

/**
 * class to represent an element of the editword body.
 */
class BodyElement {
	
	/** The body rule. */
	bodyRule : EditWordBodyRule;
	
	/** The value. */
	value : string;
	
	/**
	 * Instantiates a new body element.
	 *
	 * @param bodyRule the body rule
	 */
	public constructor(bodyRule : EditWordBodyRule) {
		this.bodyRule = bodyRule;
	}
	
	/**
	 * Gets the body rule.
	 *
	 * @return the body rule
	 */
	public getBodyRule() : EditWordBodyRule {
		return this.bodyRule;
	}
	
	/**
	 * Gets the value.
	 *
	 * @return the value
	 */
	public getValue() : string {
		return this.value;
	}
	
	/**
	 * Sets the value.
	 *
	 * @param value the new value
	 */
	public setValue(value : string) {
		this.value = value;
	}		
}
