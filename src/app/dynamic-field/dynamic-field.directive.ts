import { Directive, ElementRef, Renderer2, Input, AfterViewInit } from '@angular/core';
import { AppService } from '../app.service';

declare var $: any;

/**
 * Directive for button to map at keyEvent like 'Enter', 'F1', etc.
 */
@Directive({
    selector: 'button[keyEvent]',
})
export class KeyEventDirective {
    /* FIELDS ============================================================== */
    @Input() keyEvent: { type: string, args: KeyboardEventInit };

    /* CONSTRUCTORS ======================================================== */
    constructor( private el: ElementRef, private renderer: Renderer2 ) {
        renderer.listen( el.nativeElement, 'click', () => {
            document.dispatchEvent( new KeyboardEvent( this.keyEvent.type, this.keyEvent.args ) );
            return false;
        } );
    }
}

/**
 * Directive for cobol menu command keys:
 * + data-target (root): input to fill with 'data-value'
 * + data-value (link): value to fill in input define by data-target on root
 */
@Directive({
    selector: '[data-toggle=menu]',
})
export class MenuDirective implements AfterViewInit {
    /* FIELDS ============================================================== */
    private _menu: HTMLElement;
    private _target: string;

    /* CONSTRUCTORS ======================================================== */
    constructor( private el: ElementRef, private renderer: Renderer2, private appService: AppService ) {
        this._menu = el.nativeElement;
        this._target = $( this._menu ).data().target;
    }

    /* METHODS ============================================================= */
    ngAfterViewInit(): void {
        let children = this._menu.querySelectorAll( 'a[data-value]' )
        for( let i = 0; i < children.length; i++ ) {
            let element = <HTMLElement> children.item( i );
            this.renderer.listen( element, 'click', () => {
                let input = $( this._target );
                input.focus();

                setTimeout( () => {
                    let value = $( element ).data().value.toString();
                    let input = <HTMLInputElement> document.querySelector( this._target );
                    let insertMode = this.appService.insertMode;
                    this.appService.insertMode = true;
                    this._sendKeys( input, value, () => this.appService.insertMode = insertMode );
                }, 0 );
                return false;
            } );
        }
    }

    protected _sendKeys( input: HTMLInputElement, keys: string, chain?: () => void ): void {
        if( keys ) {
            setTimeout( () => {
                input.dispatchEvent( new KeyboardEvent( 'keypress', { key: keys[ 0 ] } ) );
                this._sendKeys( input, keys.substring( 1 ), chain );
            }, 0 );
        } else {
            setTimeout( () => {
                document.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Enter' } ) );
                if( chain ) {
                    setTimeout( chain, 0 );
                }
            }, 0 );
        }
    }
}