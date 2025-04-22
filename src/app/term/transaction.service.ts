import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import Ajv, {ValidateFunction} from "ajv"

import { BackendMessage } from './message';
import { AppConfigurationMessage, TerminalKind } from '../configuration-message.module';
import * as schema from './message.schema.json'

@Injectable()
export class TransactionService {

    /** URL to web api */
    private transactionsUrl: string;

    /** The global configuration */
    public configuration: AppConfigurationMessage;


    private validator: Ajv;
    private validateBackendMessage: ValidateFunction;

    constructor(private http: HttpClient) {
    }

    /** Called during application initialization (V7-179) */
    public configure(configuration: AppConfigurationMessage) {

        this.configuration = configuration;

        if (this.configuration.backendURL === undefined) {
            throw new Error('Server did not provide us with backend URL, cannot initialize: ' + configuration);
        }

        let url: string = this.configuration.backendURL;
        if (!url.endsWith('/')) {
            url += '/';
        }

        this.transactionsUrl = url + 'transaction';
        console.log('TransactionService initialized with URL ' + this.transactionsUrl);

        this.configuration.useModernLegacyStyle = configuration.useModernLegacyStyle !== undefined && configuration.useModernLegacyStyle;

        // Load and compile JSON schema for messages.
        //let schema = require('./message.schema.json');
        this.validator = new Ajv();
        this.validateBackendMessage = this.validator.compile(schema);
        console.log('Messages validation set up');
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }

    private hidePassword(message: any) {
        let msg = Object.assign({}, message)
        if (msg.fields !== undefined) {
            msg.fields = msg.fields
                .map(field => {
                    if (field.ispassword !== undefined) {
                        delete field.ispassword
                        return { ...field, value: field.value.replace(/./g, '*') };
                    }
                    return field;
                });
        }
        return msg;
    }
    
    runTransaction(transid: String, message: any, parameters?: []): Promise<BackendMessage> {
        // Do not encore transid in the URL anymore
        message['transactionId'] = transid;
        message['parameters'] = parameters;
        const url = `${this.transactionsUrl}`;
        console.log('Starting transaction on backend (' + url + ')');
        console.log(this.hidePassword(message));

        // Use a POST to be able to send JSON message to the server
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type':  'application/json'
            })
          };

        return this.http.post(url, message, httpOptions)
            .toPromise()
            .then((response) => {
                // https://stackoverflow.com/a/33851796
                return this.handleBackendMessage(response);
            })
            .catch(this.handleError);
    }

    private handleBackendMessage(response): BackendMessage {
        console.log('Response from backend received', response)
      

        // Since TypeScript cannot type-validate JSON at runtime,
        // use a JSON schema generated fron TypeScript classes
        if (!this.validateBackendMessage(response)) {
             // Chrome-debug friendly
            console.error('Backend JSON message validation error: "' + this.validator.errorsText(this.validateBackendMessage.errors) + '"', this.validateBackendMessage.errors);
            console.error('invalid json: "' + response + '"', response);
            throw new Error('Backend JSON message validation error');
        }

        // Seems legit
        return response as BackendMessage;
    }

    public is5250() {
        return this.configuration.emulatedTerminal == TerminalKind.Term5250;
    }
}
