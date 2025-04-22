import { Injectable, OnInit, Self } from '@angular/core';
import { ConfigService } from './config-service';
import { LocalStorageService } from './local-storage-service';

/**
 * Regroups functions to handle insert mode when user press insert key
 */
@Injectable()
export class AppService {
    /* FIELDS ============================================================== */
    private _insertMode = false;
    private _insertModeChanged = new Array<( insertMode: boolean ) => void>();

    /* CONSTRUCTORS ======================================================== */
    constructor(private localStorageService: LocalStorageService, private configService: ConfigService) {
        this._initInsertMode();
        window.addEventListener( 'keydown', this.onKeyDown.bind( this ) );
    }

    /* METHODS ============================================================= */
    /* Events -------------------------------------------------------------- */
    private onKeyDown( event: KeyboardEvent ) {
        if( event.key === 'Insert' ) {
            this.updateInsertMode();
        }
    }

    /* Insert mode --------------------------------------------------------- */
    public get insertMode(): boolean {
        return this._insertMode;
    }
    
    // Not be used in specific component
    public set insertMode( insertMode: boolean ) {
    	if( insertMode !== this._insertMode ) {
    		this._insertMode = insertMode;
    		this._insertModeChanged.forEach( f => f( this._insertMode ) );
    	}
    }

    public registerOnInsertModeChange( fn: ( insertMode: boolean ) => void ): void {
        this._insertModeChanged.push( fn );
    }

    private _initInsertMode() {
        const insertMode = this.localStorageService.getItem('isInsertMode');
        this._insertMode = insertMode !== null ? insertMode : this.configService.terminalConfig.isInsertMode;
        console.log( 'Insert mode ' + (this._insertMode ? 'is active' : 'deactivated') );
    }

    public updateInsertMode() {
        this._insertMode = !this._insertMode;
        this.localStorageService.setItem('isInsertMode', this._insertMode);
        console.log( 'Insert mode ' + (this._insertMode ? 'is active' : 'deactivated') );
        this._insertModeChanged.forEach( f => f( this._insertMode ) );
    }
}