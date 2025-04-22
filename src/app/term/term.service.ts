import { Injectable } from '@angular/core';

import { TransactionService } from './transaction.service';
import { BackendMessage, LogicalMessage, Map, Field, Attributes } from './message';
import { TermModalService } from '../term-modal/term-modal.service';
import { Token, TokenField } from './term.model';

declare var $: any;

/**
 * Regroups the treatment of transactions in chain relative to term.
 */
@Injectable()
export class TermService {
    /* FIELDS ============================================================== */
    private _lastCompleteMaps: Map[];

    public onReceiveMessageToTerm: (message: BackendMessage) => void;
    public treatModalToken: (token: Token) => Promise<TokenField[]>;

    /* CONSTRUCTORS ======================================================== */
    constructor(private transactionService: TransactionService) { }

    /* METHODS ============================================================= */
    /** Run the next transactions according the tokens list*/
    public runTransactions(transid: string, commarea: string, tokens: Token[]) {
        console.log('TermService.runTransactions');

        if (!this._treatModalTokens(transid, commarea, tokens)) {
            this.transactionService.runTransaction(transid, { commarea: commarea })
                .then((message: BackendMessage) => this._onReceivedMessage(message, tokens));
        }
    }

    /** Check if modal is present in the tokens tab */
    private _treatModalTokens(transid: string, commarea: string, tokens: Token[]) {
        // Search next modal token
        let modalToken: Token = null;
        tokens.forEach((token) => {
            if (token.modal) {
                modalToken = token;
                return false;
            }
        })

        // If found, launch modal treatment
        if (modalToken) {
            console.log('Treat modal token', modalToken);
            this.treatModalToken(modalToken).then((modalTokens) => {
                modalToken.modal = null;
                modalToken.children = (modalToken.children || []).concat(modalTokens);
                console.log('Modal token treated', modalToken);

                this.runTransactions(transid, commarea, tokens);
            });
            return true;
        }
        return false;
    }

    /** Continue to run the next transaction according the tokens list */
    private _onReceivedMessage(message: BackendMessage, tokens: Token[]): void {
        console.log('TermService._onReceivedMessage', tokens);
        console.log('JSON message received from backend', message);

        if (message.error !== undefined) {
            // TODO Show in DOM too
            console.log('An error occured on backend: ' + message.error);
            return;
        }

        // Delegate to TermComponent
        this.onReceiveMessageToTerm(message);

        // TODO Adapt the following, commented out code if this functionality is still needed (V7-1103)
  
        /*
        // Use first message to determine rebind or the latest displayed maps.
        let logicalMessage = message.messages[0];

        if (!logicalMessage.rebind) {
            this._lastCompleteMaps = logicalMessage.maps;
        }

        let token = tokens.shift();
        if (token) {
            // token still present, continue to run the next transaction
            console.log('token=', token);
            let fields = this._updateMapsWithTokenFields(logicalMessage.maps, token.children);

            this._runNextTransaction(message.nextTransID, fields, tokens);
        } else {
            console.log('TermService.onReceiveMessageToTerm');

            if (logicalMessage.rebind) { // in rebind case, complete partial message
                if (this._lastCompleteMaps) {
                    logicalMessage.maps = this._updatePartialMapsWithCompleteMaps(logicalMessage.maps, this._lastCompleteMaps);
                }
                logicalMessage.rebind = false;
                logicalMessage.clear = true;
            }

            this.onReceiveMessageToTerm(message);
        }
        */
    }
    
    public createDummyAttributes() : Attributes {
        return {
            intensity: "NORM",
            protection: "PROT",
            num: "",
            forceModified: false,
            numerical: false,
            columnSeparator: false,
            underline: false,
            allowLC: false,
            color: "DEFAULT",
            line: 0,
            column: 0,
            chkMsg: []
        }
    }

    /** Populate the map with values passed in the token, before run the transaction */
    private _updateMapsWithTokenFields(maps: Map[], tokenFields: TokenField[]): Field[] {
        console.log('TermService._updateMapsWithTokenFields');
        let fields: Field[] = [];


        let tokenContext = {};
        tokenFields.forEach((tokenField) => {
            let map = tokenField.map;
            if (!tokenContext[map]) {
                tokenContext[map] = {};
            }
            tokenContext[map][tokenField.field] = tokenField.data;
        });

        // add field for each maps
        maps.forEach((map) => {
            map.fields.forEach((field) => {
                let modified = false;
                field = $.extend({}, field);

                let token = tokenContext[map.component];
                if (token && token[field.id]) {
                    //Set flag to true to display log if the field is not find in the maps
                    tokenContext[map.component]['visited'] = true;
                    tokenContext[map.component][field.id + '_visited'] = true;
                    field.data = token[field.id];
                    modified = true;
                }

                if (modified || (field.attributes && field.attributes.forceModified)) {
                    fields.push(field);
                }
            });
        });

        // Display logs if field not found in the maps (error case)
        for (let map in tokenContext) {
            let token = tokenContext[map];
            if (!token['visited']) {
                console.log('Token defined on not exiting map <' + map + '>');
            } else {
                for (let fieldName in token) {
                    if (!token[fieldName + '_visited']) {
                        console.log('Token defined on not existing field <' + fieldName + '>');
                    }
                }
            }
        }

        return fields;
    }

    /** Rebuild the complete map from partial received rebinded map */
    private _updatePartialMapsWithCompleteMaps(partials: Map[], completes: Map[]): Map[] {
        console.log('TermService._updatePartialMapsWithCompleteMaps');
        let maps: Map[] = [];

        for (let partial of partials) {
            for (let complete of completes) {
                if (complete.component === partial.component) {
                    let map: Map = $.extend({}, complete, partial);
                    map.fields = this._updatePartialFieldsWithCompleteFields(partial.fields, complete.fields);
                    maps.push(map);
                    break;
                }
            }
        }

        console.log('result: ', maps);
        return maps;
    }

    /** Aggregate fields from partial to fields of complete */
    private _updatePartialFieldsWithCompleteFields(partials: Field[], completes: Field[]): Field[] {
        let fields: Field[] = [];

        for (let partial of partials) {
            for (let complete of completes) {
                if (complete.id === partial.id) {
                    let field: Field = $.extend({}, complete, partial);
                    field.attributes = complete.attributes; // No refresh in screen, keep first attributes
                    fields.push(field);
                    break;
                }
            }
        }

        return fields;
    }

    /** Simulate an ENTER key pressed and run the next transaction */
    private _runNextTransaction(transid: string, fields: Field[], tokens: Token[]) {
        console.log('TermService._runNextTransaction');
        if (!transid) {
            console.log('No next transaction; attention key ignored');
            return;
        }

        let termMessage: any = { attentionKey: 'ENTER', fields: [] };
        for (let field of fields) {
            termMessage.fields.push({
                name: field.id,
                value: field.data,
            });
        }

        this.transactionService.runTransaction(transid, termMessage)
            .then((message: BackendMessage) => this._onReceivedMessage(message, tokens))
            .catch((ex) => {
                console.error('Error invoking next transaction', ex);
            });
    }
}