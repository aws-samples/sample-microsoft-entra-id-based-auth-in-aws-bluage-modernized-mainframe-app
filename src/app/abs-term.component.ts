
import { AfterViewInit, OnDestroy, HostListener, AfterViewChecked, Directive, inject, Injector, createNgModule } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import * as $ from 'jquery';

// Component injection imports
import { ViewContainerRef, ViewChild, ComponentRef } from '@angular/core';
import { Type } from '@angular/core';
import { BackendMessage, LogicalMessage, Map, WindowMap, Field, SimpleField } from './term/message';
import { AddComponents, RebindComponents, RemoveAllComponents, WindowComponents, SetCursorPosition } from './term/message';
import { TransactionService } from './term/transaction.service';
import { Data } from './term/term.model';
import { TermService } from './term/term.service';
import { TestingService } from './term/testing.service';
import { AppService } from './app.service';
import { ConfigService } from './config-service';
import { LanguageService } from './language/language-service';
import { NumericalService } from './dynamic-field/utility/numerical.service';
import { AppConfigurationMessage } from './configuration-message.module';
import { ModalService } from './modal.service';
import { switchMap } from 'rxjs/operators';
import { LAZY_IMPORTS } from './lazy-imports';
import { FieldSynchronizationService } from './services/field-synchronization.service';
import { MapModuleLoaderService } from './services/map-module-loader.service';
import { HelpService } from './help.service';
/** Abstract business component receiving, displaying and sending data */
@Directive()
export abstract class AbstTermComponent implements AfterViewInit, OnDestroy, AfterViewChecked {

    // Component injection location
    @ViewChild('dynamicTarget', { read: ViewContainerRef, static:false })
    private dynamicTarget : ViewContainerRef;

    // Keep track of injected component(s)
    private injectedComponents: ComponentRef<any>[] = [];
    private injectedModalComponents: ComponentRef<any>[] = [];

    // Keep track of injected component(s), by name
    private componentsByName: { [key: string]: ComponentRef<any> } = {}
    private modalComponentsByName: { [key: string]: ComponentRef<any> } = {}
    private subComponentsByName: { [key: string]: any } = {}

    // Keep track of injected fields(s), by position
    private fieldsByPosition: { [key: number]: Data } = {}
    

    // Keep track of message treated
    private messages: LogicalMessage[] = []

    // The next transaction to run from this terminal (CICS "TRANSID" parameter)
    protected nextTransactionId: string;

    // A message to display in the page footer
    private footerMessage: string;

    // Used by Setup menu. Enforce "Fixed Width" as the defaut setup
    private containerClasses = ['container'];

	private heightClasses = ['rdmq_height'];
	
	// Enforce "Fixed Width" as the default setup
    private widthMode: number = 2;
    private widthClasses = ['', 'rd_fixed_width', 'rd_full_width'];
    private widthClassesA7 = ['', 'rd_fixed_width_A7', 'rd_full_width'];
    private isExtended: boolean = false;
    private mainDspMode: string;

    /** The global configuration */
    public configuration: AppConfigurationMessage;

    /** Current year */
    public currentYear:number;

    /** Parent component */
    private parentComponent: AbstTermComponent;

    // Spinning indicator
    public static isWaitingForBackendResponse : boolean = false;
  
    // window error message
	public windowErrorMessage: string = "";
	
    
	// DIs
    private mapModuleLoaderService: MapModuleLoaderService = inject(MapModuleLoaderService);
    private injector: Injector = inject(Injector);

    constructor(
        public modalService: ModalService,
        protected transactionService: TransactionService,
        private route: ActivatedRoute,
        private languageService: LanguageService,
        public service: TermService,
        private appService: AppService,
        private testingService: TestingService,
        private configService: ConfigService,
        protected helpService: HelpService
    ) {
        service.onReceiveMessageToTerm = this.onReceivedMessage.bind(this);
        this.configuration = transactionService.configuration;
        this.currentYear = Date.now();
   
    }

    
    abstract getMapComponent(mapName : string): Promise<any>;
    abstract getIdAnchor(): any;
    abstract isModal(): boolean;
    abstract getName(): String;
    
    protected loadModule(name: string): Promise<boolean> {
        if (this.mapModuleLoaderService.isModuleLoadInitiated(name)) {
            return this.mapModuleLoaderService.fetchModuleLoad(name);
        }
        return this.mapModuleLoaderService.registerModuleLoad(name, this.performModuleLoad(name));
    }

    private async performModuleLoad(name: string): Promise<boolean> {
        try {
            let moduleType: any;
            if (name in LAZY_IMPORTS) {
                 moduleType = await LAZY_IMPORTS[name]();
            } else {
                let moduleJS = await import('./maps/' + name + '/' + name + '.module');
                // Compute the class name of the module
                let moduleClassName: string = name[0].toUpperCase() + name.slice(1) + 'Module';
                if (moduleClassName in moduleJS) {
                    moduleType = moduleJS[moduleClassName];
                }
            }
            if (moduleType !== undefined) {
                createNgModule(moduleType, this.injector);
                return true;
            }
        } catch (e) {}
        return false;
    }
    
    protected postAction() {
        // Do Nothing
    }

    getComponent(name : string) {
        return this.componentsByName[name]
    }
    
    getModal(name : string) {
        return this.modalComponentsByName[name]
    }

    getFieldByPosition(position : number) {
        return this.fieldsByPosition[position]
    }

    setParent(parent: AbstTermComponent) {
        if (parent !== this) {
            this.parentComponent = parent;
        }
    }

    getParent(): AbstTermComponent {
        return this.parentComponent
    }


    ngAfterViewInit(): void {
    	// Run the transaction when the main screen is created
	    if (!this.isModal()) {
	        let toRun = (params: Params) => this.onInvoke(params);
	        this.route.params.pipe(
	            switchMap(val => {return toRun(val);}
	                )
	         ).subscribe((message: BackendMessage) => this.onReceivedMessage(message));
	    }
    }

    ngOnDestroy(): void {
        this.removeAnyExistingComponent();
    }


    public ngAfterViewChecked(): void {

        // Change DOM pointer-events attribute value to enable targetting.
        if (this.haveToChangeTargetAccessibility()) {

            // Disable pointer-event on all 
            this.getIdAnchor().attr("style", "pointer-events: none");

            // Keep accessible as target usefull fields
            let msgs : any[] = [];
            let numberLine : number = 0;
            this.getIdAnchor().children().each(
                function(index, values) {
                    msgs.push(values);
                    numberLine = Math.max(numberLine, $(values).children().children().length);
                }
            )

            // For each line
            for (let i = 0; i<numberLine; i++) {

                let retainDivLine;
                for (let j = 0; j<msgs.length; j++) {
                    let divLine = $(msgs[j]).children().children()[i];
                    if ($(divLine).children().filter(
                        function(index,value) {
                            return !value.classList.contains("lgr_00")
                        }
                    ).length > 0) {
                        retainDivLine = divLine;
                    }
                }


                // Set the last no empty div line attribute pointer-events value to visible
                if (retainDivLine != null) {
                    $(retainDivLine).attr("style", "pointer-events: visible");
                }
            }
        } else {
            // Re-establish default behaviour
            this.getIdAnchor().removeAttr("style");
        }
 
    }

    // Check if condition have to be changed to access target 
    protected haveToChangeTargetAccessibility(): boolean {

        // If there are several message and are in absolute position
        if (this.getIdAnchor().children().length > 1 && this.getIdAnchor().children().children().filter(
            function(index, value) {
                return $(value).css("position") === "absolute"
            }
        ).length > 0 ) {
            return true;
        }

        return false;
    }

    private toggleOverwriteMode(): void {
        this.appService.updateInsertMode();
    }

    protected changeSetup(widthMode: number): void {
        this.widthMode = widthMode;
    	this.containerClasses = ['container'];
    	if(widthMode >= 1 && widthMode <= 3){
    		this.containerClasses.push(!this.isExtended ? this.widthClasses[widthMode - 1] : this.widthClassesA7[widthMode - 1]);
		}
    }
    
    protected isScreenExtended(){
        if(this.parentComponent !== undefined){
            return this.parentComponent.isScreenExtended();
        }
        return this.isExtended;
    }

    private changeTheme(event: any): void {
        // Set the class of "body" to the one defined by the data-csw attribute
        let target = (<Element>event.target);
        let theme = target.getAttribute('data-csw');
        document.body.className = theme;
    }

    private onInvoke(params: Params): Promise<BackendMessage> {
        const startMessage: any = { 'resetTransactionData': true };

        let transid = params['transid'];
        let parameters = params['parameters'] != null ? JSON.parse(params['parameters']) : [];
        if (transid.toLowerCase().startsWith('/testmap ')) {
            const args = transid.substring(transid.indexOf(' ') + 1);
            return Promise.resolve(this.testingService.buildTestMessage(args));
        }

        return this.transactionService.runTransaction(transid, startMessage, parameters);
    }

    public onReceivedMessage(backendMessage: BackendMessage): void {
        console.log('JSON message received from backend', backendMessage)

        AbstTermComponent.isWaitingForBackendResponse  = false;

        if (backendMessage.error !== undefined) {
            console.log('An error occured on backend: ' + backendMessage.error);
            this.setFooterMessage(backendMessage.error);
            return;
        }

        this.nextTransactionId = backendMessage.nextTransID;

        if (this.configuration.verbose) {
            this.setFooterMessage(backendMessage.serverDescription);
        } else {
        	// Remove potential obsolete error message
            this.setFooterMessage('');
        }

        if (backendMessage.messages == undefined || backendMessage.messages.length == 0) {
            console.log('No backend messages to process');
        } else {
            this.helpService.clear();
            // Ensure each message is totally processed before the next one is (V7-3021)
            this.processSequentially(backendMessage.messages, 0);
        }
    }

    /** Set the footer message, or clear it is string is empty/undefined */
    private setFooterMessage(message: string):void {
        if (message == undefined) {
            message = '';
        }

        // Flashing footer if message has changed
        if (message !== '' && message != this.footerMessage) {
            this.animate();
        }

        this.footerMessage = message;
    }

    /** Active footer animation */
    private animate():void {
        $("#idFooter").removeClass("run-animation");
        setTimeout(() => {
            $("#idFooter").addClass("run-animation");
        }, 10);
    }

    /** Process logical messages sequentially (only one usually, but see V7-145) */
    private async processSequentially(toProcess: LogicalMessage[], idx: number): Promise<void> {
        if (idx >= toProcess.length) {
            return;
        }

        // Could use Array.shift, but it messes with debugging console (array is emptied)
        await this.processLogicalMessage(toProcess[idx]);
        return this.processSequentially(toProcess, idx + 1);
    }

    /** Process one logical message, and return a Promise to synchronize on */
    protected processLogicalMessage(message: LogicalMessage): Promise<void> {

        if (this.messages.filter(msg => msg === message).length == 0) {
            
            this.messages.push(message);
            switch (message.command) {
                case 'addComponents':
                    return this.loadAndInsertComponents((message as AddComponents).maps);
                case 'rebindComponents':
                    this.rebindExistingComponents((message as RebindComponents).maps);
                    return Promise.resolve();
                case 'removeAllUnprotected':
                    this.clearAllUnprotectedFields();
                    return Promise.resolve();
                case 'removeAllComponents':
                    this.removeAnyExistingComponent();
                    return Promise.resolve();
                case 'setCursorPosition':
                    this.setCursorPosition((message as SetCursorPosition).cursor);
                    return Promise.resolve();
                case 'windowComponents':
                    return this.loadAndActiveWindowComponents(message as WindowComponents);
                default:
                    let errorMessage = 'Unhandled backend command "' + message.command + '"';
                    console.log(errorMessage); // Ensure this makes its way to the logs
                    throw new Error(errorMessage);
            }
        }
    }

	/** ------------------------------------ Main methods -----------------------------------  **/

    /** Load components, then insert and bind them */
    private async loadAndInsertComponents(maps: Map[]): Promise<void> {
        this.checkModalComponents(maps);
        let componentTypeProms: Promise<any>[] = maps.map(map => this.getMapComponent(map.component));

        const componentTypes: any[] = await Promise.all(componentTypeProms);
        // Now sequentially insert components (order matters)
        for (let i = 0; i < maps.length; i++) {
            if (componentTypes[i] == null || componentTypes[i] == undefined) {
                throw new Error('Unknown component: "' + maps[i].component + '"');
            }
            this.insertComponents(maps[i], componentTypes[i]);
        }
    }

    /** Bind fields values and attributes to existing components */
    private rebindExistingComponents(maps: Map[]): void {

        for (let i = 0; i < maps.length; i++) {
            let map = maps[i];

            // Find the existing component for this map
            let component: ComponentRef<any> = this.componentsByName[map.component];
            if (component === undefined) {
                throw new Error('Component not found in existing ones, cannot rebind: ' + map.component);
            }

            this.decodeFields(component.instance, map);

            /** Clone fields object to trigger method "set data( data: Data )" from dynamic field component */
	        let fields : Field[] = map.fields; 
	        for (let i = 0; i < fields.length; i++) {
	            let field: Field = fields[i];
                let data: any = component.instance[field.id];
                if (!Array.isArray(data)){ // TODO: Treat array ?
                    this.cloneToUpdate(data, component.instance, field.id);
                }
			}
        }
    }
    
    /** Clear the contents of all currently displayed, unprotected fields, and reset their MDT flag */
    private clearAllUnprotectedFields(): void {
        for (let componentRef of this.injectedComponents) {
            let component = componentRef.instance;

            for (let fieldId of component.FIELDS) {
                let field = component[fieldId];
                if (Array.isArray(field)) {
                    // TODO What should we do here? Is there a 5250 equivalent behavior?
                    continue;
                }

                let data: Data = field;
                let unprotected: boolean = data.attributes && data.attributes.protection === 'UNPROT';
                if (!unprotected) {
                    continue;
                }

                data.value = data.initialValue = undefined; // An empty string will confuse Data#isModified()
                data.clearModified();
                this.cloneToUpdate(data, component, fieldId);
            }
        }
    }
    
    private removeAnyExistingComponent(): void {
        for (let i = 0; i < this.injectedComponents.length; i++) {
            this.injectedComponents[i].destroy();
        }
        this.injectedComponents = [];
        this.injectedModalComponents = [];
        this.componentsByName = {};
        this.modalComponentsByName = {};
        this.fieldsByPosition = {};
    }
    
    private setCursorPosition(cursor: number): void {
    	let injectedField: any = this.getFieldByPosition(cursor);
    	injectedField.initialCursor = true;
    }

    /** Load Window components, then insert and bind them */
    protected loadAndActiveWindowComponents(message: WindowComponents) {
        let maps = this.loadWindowComponents(message.maps);
        let proms = this.loadComponents(maps);
        
        // Now sequentially insert components (order matters)
        return Promise.all(proms).then((componentTypes: Array<Type<{}>>) => {
            for (let i = 0; i < maps.length; i++) {
                let componentName = maps[i].component;
                if (componentTypes[i] == null || componentTypes[i] == undefined) {
                    throw new Error('Unknown component: "' + componentName + '"');
                }  
                if (this.isModal()) {
                    if((maps[i].windowRef !== undefined && maps[i].windowRef == this.getName()) || componentName == this.getName()){
                        this.insertComponents(maps[i], componentTypes[i]);
                    }
                } else {
                    let modalName = maps[i].windowRef !== undefined ? maps[i].windowRef.toString() : componentName;
                    if(maps[i].windowRef === undefined && this.getModal(modalName) === undefined) {
                        // Build component, then bind message to UI
                        let component = this.dynamicTarget.createComponent(componentTypes[i]);
                        this.injectedComponents.push(component);
                        this.componentsByName[componentName] = component;

                        this.modalComponentsByName[componentName] = component;
                        this.injectedModalComponents.push(component);

                        // Send messages to the modal component
                        this.modalService.activeModal(modalName).next({message : message, parentComponent : this});
                    }
                }
            }
        });
    }

    /** ----------------------------------------------------------------------------------------  **/

    /** ------------------------------------ Common methods -----------------------------------  **/

    /** Clone and set Data describing a field (make sure modification is displayed; V7-3558) */
    private cloneToUpdate(data:Data, componentInstance, fieldId:string) {
        if (!Array.isArray(data)){ // TODO: Treat array ?
	        let cloneData = data.clone();
	        let pos: number = data.attributes.line * 80 + data.attributes.column;
	        this.fieldsByPosition[pos] = cloneData;
	        componentInstance[fieldId] = cloneData;
        }
    }

    /** Set up and return components loading/building factories */
    private loadComponents(maps: Map[]): Array<Promise<Type<{}>>> {
        // First load and setup asynchronously modules defining map components
        let proms: Array<Promise<Type<{}>>> = [];
        for (let i = 0; i < maps.length; i++) {
            let map = maps[i];

            // Search for the angular type corresponding to this component name
            let componentType = this.getMapComponent(map.component);
            if (componentType == null) {
                throw new Error('Unknown component: "' + map.component + '"');
            }

            // Load component-owning module dynamically
            proms.push(Promise.resolve(componentType));
        }

        return proms;
    }
    


    // Build component or reuse the existing one
    private insertComponents(map: Map, componentType: any) {
        // Get existing component or build a new one, then bind message to UI
        let existingComponent = this.getComponent(map.component);
        if(existingComponent !== undefined){
            this.decodeFields(existingComponent.instance, map);
        } else {
        	// Build component, then bind message to UI
            let component = this.dynamicTarget.createComponent(componentType);
            this.injectedComponents.push(component);
            this.componentsByName[map.component] = component;
            this.decodeFields(component.instance, map);
        }
    }

    /** Initialize a map component with JSON informations provided by the backend */
    private decodeFields(map: any, inputMap: any): void {

        /** Map technicals fields */
        if (inputMap.overlay !== undefined) {
        	this.mapFieldToData( map, 'overlay', inputMap.overlay);
        }
        this.mapFieldToData( map, 'startLineNumber',  inputMap.startLineNumber);

        /** Map to business fields */
        let fields : Field[] = inputMap.fields; 
        for (let i = 0; i < fields.length; i++) {
            let field: any = fields[i];
            let data: any = map[field.id];
            if (data == null) {
                throw new Error('No entry in map for field ' + field.id)
            }

            // Reflexively set field value
            if (field.data !== undefined) {
            	data.value = field.data;
            } else if (field.fields !== undefined && Array.isArray(data)) {
                if(field.component !== undefined){
                    this.subComponentsByName[field.component] = data;
                }
                for (let subMap of field.fields) {
                    let arrayItem : any ={};
                    for (let subField of subMap.fields) {
                        let subData = new Data ;
                        subData.value = subField.data;
                        this.fillData(subData, subField);
                        arrayItem[subField.id] = subData;
                    }
                    arrayItem["FIELDS"] = subMap.fields;
                    arrayItem['forceModified'] = subMap.forceModified
                    
                    if(subMap.relativeRecordNumber != undefined){
                        data[subMap.relativeRecordNumber-1] = arrayItem;
                    } else {
                        data.push(arrayItem);
                    }
                }
            }

            // Make sure that subsequent calls to Data instance methods will be possible
            // Required since objects generated in components are "properties only" objects and not instances of Data
            if (!Array.isArray(data)) {
                Object.setPrototypeOf(data, Data.prototype);
            }
            
            if (inputMap.cursorLine !== undefined && inputMap.cursorColumn !== undefined) {
                data.cursorLine = inputMap.cursorLine;
                data.cursorColumn = inputMap.cursorColumn;
            }
            
            // Ensure attributes are set on component
            this.fillData(data, field);
            
        }

        // If the component contains a subfile, update its record number so the correct page will be displayed
        if(map.isSubfileControl == true){
        	if(map.updateSubfile()){
                this.addErrorMessage("Roll_up_down_past_first_last_record");
            }
        }
    }


    /* Fill data from field. Code also expects this to be called on Array => "data" can be of type Data or Array */
    private fillData(data : any, field: Field): void {

        // Keep track of initial value (for "modified" detection purpose)
        data.initialValue = data.value;

        if (field.attributes !== undefined) {
            // Provide attributes for decoding by the dynamic-field component
            data.attributes = field.attributes;

            // Signal that field data must be sent inconditionnaly (even if not modified)
            // Keep existing value if we did not receive attributes (V7-139, V7-127)
            if (Array.isArray(data)) {
                // TODO Probably not needed since decodeFields also sets forceModified in the Array case (V7-7297)
                data['forceModified'] = field.attributes.forceModified;
            } else {
                let actualData: Data = data as Data;
                 
                 // This test gives us some room for not sending forceModified in attributes in the future
                 if (field.attributes.forceModified !== undefined) {
                 	// Usual "forceModified from backend will set the MDT on the terminal" scenario
                    if (field.attributes.forceModified) {
                        actualData.setModified();
                    } else {
                        // Used to reset the MDT programmatically; only activated for CICS/BMS now
                        if (this.configuration.forceModifiedCanResetMDT) {
                            actualData.clearModified();
                        }
                    }
                 }
            }

            // Update consultation mode (readOnly & disabled)
            data.disabled =  field.attributes && field.attributes.protection === 'ASKIP';
            data.protected = field.attributes && field.attributes.protection === 'PROT';
            
            let pos: number = data.attributes.line * 80 + data.attributes.column;
            this.fieldsByPosition[pos] = data;
        }

        if (field.initialCursor !== undefined) {
            data.initialCursor = field.initialCursor;
        }
    }

    /* Map field to data value. */
    private mapFieldToData(map : any, data: string, field: any): void {
        if (map[data] !== undefined && field !== undefined) {
            map[data] = field;
        }
    }    
    
    /** --------------------------------------------------------------------------------------  **/
    
    /** ------------------------------------ Modal methods -----------------------------------  **/

    /** Separate window component to be created from existing ones */
    private loadWindowComponents(maps: WindowMap[]): WindowMap[] {
    	let removeAll = false;
        let newMaps: WindowMap[] = [];
        let existingComponent: { [key: string]: AddComponents } = {}
        for (let i = 0; i < maps.length; i++) {
            let modalName = maps[i].windowRef !== undefined ? maps[i].windowRef.toString() : maps[i].component.toString();

            // Destroy all windows that overlay the current one
            this.destroyOverlayingModalComponents(modalName, maps[i].remove);

            // If the modal already exists, just update the component
            // else, create the modal component
            let modal = this.getModal(modalName);
            if(modal === undefined){
                // The modal doesn't exist so need to be created
                newMaps.push(maps[i]);
            } else {
                // The modal exists, just recreate components
                if(existingComponent[modalName] == undefined){
                    let addMessage: AddComponents = { command: 'addComponents', maps: []};
                    addMessage.maps.push(maps[i]);
                    existingComponent[modalName] = addMessage;
                } else {
                    existingComponent[modalName].maps.push(maps[i]);
                }

                // TODO: Needed ? Make it local to the modal
                if(maps[i].overlay !== true){  
                    removeAll = true; 
                }
            }
        }

        // For all components from existing modal, send a message
        for (let modalName of Object.keys(existingComponent)) {
            if(removeAll){
                let removeMessage: RemoveAllComponents = { command: 'removeAllComponents' };
                this.modalService.activeModal(modalName).next({message : removeMessage, parentComponent : this});
            }
            this.modalService.activeModal(modalName).next({message : existingComponent[modalName], parentComponent : this});
        }

        // Return the new modal
        return newMaps;
    }

    /** Destroy All Modal components if there is a message to main window (except standard-messaline) */
    private checkModalComponents(maps: Map[]): void {
        if(this.injectedModalComponents.length == 0){
            return;
        }

        let destroy: boolean = false;
        for (let i = 0; i < maps.length; i++) {
            if(maps[i].component !== 'standard-messageline'){
                destroy = true;
            }
        }
        if(destroy){
            this.destroyAllModalComponents();
        }
    }
    
    /** Destroy All Modal components */
    public destroyAllModalComponents(): void {
        for (let i = 0; i < this.injectedModalComponents.length; i++) {
            const index = this.injectedComponents.indexOf(this.injectedModalComponents[i], 0);
            if (index > -1) {
                this.injectedComponents.splice(index, 1);
            }
            this.injectedModalComponents[i].destroy();

        }
        this.injectedModalComponents = [];
		this.modalComponentsByName = {};
    }
    
    /** Destroy All Modal components above the message's one */
    private destroyOverlayingModalComponents(modalName: String, remove: boolean): void {
    	// If the window message has a remove property, remove all windows
        if(remove){
            this.destroyAllModalComponents();
        }

        // Get current window index to remove overlaying windows
        let startIndex = -1;
        let keys: any = Object.keys(this.modalComponentsByName);
        for (let key of keys) {
            if(key == modalName){
                startIndex = this.injectedModalComponents.indexOf(this.modalComponentsByName[key], 0) + 1;
            } else if(startIndex > -1) {
                delete this.modalComponentsByName[key];
            }
        }
        if(startIndex > 0 ){
            for (let i = startIndex; i < this.injectedModalComponents.length; i++) {
                console.log('Destroy Modal Component' + i);
                const index = this.injectedComponents.indexOf(this.injectedModalComponents[i], 0);
                if (index > -1) {
                    this.injectedComponents.splice(index, 1);
                }
                this.injectedModalComponents[i].destroy();

            }
            this.injectedModalComponents = this.injectedModalComponents.slice( 0 , startIndex );
        }
    }
    
    public getModalComponent() : { [key: string]: ComponentRef<any> } {
        return this.modalComponentsByName;
    }
    
    @HostListener('window:wheel', ['$event'])
    onWindowScroll(event: WheelEvent): void {
        if (event.deltaY < 0) {
            // Detected scroll up action, simulate 'PAGEUP'
            this.simulateKeyPress("PageUp");
        } else if (event.deltaY > 0) {
            // Detected scroll down action, simulate 'PAGEDOWN'
            this.simulateKeyPress("PageDown");
        }
    }
    
    simulateKeyPress(keyValue: string) {
        const event = new KeyboardEvent("keydown", {
            key: keyValue,
            altKey: false,
            ctrlKey: false,
            shiftKey: false,
            metaKey: false,
            bubbles: true
        });
        document.dispatchEvent(event);
    }
    
    /** ----------------------------------------------------------------------------------------  **/
    
    /** ----------------------------------------------------------------------------------------  **/
    /** React to attention keys */
    @HostListener('document:keydown', ['$event'])
    onKeyDownListener(e: KeyboardEvent) {
        // Check if the frontend is waiting for a response from the backend
        if ( AbstTermComponent.isWaitingForBackendResponse ) {
        // If waiting, do not perform any action
            e.preventDefault(); 
            e.stopImmediatePropagation(); 
            return; 
        }
        
    	// If the current component is not the one on the top, stop listening
        if(!this.isTopComponent()){
            return;
        }

    	let activeElementDoc : Element = document.activeElement;
        let activeElement: string = activeElementDoc.id;
        let activeRecord: string = this.getActiveRecord(activeElementDoc);
        let attentionKey: string = null;
        

        let cursorPosition: number = 0;
        if ( e.target instanceof HTMLInputElement ) {
            cursorPosition = e.target.selectionStart; 
        }

        // Robustness switch from key / which / keyCode
        // See https://keycode.info/ for key codes
        let key = e.key || '';
        let keyCode = e.which || e.keyCode || -1;
        let groups = [];
        if (keyCode == 13 || key === 'Enter') {
            attentionKey = 'ENTER';
        }  else if (this.transactionService.is5250() && (keyCode == 33 || key === 'PageUp')) {
            if(!this.pagingSFL(e)){
                attentionKey = 'PAGEUP';
            } else {
                this.displaySingleErrorMessage('');
            }
        }  else if (this.transactionService.is5250() && (keyCode == 34 || key === 'PageDown')) {
            if(!this.pagingSFL(e)){
                attentionKey = 'PAGEDOWN';
            } else {
                this.displaySingleErrorMessage('');
            }
        } else if ((keyCode == 112 && e.ctrlKey) || (keyCode == 45 && e.altKey)) {
            // Ctrl + F1 or Alt + Insert for PA1 (V7-4104)
            attentionKey = 'PA1';
        } else if ((keyCode == 113 && e.ctrlKey) || (keyCode == 36 && e.altKey)) {
            // Ctrl + F2 or Alt + Home for PA2 (V7-4104)
            attentionKey = 'PA2';
        } else if ((keyCode == 114 && e.ctrlKey) || (keyCode == 33 && e.shiftKey)) {
            // Ctrl + F3 or Shift + PageUp for PA3 (V7-4104)
            attentionKey = 'PA3';
        } else if (keyCode >= 112 && keyCode <= 123) {
        	if (this.processDropFold(e)) {
        		// avoid computing attentionKey
        		attentionKey = null;
        	} else {
				let pfk = (keyCode - 111);
				if (e.shiftKey) {
					// Shift + Fx for PF13 to PF24 (V7-2657)
					pfk += 12;
				}
            	attentionKey = 'PF' + pfk;
            }
        } else if (groups = key.match(/^F(\d+)$/)) {
            attentionKey = 'PF' + groups[1];
        } else if (keyCode == 19) {
            // "Pause" key on a PC keyboard
            attentionKey = 'CLEAR';
        }

        if (attentionKey !== null) {
            console.log('Attention key pressed (' + attentionKey + ')');
            e.stopImmediatePropagation();
            e.preventDefault();
            

            // Build a message to the backend
            let hasError = false;
            this.clearErrorMessages();
            let termMessage: any = { 'attentionKey': attentionKey, 'activeRecord': activeRecord, 'activeField': activeElement, 'cursorPosition': cursorPosition, 'fields': [] };
            for (var m = 0; m < this.injectedComponents.length; m++) {
                let injectedComponent: any = this.injectedComponents[m];
                let componentName: string = this.getComponentName(injectedComponent);
                let map: any = injectedComponent.instance;

                // Protection (CTL into destroyed window case)
                if (map.FIELDS !== undefined) {
	                // Collect fields value and their "modified" status
	                let FIELDS: string[] = map.FIELDS;
	                for (var i = 0; i < FIELDS.length; i++) {
	                    let fieldName: string = FIELDS[i];
	                    let data: Data = map[fieldName];

	                    if (Array.isArray(data)) {
                            let subComponentName: string = this.getSubComponentName(data);

	                   		let index=0;
	                    	for (var a = 0; a < data.length; a++) {
	                    		let arrayData = data[a];
	                            // An field on row at least is modified
	                            let rowModified: boolean = false;
	                    		for (let subFieldName of arrayData.FIELDS) {
	                    			let subField: Data = arrayData[subFieldName.id];
	                                rowModified = rowModified || subField.isModified();
	                            }
	                    		for (let subFieldName of arrayData.FIELDS) {
	                    			let subField: Data = arrayData[subFieldName.id];
	                                let modified: boolean = subField.isModified();
				                    /** Field value is only sent if modified (V7-130). It could be modified because :
                                     - 1 field of row at least has been modified (or is set modified explicitely)
                                     - the current field has been modified (or is set modified explicitely)
                                     - all the row is set modified explicitely (SLFNXTCHG on SFL)
                                    */
				                    if (rowModified || modified || arrayData.forceModified) {
    		                        	this.reformatValue(subField);
				                        let fieldState: any = {"component": subComponentName, 'id': subFieldName.id + "_" + index, 'value': subField.value };
				                        termMessage.fields.push(fieldState);
				                    }
				                }
	                    		index++;
	                    	}
	                    } else {
	                    	if(Object.keys(data).length !== 0) {
		                    	// Field value is only sent if modified (V7-130)
		                    	if (data.isModified()) {
		                        	this.reformatValue(data);
		                        	let fieldState: any = {"component": componentName, 'id': fieldName, 'value': data.value, ...(data.attributes !== undefined && data.attributes.isPassword && {'ispassword': data.attributes.isPassword})};
		                        	termMessage.fields.push(fieldState);
		                    	}
		                    }
		                }
	                }
	            }
            }

            if(hasError){
                return;
            }

            AbstTermComponent.isWaitingForBackendResponse  = true;

            // Send message to frontend; wait for an answer to react on
            this.transactionService.runTransaction(this.nextTransactionId, termMessage)
                .then((message: BackendMessage) => this.onReceivedMessage(message))//.then(() => console.log("apres receive"))
                .catch((ex) => {
                    console.error('Error invoking next transaction', ex);
                });
        }
    }
    
    @HostListener('document:message', ['$event'])
    onMessage(event: MessageEvent) {
        // Main screen but there is a modal, do not display the message here
        if(!this.isModal() && this.injectedModalComponents.length > 0){
            return;
        }
        this.addErrorMessage(event.data);
    }
    
    /** ----------------------------------------------------------------------------------------  **/
    
    /** ------------------------------------ Utility methods -----------------------------------  **/
    /** Format the value before send it back to the program */
    private reformatValue(data: Data) {
        if(this.configuration.uppercaseInput){
            if (data && data.value){
                data.value = data.value.toUpperCase();
            }
        }
    }
    
    /** Try to pag on Subfile, if paging is done by the table (doPaging returns false), return true
     * If the paging is not done, check following subfile component and return false if no paging has been done.
    */
    protected pagingSFL(key: KeyboardEvent): boolean {
        let result = false;
        for (var m = 0; m < this.injectedComponents.length; m++) {
            let injectedComponent: any = this.injectedComponents[m];
            let map: any = injectedComponent.instance;
            if(map.isSubfileControl == true) {
                if(!map.doPaging(key)) {
                    key.stopImmediatePropagation();
                    key.preventDefault();
                    return true;
                }
            }
        }
        return result;
    }

    private isTopComponent(): boolean {
        if(this.parentComponent === undefined){
            return this.injectedModalComponents.length == 0;
        } else {
            // All modal are built from the root component
            let keys: any = Object.keys(this.parentComponent.getModalComponent());
            return keys[keys.length - 1] == this.getName();
        }
    }

    /** Get component name */
    private getComponentName(injectedComponent: ComponentRef<any>): string {
		let keys: any = Object.keys(this.componentsByName);
        for (let key of keys) {
        	let component: ComponentRef<any> = this.componentsByName[key];
            if (component === injectedComponent) {
            	return key;
            }
        }
        return "";
    }

    /** Get sub-component (array) name */
    private getSubComponentName(data: any): string {
        let keys: any = Object.keys(this.subComponentsByName);
        for (let key of keys) {
            let component: ComponentRef<any> = this.subComponentsByName[key];
            if (component === data) {
                return key;
            }
        }
        return "";
    }
    
    private processDropFold(key: KeyboardEvent): boolean {
        for (var m = 0; m < this.injectedComponents.length; m++) {
            let injectedComponent: any = this.injectedComponents[m];
            let map: any = injectedComponent.instance;
            if(map.isSubfileControl == true) {
                if(map.doDropFold(key)) {
                    key.stopImmediatePropagation();
                    key.preventDefault();
                    return true;
                }
            }
        }
        return false;
    }
    
	
	// Search for the active record from the active element (field)
    private getActiveRecord(activeElement: Element): string {
        let allComponents: any = Object.keys(this.componentsByName);
        let allSubComponents: any = Object.keys(this.subComponentsByName);

        let parent = activeElement.parentNode;
        while(parent.nodeName !== '#document'){
            let nodeName = parent.nodeName.toLowerCase();
            if(allComponents.includes(nodeName) || allSubComponents.includes(nodeName)){
                // Return only the record name
                let componentIds = nodeName.split("-");
                return componentIds[1];
            }
            parent = parent.parentNode;
        }
        return "";
    }
    
    /** ----------------------------------------------------------------------------------------  **/
    
    
    /** ------------------------------------ Error Message methods -----------------------------------  **/
    
    // Delete all messages already added
    protected clearErrorMessages(): void {
        let component: ComponentRef<any> = this.componentsByName["standard-arraymessageline"];
        if (component === undefined) {
            this.displaySingleErrorMessage('');
            return;
        }

        let messageLines: any = component.instance["arraymessageline"];
        if (messageLines === null) {
            return;
        }

        if ((component.instance.isSubfileControl == true) && (component.instance.arraymessageline !== undefined)) {
            component.instance.clearSubfile();
        }
    }
    
	protected displaySingleErrorMessage(msg: string, secondMsgId?: string, data?: string[]) {
        // Find the existing component for this map
        let component: ComponentRef<any> = this.componentsByName["standard-messageline"];
        if (component === undefined) {
            let parent = this.getParent();
            if (parent !== undefined) {
            	// Use msg if the MSGLIN == false
                this.windowErrorMessage = msg;
            }
            return;
        }

        let messageline: any = component.instance["messageline"];
        let messageId = component.instance["messageId"];
        if (messageline == null) {
            return;
        }
        // If message line has not previously been set or if we are trying to clear the message, proceed.
        if(!messageline.value || !msg){
            component.instance["messageline"] = new Data((msg && data ? this.formatMessage(msg, data) : msg), undefined, this.service.createDummyAttributes(), false, undefined, undefined);
            // If we are setting a new message, set the message id and the second-level message too.
            if(msg){
                // If second-level message id has been provided use it, else set the default id CPF9897, then translate the message.
                secondMsgId = secondMsgId ? secondMsgId : 'CPF9897'
                let translatedHelp = this.languageService.translateHelp(secondMsgId);
                // If we have data to replace the place-holders, then format the message.
            	let secondMessage = data ? this.formatMessage(translatedHelp, data) : translatedHelp;
                component.instance["messageId"] = new Data(secondMsgId, undefined, this.service.createDummyAttributes(), false, undefined, undefined);
                component.instance["secondMessageline"] = new Data(secondMessage, undefined, this.service.createDummyAttributes(), false, undefined, undefined);
            }
        }
    }

    // Add the error message msg to the array message line
	protected addErrorMessage(messageIdentifier: string, key?: KeyboardEvent, data?: string[]) {
    	let msg = this.languageService.translate(messageIdentifier);
        let messageSplit = msg.split(";,");

        if (data !== undefined) {
            messageSplit[0] = this.formatMessage(messageSplit[0], data);
        }
        
        let component: ComponentRef<any> = this.componentsByName["standard-arraymessageline"];
        if (component === undefined) {
            if(messageSplit.length > 1){
                this.displaySingleErrorMessage(messageSplit[0], messageIdentifier, data);
            } else {
                this.displaySingleErrorMessage(messageSplit[0], undefined, data);
            }
            return;
        }

        let messageLines: any[] = component.instance["arraymessageline"];
        if (messageLines === undefined) {
            return;
        }

        let message = new Data(messageSplit[0], undefined, this.service.createDummyAttributes(), false, undefined, undefined);
        let empty = new Data('', undefined, this.service.createDummyAttributes(), false, undefined, undefined);
        let FIELDS: any[] = [];
        FIELDS.push([
            {
                type: 'simple',
                id: "messageId",
                data: empty,
                attributes: this.service.createDummyAttributes(),
            },
            {
                type: 'simple',
                id: "messageline",
                data: msg,
                attributes: this.service.createDummyAttributes(),
            },
            {
                type: 'simple',
                id: "secondMessageline",
                data: empty,
                attributes: this.service.createDummyAttributes(),
            }
        ]);

        interface NewMessage {
            [key: string] : any;
        }

        let newMessage : NewMessage = {
            messageline: message,
            FIELDS: FIELDS,
            forceModified: false
        };

        // If we have a second-level message translate and format it.
        if(messageSplit.length > 1){
            let translatedMessage = this.languageService.translateHelp(messageSplit[1]);
            let secondMessage = data ? this.formatMessage(translatedMessage, data) : translatedMessage;
            newMessage.messageId = new Data(messageIdentifier, undefined, this.service.createDummyAttributes(), false, undefined, undefined);
            newMessage.secondMessageline = new Data(secondMessage, undefined, this.service.createDummyAttributes(), false, undefined, undefined);
        } else { // Else set the default message id and second-level message.
            newMessage.messageId = new Data('CPF9897', undefined, this.service.createDummyAttributes(), false, undefined, undefined);
            let secondMessage = this.languageService.translateHelp(newMessage.messageId.value)
            newMessage.secondMessageline = new Data(secondMessage, undefined, this.service.createDummyAttributes(), false, undefined, undefined);
        }

		// Delete the message from messageLines if exists
        messageLines.forEach((element, index) => {
            if (element.messageline.value === newMessage.messageline.value) {
                messageLines.splice(index, 1);
            }
        });

		// Add the message at the beginning of messageLines
        if (component.instance.getCurrentRecordNumber() === 0 && key !== undefined) {
            if (key.key === 'PageUp') {
                messageLines.unshift(newMessage);
                component.instance.doPaging(key);
                return;
            }
        } 

        messageLines.push(newMessage);
        if (key !== undefined) {
            component.instance.doPaging(key);
        }
    }
    
    public getErrorMessageComponent() : any {
        let component: ComponentRef<any> = this.componentsByName["standard-messageline"];
        if (component !== undefined) {
            return component.instance;
        }

        component = this.componentsByName["standard-arraymessageline"];
        if (component === undefined) {
            console.log("No standard messageline on the screen");
            return;
        }

        let arrayMsgLine: any = component.instance["arraymessageline"];
        let current = component.instance.getCurrentRecordNumber();
        let currentMsgs = arrayMsgLine[current];

        return currentMsgs;
    }
    
    public getSubfileMessageComponent(comp: string, recordName: string) : any {
        let component!: ComponentRef<any>;
        Object.keys(this.componentsByName).forEach( key => {
            if(key.endsWith("-" + recordName)){
                component = this.componentsByName[key];
                return;
            }
        })

        if(component !== undefined){
            return component.instance;
        }
        
        Object.keys(this.subComponentsByName).forEach( key => {
            if(key.endsWith("-" + recordName)){
                let index = comp.split("subfileMessageLine_")[1];
                component = this.subComponentsByName[key][index];
                return;
            }
        })
        
        return component;
    }
    
    public getErrorMessage() {
        // Find the existing component for this map
        let parent = this.getParent();
        if (parent === undefined) {
        	return;
        }
        
        let component: ComponentRef<any> = parent.getErrorMessageComponent();
        if (component === undefined) {
            return;
        }
        let data: any = component["messageline"];
        if (data == null || data.displayedValue === "") {
            return;
        }
        this.windowErrorMessage = data.displayedValue;
    }
    
    /* Format the message to replace placeholders with provided data */
    private formatMessage(message: string, data: string[]): string {
        const matches = message.match(/&\d/g)
        if(matches && matches.length == 1 && data.length > 1){
            return message.replace(/&\d/g, match => {
                let replacement: string = "";
                for (let i = 0; i < data.length; i++) {
                    replacement += data[i];
                    replacement += i <= data.length-2 ? ", " : "";
                }
                return replacement || match;
            })
        } else {
            return message.replace(/&\d+/g, match => {
                const index = parseInt(match.slice(1)) -1;
                return data[index] || match;
            })
        }
    }
    
    /*
     * Format the message help for the display station, consider the format control characters '&N', '&B', and '&P'.
     *
     * &N - Forces the message help to a new line (column 2). If the help is longer than one line, the next lines are indented to column 4 until the end of the help or until another format control character is found.
     * &P - Forces the message help to a new line, indented to column 6. If the help is longer than one line, the next lines start in column 4 until the end of the help or until another format control character is found.
     * &B - Forces the message help to a new line, starting in column 4. If the help is longer than one line, the next lines are indented to column 6 until the end of the help or until another format control character is found.
     */
    applyFormatControl(input: string, size: number): string {
        let formattedMessage = '';
        let count = 0;
        let columnOffset = "";
        for (let i = 0; i < input.length; i++) {
            if (input[i] === '&' && (input.substring(i, i + 2) === '&N' || input.substring(i, i + 2) === '&P' || input.substring(i, i + 2) === '&B')) {
                const formatControlChar = input.substring(i, i + 2);
                formattedMessage += '\n';
                if (formatControlChar === '&N') {
                    columnOffset = "  ";
                }
                if (formatControlChar === '&P') {
                    formattedMessage += '    ';
                    columnOffset = "  ";
                } else if (formatControlChar === '&B') {
                    formattedMessage += '  ';
                    columnOffset = "    ";
                }
                count = 0;
                i += 2;
            } else {
                formattedMessage += input[i];
                count++;
                if (count === size) {
                    if (input[i] !== ' ') {
                        let backTrackCount = 0;
                        while (input[i - backTrackCount] !== ' ') {
                            backTrackCount++;
                        }
                        formattedMessage = formattedMessage.slice(0, formattedMessage.length - (backTrackCount)) + '\n' + columnOffset + formattedMessage.slice(formattedMessage.length - (backTrackCount));
                        count = backTrackCount + columnOffset.length;
                    } else {
                        formattedMessage += '\n'+columnOffset;
                    }
                }
            }
        }
        return formattedMessage;
    }
}
