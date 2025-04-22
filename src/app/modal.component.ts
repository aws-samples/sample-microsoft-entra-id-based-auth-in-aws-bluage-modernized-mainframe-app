import { Component,  Input, HostListener, inject } from '@angular/core';
import { NgModule } from '@angular/core';
import { ModalService, MODALSERVICE } from './modal.service';
import { Subscription } from 'rxjs';
import { WindowComponents, BackendMessage } from './term/message';
import { AbstTermComponent } from './abs-term.component';
import { TransactionService } from './term/transaction.service';
import { ActivatedRoute } from '@angular/router';
import { TermService } from './term/term.service';
import { TestingService } from './term/testing.service';
import { CommonsModule } from './commons.module';
import { AppService } from './app.service';
import { ConfigService } from './config-service';
import { LanguageService } from './language/language-service';
import { MapRegistryService } from './services/map-registry.service';
import { TermComponent } from './term.component';
import { HelpService } from './help.service';


function isDefinedAndDifferentOf(value: string, notExpected: string) {
	return value && (value !== notExpected);
}

function isDefinedAndEqualOf(value: string, notExpected: string) {
	return value && (value === notExpected);
}

const KEY_ESC = 27;
/** Constante to retrieve instead */
// lrg height css
const baseHeight = 1.4;
declare var $: any;

@Component({
    selector: 'modal-window',
    template: `
    <div [id]="name" class="modal" tabindex="-1" role="dialog">
        <div [ngClass]="modalClass()" style="position: absolute">
            <div class="modal-content" [ngStyle]="positionStyle()" >                
                <div>
                    <div *ngIf="hasBorderTop()" [ngClass]="computeBorderClasses()" [ngStyle]="titleTopStyle()">
	                    <div [ngClass]="computeTitleClasses()" [ngStyle]="titleTopColorStyle()">
	                    {{titleTop}}
	                    </div>
                    </div> 
                        <div #dynamicTarget></div>
                    <div *ngIf="hasBorderBottom()" [ngClass]="computeBorderClasses()" [ngStyle]="titleBottomPositionStyle()">
                   	    <div [ngStyle]="titleBottomStyle()">
		                    <div [ngClass]="computeTitleClasses()" [ngStyle]="titleBottomColorStyle()">
	                    	{{titleBottom}}
		                    </div>
		                </div>
                    </div> 
                </div> 
            </div>
        </div>
        <div *ngIf="!messageLine">
            <div *ngFor = "let i of numberDivs" > 
            <div class='lgr_col empty'> </div> 
            </div>
            <div id="errorMessage" class='errorMessage lgo_03'>{{this.getErrorMessage()}}{{this.windowErrorMessage}}</div>
        </div>
    </div>
        `
})

/** Component Modal */
export class ModalComponent extends AbstTermComponent {
    
    // DIs
    private mapRegistryService: MapRegistryService = inject(MapRegistryService);

    constructor(
        modalService: ModalService,
        transactionService: TransactionService,
        route: ActivatedRoute,
        languageService: LanguageService,
        service: TermService,
        appService: AppService,
        testingService: TestingService,
        configService: ConfigService,
        helpService: HelpService
    ) {
        super(modalService, transactionService, route, languageService, service, appService, testingService, configService, helpService);
    }

    @Input() name: string;
    numberDivs : Array<any>;
    
    // Position : upper-left corner 
	/** The left position. */
    private positionLeft: number;
	/** The top position. */
	private positionTop: number;
	
	/** The cursor position from which displaying modal. Actually not exploited.*/
	private cursorPosition: boolean;
	
	/** The size's height. Actually not exploited, modal height is set by the content */
	private height: number;
	
	/** The size's width. */
    private width: number;

    /** Color border */
    public borderColor: string;

    /** Intensity border */
    public borderIntensity: string;

    /** Hilight border */
    public borderHilight: string;

    /** Dashed border */
    public borderDashed: boolean;

    /** border */
    public border : boolean;

    /** Title */
	public titleTop: string;	
	public titleBottom: string;
	public titleColorTop: string;
	public titleColorBottom: string;	
	public titleAlignTop: string;
	public titleAlignBottom: string;
	public borderTop: string;
	public borderBottom: string;

	/* The message line */
	public messageLine: boolean;
	
    private subscription: Subscription;

    async getMapComponent(mapName: string): Promise<any> {
        let mapComponent = this.mapRegistryService.fetchSubComponent(mapName);
        if (mapComponent) {
            return mapComponent;
        }
        // Map component not found
        // Try to load the module again and try again.
        await this.loadModule(this.mapRegistryService.getModuleNameByComponent(mapName));
        return this.mapRegistryService.fetchSubComponent(mapName);
    }

    getIdAnchor() : any  {
        return $("#" + this.name).children().children().children();
    }

    protected haveToChangeTargetAccessibility(): boolean {
        return true;
    }

    isModal(): boolean {
        return true;
    }

    getName(): String {
        return this.name;
    }

    postAction() {
         this._hideDialog();
    }
    
    public onReceivedMessage(backendMessage: BackendMessage): void {
        // Transfer to main component receiver
        this.getParent().onReceivedMessage(backendMessage);
    }

    private _defaults = {
        title: 'Confirmation',
        message: 'Do you want to cancel your changes?',
        cancelText: 'Cancel',
        okText: 'Yes'
    };

    activate(): Promise<boolean> {
        console.log('Displays modal ' + this.name );
        let promise = new Promise<boolean>(resolve => {
            this._show(resolve);
        });

        return promise;
    }

    private _show(resolve: (boolean) => any) {
        document.onkeyup = null;
        setTimeout(() => $('#' + this.name).modal('show'), 50);
        this.modalService.pushModal(this.name);
        document.onkeyup = (e: any) => {
            if (e.which == KEY_ESC) {
                this._hideDialog();
                return resolve(false);
            }
        };
    }

    private _hideDialog() {
        $('#' + this.name).modal('hide');
        this.modalService.popModal(this.name);
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
    }

    ngOnInit(): any {
        this.subscription = this.modalService.activeModal(this.name).subscribe( ({message, parentComponent}) => {
            this.activate();
            this.setParent(parentComponent);
            this.processLogicalMessage(message);
            this.mapWindowAttributes(message as WindowComponents);
        });
    }
    
    ngAfterViewInit(): void {
          const observer = new MutationObserver((mutations, obs) => {
              const modal = document.getElementById(this.name);
              if (modal && getComputedStyle(modal).display !== 'none') {
               this.modalService.modalReadyEvent.emit();
               obs.disconnect(); // Stop observing once the modal is found
              }
            });
            observer.observe(document.body, {
              childList: true, // Listen for added or removed elements
              subtree: true // Look for changes in descendants also
            });
      }

    ngOnDestroy(): void {
        this._hideDialog();
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private mapWindowAttributes(message: WindowComponents) {
        if(message.maps === undefined){
            return;
        }
        message.maps.forEach(windowMap => {
            if(windowMap.component == "end-message"){
                this.borderColor = "#C00000";
                this.positionLeft = this.modalService.getDefaultPosLeft();
                this.positionTop = this.modalService.getDefaultPosTop();
                this.height = this.modalService.getDefaultHeight();
                this.width = this.modalService.getDefaultWidth();
                this.cursorPosition = false;
            } else {
                if (windowMap.borderColor) {
                    this.borderColor = windowMap.borderColor;
                }

                if (windowMap.borderIntensity) {
                    this.borderIntensity = windowMap.borderIntensity;
                }

                if (windowMap.borderHilight) {
                    this.borderHilight = windowMap.borderHilight;
                }

                if (windowMap.borderDashed) {
                    this.borderDashed = windowMap.borderDashed;
                }

                if (windowMap.border) {
                    this.border = windowMap.border;
                }

                if (windowMap.positionLeft) {
                    this.positionLeft = windowMap.positionLeft;
                }

                if (windowMap.positionTop) {
                    this.positionTop = windowMap.positionTop;
                }

                if (windowMap.height) {
                    this.height = windowMap.height;
                }

                if (windowMap.width) {
                    this.width = windowMap.width + 2;
                }

                if (windowMap.cursorPosition) {
                    this.cursorPosition = windowMap.cursorPosition;
                }
                
                if (windowMap.titleTop) {
                    this.titleTop = windowMap.titleTop;
                }

                if (windowMap.titleBottom) {
                    this.titleBottom = windowMap.titleBottom;
                }
                
                if (windowMap.titleColorTop) {
                    this.titleColorTop = windowMap.titleColorTop;
                }
 
                 if (windowMap.titleColorBottom) {
                    this.titleColorBottom = windowMap.titleColorBottom;
                }

                if (windowMap.titleAlignTop) {
                    this.titleAlignTop = windowMap.titleAlignTop;
                }
                
                if (windowMap.titleAlignBottom) {
                    this.titleAlignBottom = windowMap.titleAlignBottom;
                }               
 
                if (windowMap.borderTop) {
                    this.borderTop = windowMap.borderTop;
                } 
                
                if (windowMap.borderBottom) {
                    this.borderBottom = windowMap.borderBottom;
                }
                
                if(windowMap.windowRef == null){
                	// Update the messageLine attr only for the main modal component
                    if (windowMap.messageLine != undefined) {
                        this.messageLine = windowMap.messageLine;
                    }
                }
                
                if (windowMap.dspMode !== undefined) {
                    let numDivs = windowMap.dspMode === "*DS3" ? 24 : 27;
                    this.numberDivs = new Array(numDivs);
                }
            }
        });
    }

    /** complete style with a separator if style is not empty */
    addTextToStyle(style:string, text:string):string {
        if (style.length > 1) {
            style += ',';
        }
        style += text;
        return style;

    }

    modalClass(){
        let text = "modal-dialog";
        if(this.isScreenExtended()){
            text += " A7";
        }
        return text;
    }

    /**  Set position as upper-left corner */
    positionStyle() {
        // Screen width
        let sizePanel = this.isScreenExtended() ? 132 : 80;
        // Line Height
        let lineHeigth = 1.25;
        // Empiric value to increase a little bit no border windows heigth
		let noBorderShift = 0.15;

        let style = "{";

        if (this.positionLeft && this.positionTop) {
            let newLeftPosition = (100*this.positionLeft)/sizePanel;
            style += '"left": "' + newLeftPosition + '%"';

            if(this.hasBorderTop()){
                style += ',"top": "' + (this.positionTop * lineHeigth - baseHeight) + 'em"';
            } else {
                style += ',"top": "' + this.positionTop * lineHeigth + 'em"';
            }
        }

        if (this.width && this.height) {
            let width = (100*this.width)/sizePanel;
            style = this.addTextToStyle(style, '"width":"'+ width + '%"');

            let height = (this.height *  baseHeight);
            if (this.border) {
                height += 2*baseHeight;
                style += ',"border-top": "none"';
            } else {
                if (this.hasBorderTop() ) {
                    height += baseHeight;
                } else{
                    height += noBorderShift;
                }
                if (this.hasBorderBottom()) {
                    height += baseHeight;
                } else{
                    height += noBorderShift;
                }
            }
       
            style += ',"height":"'+ height + 'em"'; 
        }

        if (this.borderColor) {
			// Set the border color
			if ((this.hasBorderTop() || this.hasBorderBottom()) && !isDefinedAndEqualOf(this.borderHilight, 'REVERSE')) {
				style += ',"border-color": "var(--system-background)"';
			} else {
            	style += ',"border-color": "var(--' + this.borderColor.toLowerCase() + ')"';
			}
        }
        
        if (this.borderDashed) {
            style += ',"border": "3px dashed white"';
        }
        
        style += "}";

        return JSON.parse(style);
    }

    hasBorderTop(): boolean {
        if (this.border) {
            return true;
        } else {
            // title is defined
            if (this.titleTop) {
                return true;
            } else {
                if (this.borderTop) {
                    return true;
                }
            }
        }
        return false;
    }

    hasBorderBottom() {
        if (this.border) {
            return true;
        } else {
            // title is defined
            if (this.titleBottom) {
                return true;
            } else {
                if (this.borderBottom) {
                    return true;
                }
            }
        }
        return false;
    }

    /**  Class of the border */
	computeBorderClasses(): string[] {
		
		// Determinate classes
		let classes = [];
		if (isDefinedAndEqualOf(this.borderHilight, 'REVERSE')) {
        	classes.push(this.borderColor.toLowerCase());
        }
		if (isDefinedAndDifferentOf(this.borderIntensity, 'NORM')) {
			classes.push(this.borderIntensity.toLowerCase());
		}
		if (isDefinedAndDifferentOf(this.borderHilight, 'OFF')) {
			classes.push(this.borderHilight.toLowerCase());
		}

		return classes;
	}

    /**  Class of the title in the top or bottom of the border */
	computeTitleClasses(): string[] {
		
		// Determinate classes
		let classes = [];
		if (this.borderColor) {
			classes.push(this.borderColor.toLowerCase());
        }
		if (isDefinedAndDifferentOf(this.borderIntensity, 'NORM')) {
			classes.push(this.borderIntensity.toLowerCase());
		}
        if (!isDefinedAndEqualOf(this.borderHilight, 'REVERSE')) {
            classes.push('reverse');
        }
		if (isDefinedAndDifferentOf(this.borderHilight, 'OFF') && isDefinedAndDifferentOf(this.borderHilight, 'REVERSE')) {
            classes.push(this.borderHilight.toLowerCase());
		}

		return classes;
	}

    /**  Style of the title in the top of the border */
    titleTopStyle() {
        let style = "{";
        style += '"display": "flex",';
        style += '"width": "100%",';
        style += '"height": "' + baseHeight + 'em"';
        
        if (this.titleAlignTop) {
            style += ',"justify-content": "' + this.titleAlignTop + '"';
        } else {
            style += ',"justify-content": "center"'; 
        }
        style += "}";
        return JSON.parse(style);
    }

    /**  Style and position of the title in the bottom of the border */
    titleBottomPositionStyle() {        
        let style = "{";
        style += '"position": "absolute",';
        style += '"width": "100%",';
        style += '"height": "' + baseHeight + 'em"';

        let height = (this.height *  baseHeight);
        if (this.border || this.hasBorderBottom()) {
            height += baseHeight;
        }
        style += ',"top": "' + height + 'em"';

        style += "}";
        return JSON.parse(style);
    }

    /**  Style of the title in the bottom of the border */
    titleBottomStyle() {
        let style = "{";
        style += '"display": "flex",';
        style += '"width": "100%",';
        style += '"height": "' + baseHeight + 'em"';
        
        if (this.titleAlignBottom) {
            style += ',"justify-content": "' + this.titleAlignBottom + '"';
        } else {
            style += ',"justify-content": "center"'; 
        }
        style += "}";
        return JSON.parse(style);
    }

    /**  Style of the title in the top of the border */
    titleTopColorStyle() {
        let style = "{";
        if (isDefinedAndEqualOf(this.borderHilight, 'REVERSE')) {
			style += '"background-color": "var(--system-background)"';
		}
        if (this.titleColorTop) {
            style += ',"color": "' + this.titleColorTop + '"';
        }
        style += "}";
        return JSON.parse(style);
    }

    /**  Style of the title in the bottom of the border */
    titleBottomColorStyle() {
        let style = "{";
        if (isDefinedAndEqualOf(this.borderHilight, 'REVERSE')) {
			style += '"background-color": "var(--system-background)"';
		}
        if (this.titleColorBottom) {
            style += ',"color": "' + this.titleColorBottom + '"';
        }
        style += "}";
        return JSON.parse(style);
    }
    
}

@NgModule({
    imports: [
        CommonsModule
    ],
    declarations: [ModalComponent],
    providers: [MODALSERVICE],
    exports: [ModalComponent]
})
export class ModalModule {

}
