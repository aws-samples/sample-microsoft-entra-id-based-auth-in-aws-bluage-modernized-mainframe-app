
export abstract class MaskFieldComponent {

    protected isFixedCharacterMask(maskChar: string): boolean {
		return '0' != maskChar && 'A' != maskChar && 'S' != maskChar;
	}

	protected getOffSetIndexRawValue(maskValue: string, start: number): number {
		let indexRaw : number =0;
		for (let i = 0; i < maskValue.length && i < start; i++) {

			let maskChar = maskValue.substring(i,i+1);
			if (!this.isFixedCharacterMask(maskChar)) {
				indexRaw++;
			}
		}

		return indexRaw;
	}

    protected getCursorPositionRaw(maskValue: string, formatedValue: string, cursorPositionStart: number, cursorPositionEnd: number): {start: number, end: number, offset: number } {
        let newCursorPositionStart = cursorPositionStart;
        let newCursorPositionEnd = cursorPositionEnd;
        let offset = 0;

        for (let index = 0; index < maskValue.length; index++) {
            const element = maskValue[index];
            if(this.isFixedCharacterMask(element)){
                if(index < cursorPositionStart){
                    newCursorPositionStart--;
                    newCursorPositionEnd--;
                } else if(index >= cursorPositionStart && index < cursorPositionEnd){
                    newCursorPositionEnd--;
                }

                if(index <= cursorPositionStart){
                    offset++;
                }
            }
        }
        return { start: newCursorPositionStart, end: newCursorPositionEnd,offset:offset };
    }

    protected formatRawValue(rawValue: string, maskValue: string): string{
        if(!!maskValue){
            return this.formatMaskedValue(maskValue, rawValue);
        } return rawValue;
    }

	protected getRawValue(maskValue: string, formatedValue: string): string {

		let rawValue : string ="";
		for (let i = 0; i < formatedValue.length; i++) {

			let maskChar = maskValue.substring(i,i+1);
			if (!this.isFixedCharacterMask(maskChar)) {
				rawValue += formatedValue.substring(i,i+1);
			}
		}
        rawValue += ' '.repeat(formatedValue.length - rawValue.length);
		return rawValue;
	}

	protected formatMaskedValue(maskValue: string, rawValue: string): string {
		let formatedValue : string = "";
		let nb = 0;

		for (let i = 0; i < maskValue.length; i++) {

			let maskChar = maskValue.substring(i,i+1);
			if (i-nb < rawValue.length){
				if (this.isFixedCharacterMask(maskChar)) {
					formatedValue+=maskChar;
					nb++;
				} else {
					formatedValue += rawValue.substring(i-nb,i-nb+1);
				}
			}
		}
		
		return formatedValue;
	}

    protected getFixedCharactersCount(maskValue: string, start: number = 0, end: number = maskValue.length): number {
        let count = 0;
        for(let i = start; i <= end; i++){
            if(this.isFixedCharacterMask(maskValue[i])){
                count++;
            }
        }
        return count
    }

    protected isFixedCharAtPos(formatedValue: string, maskValue: string, cursorPos: number){
        let res = false;
        if(cursorPos - 2 > 0){
            if(this.isFixedCharacterMask(maskValue[cursorPos-1])){
                res = true;
            }
        }
        return res;
    }
}