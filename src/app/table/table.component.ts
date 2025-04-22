import {Component, ContentChild, Input, TemplateRef} from '@angular/core';
import { LanguageService } from '../language/language-service';

export enum Paging {
    File = 0,
	Done,
	Component,
	Invalid
}

@Component({
    moduleId: module.id,
    selector: 'app-table',
    templateUrl: './table.component.html'
})

export class TableComponent {
    @ContentChild(TemplateRef) templateRef: TemplateRef<any>;

    @Input() rows: any[];
    @Input() nbLinesByRow: number;
    @Input() nbDisplayedEntries: number;
    @Input() startLineNumber: number;
    @Input() windowOffset: number;
    @Input() isArrayMessageLine: boolean;

    /* CONSTRUCTORS ======================================================== */
    constructor( private languageService: LanguageService ) {
    }

    // End of array
    private end: boolean;
    private bottom: boolean;

    // If valued to "MORE" used pair More/Bottom
    // else used pair +/[empty]
    private pageDown: String;

    // Index from which display array items
    private recordNumber: number = 0;
    private top: true;

    // Nb record by page
    private numberOfRecordsPerPage: number = 0;

    private labelMore:string  = "More";
    private labelBottom:string = "Bottom";
    
    private dspMode: string = "*DS3";
    
    // Display table or not
    public display: true;
    
    // Drop status : TRUE = folded (expanded); FALSE = dropped (collapsed or truncated)
    public dropped: boolean = false;
    public dropCommand: String;
	public foldCommand: String;
    public dropFoldClassName: string = undefined;
    
    ngOnInit(): void {
        if (this.rows['attributes'] !== undefined) {
       		let attributes = this.rows['attributes'];
	        this.dropCommand = attributes.dropCommand;
	        this.foldCommand = attributes.foldCommand;

            // Initialize dropped flag and relative className
            if(this.dropCommand && this.foldCommand) {
                this.dropFoldClassName = 'fold_line';
                this.dropped = true;
            } else if (this.foldCommand) {
                this.dropFoldClassName = 'fold_line';
                this.dropped = true;
            } else if (this.dropCommand) {
                this.dropFoldClassName = 'drop_line';
                this.dropped = false;
            }
            this.dspMode = attributes.dspMode;
            this.end= attributes.end;
            if (this.rows.length > 0) {
                this.pageDown = attributes.pageDown;
                this.setRecordNumber(attributes.recordNumber);
                if (!this.recordNumber) {
                    this.setRecordNumber(0);
                } else {
                    this.setRecordNumber(this.recordNumber - 1); 
                }
                this.top = attributes.top;
                this.display = attributes.display;
                this.numberOfRecordsPerPage = attributes.numberOfRecordsPerPage;
                this.bottom = this.isAtBottom();          
                this.changeLabels();
            }
        }
    }

	public keyEvent(event: KeyboardEvent) { 

        let nbDisplayedEntriesLoc = this.getNbDisplayedEntries();
        if(event.key === 'PageDown') {
            // recordNumber is incremented when its not at the end of buffer.
            if(this.isEndOfBuffer()) {
                return true;
            }
            this.setRecordNumber(this.recordNumber + nbDisplayedEntriesLoc);
            return this.recordNumber > this.rows.length - 1;
		} else if(event.key === 'PageUp') {
			let recNum = this.recordNumber - nbDisplayedEntriesLoc;
            if (recNum < 0) {
                this.setRecordNumber(0);
                return true;
            }
            this.setRecordNumber(recNum);
            return this.rows[this.recordNumber] == undefined;
        }
	}
	
    isEndOfBuffer() : boolean {
        return (this.recordNumber + this.getNbDisplayedEntries()) >= this.rows.length;
    }

    isAtBottom() : boolean {
        // End of buffer
        let endBuffer =  (this.recordNumber + this.getNbDisplayedEntries()) >= this.rows.length;
        
        let endAll = endBuffer;

        // AND end backend flag
        endAll = endAll && this.end;
        return endAll;
    }

    setRecordNumber(recordNumber: number) {
        this.recordNumber = recordNumber;
        this.bottom = this.isAtBottom();
    }

    getRecordNumber() : number {
        return this.recordNumber;
    }

    public updateAttribute(attr: any) { 

        if(attr.dspMode){
            this.dspMode = attr.dspMode;
        }
        if(attr.dropCommand){
            this.dropCommand = attr.dropCommand;
        }
        if(attr.foldCommand){
            this.foldCommand = attr.foldCommand;
        }
        if(attr.pageDown){
            this.pageDown = attr.pageDown;
        }
        if(attr.end){
            this.end = attr.end;
        }
        if (!attr.recordNumber) {
            this.setRecordNumber(0);
        } else if(this.rows.length != 0 && attr.recordNumber > this.rows.length - 1){
            this.setRecordNumber(this.rows.length - 1); 
        } else if(attr.recordNumber <0){
            this.setRecordNumber(0);
        } else {
            this.setRecordNumber(attr.recordNumber - 1); 
        }
        if(attr.top){
            this.top = attr.top;
        }
        if(attr.display){
            this.display = attr.display;
        }
        this.changeLabels();
	}
	
    changeLabels(): void {
        if (this.pageDown == "MORE" ) {
            this.labelMore  = "More";
        } else if (this.pageDown == "PLUS" ) {
            this.labelMore  = "Plus";
        } else {
            this.labelMore  = "Empty";
        }
    }

    getEndLabel(): String {
        if (this.end && this.bottom) {
            if (!this.isArrayMessageLine) {
                return this.languageService.translate(this.labelBottom);
            }
        } else {
            return this.languageService.translate(this.labelMore);
        }
    }

    // Compute class to apply for indicator label
    positionLabel(): String {

        let classes = "tab_end_ind ";
        let isA7: boolean = this.dspMode === "*DS4";
        let defaultWidth = isA7 ? 132 : 80;

        if (this.isAtBottom()) {
            let lengthLabel = this.languageService.translate(this.labelBottom).length;
            // -1
            //lengthLabel -= lengthLabel;
            if ( this.labelBottom == "Bottom") {
                if (this.windowOffset == undefined) {
                    classes += "lgo_" + (defaultWidth - lengthLabel)  + " ";
                } else {
                    classes += "lgo_" + (this.windowOffset - 1 - lengthLabel) + " ";
                }
                classes += "lgr_0" + lengthLabel + " ";
            } else {
                // Nothing, disable by ngIf
                return "";
            }
        } else {
            let lengthLabel = this.languageService.translate(this.labelMore).length;
            if ( this.labelMore == "More") {
                if (this.windowOffset == undefined) {
                    classes += "lgo_" + (defaultWidth - lengthLabel)  + " ";
                } else {
                    classes += "lgo_" + (this.windowOffset - 1 - lengthLabel) +  " ";
                }
                classes += "lgr_0" + lengthLabel + " ";
            } else {
                classes += "lgo_" + (defaultWidth - 2) + " ";
                classes += "lgr_03 ";
            }
        }
        
        classes += "white";

        return classes;
    }

    getNbDisplayedEntries(): number {
        if (this.dropped || (!this.dropCommand && !this.foldCommand)) {
            return this.nbDisplayedEntries;
        } 

        let nbDisplayedEntriesLoc = this.nbDisplayedEntries;
        if (this.nbLinesByRow) {
            nbDisplayedEntriesLoc = this.nbDisplayedEntries * this.nbLinesByRow;
        }

        return nbDisplayedEntriesLoc;
    }

    // Return true if the element must be displayed
    displayed(index: number): boolean {
        let display = false;
        
        if (this.top) {
            let nbFirst :number = this.recordNumber;
            let nbLast :number = nbFirst + this.getNbDisplayedEntries() - 1;

            if (index >= nbFirst && index <= nbLast) {
                display = true;
            }
        } else {

            if (this.getNbDisplayedEntries() != 0) {
                let pageNbBeforeItem : number = this.recordNumber / this.getNbDisplayedEntries();
                let nbFirst :number = parseInt(String(pageNbBeforeItem)) * this.getNbDisplayedEntries();
                let nbLast :number = nbFirst + this.getNbDisplayedEntries() - 1;

                if (index >= nbFirst && index <= nbLast) {
                    display = true;
                }
            } else {
                console.log("Cannot display array items because number of items by page is zero");
            }
        }

        return display;
    }

    // Compute the number of empty lines in the last page
    getNbEmptyLines(): number {
        if (this.nbDisplayedEntries !== 0 && this.isAtBottom()) {
            if (this.rows.length < this.nbDisplayedEntries) {
                return this.nbDisplayedEntries - this.rows.length;
            }
            if (this.recordNumber + this.nbDisplayedEntries > this.rows.length) {
                return this.nbDisplayedEntries - (this.rows.length % this.nbDisplayedEntries);
            }
        }
        return 0;
    }
    
    // Compute style to apply in order to put "+" indicator label on last displayed line
    overlayLastLine() {

        let style = "{";
        let nbDisplayedEntriesLoc = this.nbDisplayedEntries;//this.getNbDisplayedEntries();
        if (this.labelMore == "Plus") {
            if (!this.isAtBottom()) {
                style += '"margin-top": "-1.4em"';
            }
        }
        style += "}";
        return JSON.parse(style);
    }

    public isDropped() : boolean {
    	return this.dropped;
    }
    
    public handleDropFold(event: KeyboardEvent) {

        let className: string = undefined
        if('C' + event.key === this.dropCommand) {
            className = 'drop_line';
        } else if('C' + event.key === this.foldCommand) {
            className = 'fold_line';
        }
        if(!className) {
            return false;
        }

        // Switch drop flag
        this.dropped = !this.dropped;

        if (this.dropped) {
           // Nothing
        } else {
            this.recordNumber = Math.trunc(this.recordNumber / this.getNbDisplayedEntries()) * this.getNbDisplayedEntries();;
        }

        this.bottom = this.isAtBottom();

        if(this.updateFolding()) {
            return true;
        }
 
        return false;
	}

    public ngAfterViewChecked(): void {
        this.updateFolding();
    }

    updateFolding() : boolean {

       if(this.dropFoldClassName) {
            let displayStyle = this.dropped ? 'block' : 'none';
            [].forEach.call(document.getElementsByClassName(this.dropFoldClassName), function(el) {
                el.style.display = displayStyle;
            });

            return true;
        }
        return false;
    }
}

