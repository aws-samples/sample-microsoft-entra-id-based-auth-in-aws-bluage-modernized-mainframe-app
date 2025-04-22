import { Injectable } from '@angular/core';

import { TokenField, Token } from '../term/term.model';
import { AbstractTermModal } from './term-modal.component';
import { TermService } from '../term/term.service';

/**
 * Service for show modal to transactions in term.
 */
@Injectable()
export class TermModalService {
    /* FIELDS ============================================================== */
    private _components: any = {};

    /* CONSTRUCTORS ======================================================== */
    constructor( private termService: TermService ) {
        termService.treatModalToken = (token: Token) => this.show( token.modal );
    }

    /* METHODS ============================================================= */
    public register( name: string, component: AbstractTermModal ) {
        this._components[ name ] = component;
    }

    public show( name: string ): Promise<TokenField[]> {
        return this._components[ name ].show();
    }
}