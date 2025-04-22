import { Directive, ElementRef, Renderer2, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Token, TokenField } from '../term.model';
import { TermService } from '../term.service';

@Directive({
    selector: '[transaction]',
})

/**
 * The directive provides utilities to run multiples transactions passing value in the map fields.
 * usage : [transaction]="[{map:'map_name', field:'field_name', data:'field_value'},...]"
 */
export class TransactionDirective implements OnInit {
    /* FIELDS ============================================================== */
    private _transid: string;
    private _commarea: string;

    @Input('transaction') tokens: any[];

    /* CONSTRUCTORS ======================================================== */
    constructor( private el: ElementRef, private renderer: Renderer2,
        private termService: TermService, private route: ActivatedRoute ) {
        route.params.subscribe( (params) => {
            this._transid = params[ 'transid' ];
            this._commarea = params[ 'commarea' ];
        } );
    }

    /* METHODS ============================================================= */
    /** onClick listener to run transactions using list of tokens (provided by menu page for example)*/
    ngOnInit(): void {
        this.renderer.listen( this.el.nativeElement, 'click', () => {
            let tokens: Token[] = [];
            for( let token of this.tokens ) {
                tokens.push( token[ 'map' ] ?
                    new Token( [ <TokenField> token ] )
                    : <Token> Object.assign( {}, token ) );
            }
            this.termService.runTransactions( this._transid, this._commarea, tokens );
        } );
    }
}
