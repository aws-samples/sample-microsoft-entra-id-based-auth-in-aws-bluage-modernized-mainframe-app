import { Component, HostListener, inject } from '@angular/core';
import { AppComponent } from './app.component';
import { ActivatedRoute } from '@angular/router';
import * as $ from 'jquery';

import { TransactionService } from './term/transaction.service';
import { TermService } from './term/term.service';
import { TestingService } from './term/testing.service';
import { ModalService } from './modal.service';
import { AbstTermComponent } from './abs-term.component';
import { AppService } from './app.service';
import { ConfigService, TerminalConfig } from './config-service';
import { LocalStorageService } from './local-storage-service';
import { LanguageService } from './language/language-service';
import { MapRegistryService } from './services/map-registry.service';
import { HelpService } from './help.service';

// Component injection imports

@Component({
    moduleId: module.id,
    selector: 'term',
    templateUrl: './term.component.html'
})

export class TermComponent extends AbstTermComponent {
    public terminalConfig: TerminalConfig;

    public selectedTemplate: string;
    public selectedWidthMode: number;
    public isDebugGrid: boolean;
    public isSpinner: boolean;
    public overwriteCursor: string;
    
    // DIs
    private mapRegistryService: MapRegistryService = inject(MapRegistryService);
    
    constructor(
        modalService: ModalService,
        transactionService: TransactionService,
        route: ActivatedRoute,
        languageService : LanguageService,
        service: TermService,
        appService: AppService,
        testingService: TestingService,
        configService: ConfigService,
        private localStorageService: LocalStorageService,
        private appcomponent: AppComponent,
        helpService: HelpService
    ) {
        super(modalService, transactionService, route, languageService, service, appService, testingService, configService, helpService);
        this.terminalConfig = configService.terminalConfig;
        this.initialize();
    }

    logout(){
        this.appcomponent.logout();
        }

    private initialize(){
        const widthMode = this.localStorageService.getItem('widthMode');
        const debugGrid = this.localStorageService.getItem('isDebugGrid');
        const styleTemplate = this.localStorageService.getItem('styleTemplate');
        const isSpinner = this.localStorageService.getItem('isSpinner');
        const overwriteCursor = this.localStorageService.getItem('overwriteCursor');
        if(overwriteCursor === 'Underscore' || overwriteCursor === 'Block'){
            this.overwriteCursor = overwriteCursor;
            this.terminalConfig.style.overwriteCursor = overwriteCursor;
        } else {
            this.overwriteCursor = this.terminalConfig.style.overwriteCursor;
        }
        this.changeWidthSetup(widthMode !== null ? widthMode : this.terminalConfig.widthMode);
        this.changeDebugGrid(debugGrid ? debugGrid : this.terminalConfig.isDebugGrid);
        this.changeStyleScheme(styleTemplate ? styleTemplate : this.terminalConfig.style.defaultStyle);
        this.changeSpinner(isSpinner !== null ? isSpinner : this.terminalConfig.spinner);
    }
    
    async getMapComponent(mapName: string): Promise<any> {
        let mapComponent = this.mapRegistryService.fetchComponent(mapName);
        if (mapComponent) {
            return mapComponent;
        }
        // Map component not found
        // Try to load the module again and try again.
        await this.loadModule(this.mapRegistryService.getModuleNameByComponent(mapName));
        return this.mapRegistryService.fetchComponent(mapName);
    }

    getIdAnchor(): any {
        return $("#" + "rd_col01_l1");
    }

    public ngAfterViewChecked(): void {
        if (!this.modalService.containModal()) {
            super.ngAfterViewChecked();
        }
    }

    isModal(): boolean {
        return false;
    }

    getName(): String {
        return "";
    }

    isSpinning(): boolean {
        return AbstTermComponent.isWaitingForBackendResponse;
    }

    changeSpinner(value: boolean) : void {
        this.isSpinner = value;
        this.localStorageService.setItem('isSpinner', value);
    }
    
    changeCursorOverwrite() : void {
        if(this.overwriteCursor === 'Underscore'){
            this.overwriteCursor = 'Block';
        } else {
            this.overwriteCursor = 'Underscore';
        }
        this.terminalConfig.style.overwriteCursor = this.overwriteCursor;
        this.localStorageService.setItem('overwriteCursor', this.overwriteCursor);
    }

    onKeyDownListener(e: KeyboardEvent) {

        // Disable listener if modals are displayed
        if (!this.modalService.containModal()) {
            super.onKeyDownListener(e);
        }
    }
    
    @HostListener('window:beforeunload', [ '$event' ])
    beforeUnloadHandler(event) {
        // Send a message to the backend to notify that the browser has been closed
        let termMessage: any = { 'attentionKey': 'CLOSE' };
        this.transactionService.runTransaction(this.nextTransactionId, termMessage);
    }
    
    changeStyleScheme(template: string){
        const styleTemplate = this.terminalConfig.style.templates.find(t => t.name === template);
        this.selectedTemplate = styleTemplate.name;
        styleTemplate.elements.forEach(e => {
            document.documentElement.style.setProperty('--'+e.key, e.value);
        });
        this.localStorageService.setItem('styleTemplate', this.selectedTemplate);
    }

    changeWidthSetup(value: number) {
        if(value > 0 || value < 4){
            this.selectedWidthMode = value;
        } else {
            this.selectedWidthMode = 2;
        }
        this.changeSetup(this.selectedWidthMode);
        this.localStorageService.setItem('widthMode', this.selectedWidthMode);
    }

    changeDebugGrid(value: boolean) {
        this.isDebugGrid = value;
        this.localStorageService.setItem('isDebugGrid', this.isDebugGrid);
    }
}
