import { Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FieldHelpMetadata, HelpItem, HelpPanel, ScreenHelpMetadata } from './term/term.model';
import { Attributes, WindowComponents, WindowMap } from './term/message';

@Injectable()
/** Service for Help screen */
export class HelpService {

    // Legacy help key
    private helpKeyboardKey: string = 'F1';
    // Defines the number of vertical margins, with 3 at the top and 3 at the bottom of the help modal content
    private verticalMargins : number = 6;
    // Determines the width required to display different function keys in the help modal regardless the DSP mode
    private helpModalWidth : number = 79;
    // Specifies the display width for DS4 (132)
    private DiplayWidthDS4 : number = 132;
    private Diplayheight : number = 26;

    // Represents the contents of the assets/help-panels.json file
    private helpPanels:  HelpPanel[] = [];
    // Contains help metadata for fields specified in all input maps within the last BackendMessage
    private helpedFieldsMetaData : FieldHelpMetadata[] = [];
    // Holds the general screen help for the current screen, extracted from assets/help-panels.json
    private generalHelpItem: HelpItem;    


    constructor(
        private http: HttpClient
    ) {
        //Deserialize assets/help-panels.json
        this.http.get<HelpPanel[]>('assets/help-panels.json').subscribe(data => { this.helpPanels = data});
    }

    /**
     * This method is called as many time as there are InputMaps in each LogicalMessage in the recieved BackendMessage
     * @param inputMap 
     * @returns 
     */
    public loadHelpedFields(inputMap : any): void {
        // Early quit if the current inputMap has no help description
        if(inputMap.helpMetaData === undefined && inputMap.screenHelp === undefined){
            return;
        }

        // A function to check if an object is empty
        function isObjectEmpty(obj: any): boolean {
            return Object.keys(obj).length === 0 && obj.constructor === Object;
        }

        if (!isObjectEmpty(inputMap.screenHelp)) {
            this.generalHelpItem = this.getGeneralHelpItem(inputMap.screenHelp);
            // if the screen help title was not provided in assets\help-panels.json
            if (!this.generalHelpItem.helpTitle) {
                // use the one provided in the legacy Map definition
                this.generalHelpItem.helpTitle = inputMap.screenHelp.helpTitle;
            }
        }

        if (inputMap.helpMetaData && inputMap.helpMetaData.length > 0) {
            for (const FieldToHelpMap of inputMap.helpMetaData) {
                this.helpedFieldsMetaData.push(FieldToHelpMap);
            }
        }
    }
    
    public isHelpAction(e: KeyboardEvent): boolean {
        return (this.helpKeyboardKey === e.key && (this.helpedFieldsMetaData.length !== 0 || this.generalHelpItem !== undefined));
    }
    
    public isGeneralHelpDefined() {
        return this.generalHelpItem !== undefined;
    }
    
    public isHelpedField(activeElement: string) {
        return this.helpedFieldsMetaData.some(item => item.fieldId === activeElement);
    }

    // Reinitialise the state of this singleton service
    public clear() {
        this.helpedFieldsMetaData = [];
        this.generalHelpItem = undefined
    }

    public buildGeneralHelpWindowMap(mainDspMode: string, isExtended: boolean, dummyAttributes: Attributes): WindowComponents {
        let windowMaps: WindowMap[] = [];
        windowMaps.push({
            component: 'help-modal',
            fields: [
            {
                id: "helpTitle",
                data: this.generalHelpItem.helpTitle,
                attributes: dummyAttributes
            },
            {
                id: "helpContent",
                data: this.generalHelpItem.helpContent,
                attributes: dummyAttributes
            },
            {
                id: "diplayMode",
                data: mainDspMode,
                attributes: dummyAttributes
            }
            ],
            positionLeft: isExtended? this.DiplayWidthDS4 - this.helpModalWidth : 1,
            positionTop: 1,
            height: this.countHelpTextLines(this.generalHelpItem.helpContent) + this.verticalMargins,
            width: this.helpModalWidth,
            mapWidth: 0,
            messageLine: true,
            actionKeys: [ "02", "03", "12"],
            borderDashed: true
        });
        let windowMessage: WindowComponents = { command: 'windowComponents', maps: windowMaps };
        return windowMessage;
    }

    public buildFieldHelpWindowMap(target: HTMLInputElement, mainDspMode: string, isExtended: boolean, dummyAttributes: Attributes): WindowComponents {

        let insideVerticalMargins : number = 2;
        let fieldHelpItem: HelpItem = this.getFieldHelpItem(target);
        let helpModalHeight: number = this.countHelpTextLines(fieldHelpItem.helpContent) + this.verticalMargins;
        let windowMaps: WindowMap[] = [];
        windowMaps.push({
            component: 'help-modal',
            fields: [
            {
                id: "helpTitle",
                data: `${fieldHelpItem.helpTitle}`,
                attributes: dummyAttributes
            },
            {
                id: "helpContent",
                data: fieldHelpItem.helpContent,
                attributes: dummyAttributes
            },
            {
                id: "diplayMode",
                data: mainDspMode,
                attributes: dummyAttributes
            }
            ],
            positionLeft: isExtended? (this.DiplayWidthDS4 - this.helpModalWidth)/2 : 1,
            positionTop: Math.max(this.Diplayheight - (helpModalHeight + insideVerticalMargins), 1),
            height: helpModalHeight,
            width: this.helpModalWidth,
            mapWidth: 0,
            messageLine: true,
            actionKeys: [ "02", "03", "12"],
            borderDashed: true
        });
        let windowMessage: WindowComponents = { command: 'windowComponents', maps: windowMaps };
        return windowMessage;
    }

    private getFieldHelpItem(target: HTMLInputElement): HelpItem {

        let helpMetadataTarget: FieldHelpMetadata = this.helpedFieldsMetaData.find(element => element.fieldId === target.id);
        if (!helpMetadataTarget) {
            console.log('Unable to find the help description for the selected field with ID: ' + target.id);
            return;
        }

        let helpPanel: HelpPanel = this.helpPanels.find(panel => panel.panelId === helpMetadataTarget.panelId);
        if (!helpPanel) {
            console.log('Unable to find the help panel ' + helpMetadataTarget.panelId);
            return;
        }

        let fieldHelpItem: HelpItem = helpPanel.helpItems.find(item => item.helpId === helpMetadataTarget.helpItemId);
        if (!fieldHelpItem) {
            console.log('Unable to find the help item with the id  ' + helpMetadataTarget.helpItemId + ' in the help panel ' + helpPanel.panelId);
            return;
        }

        return fieldHelpItem;
    }

    private getGeneralHelpItem(generalHelpScreenMetaData : ScreenHelpMetadata) : HelpItem {
        //Get the panel
        let helpPanel: HelpPanel = this.helpPanels.find(panel => panel.panelId === generalHelpScreenMetaData.panelId);
        if (!helpPanel) {
            console.log('Unable to find the general help panel ' + generalHelpScreenMetaData.panelId);
            return;
        }

        //Get the help item from the panel
        let helpItem: HelpItem = helpPanel.helpItems.find(item => item.helpId === generalHelpScreenMetaData.helpItemId);
        if (!helpItem) {
            console.log('Unable to find the general help item with the id  ' + generalHelpScreenMetaData.helpItemId + ' in the help panel ' + helpPanel.panelId);
            return;
        }
        return helpItem;
    }

    private countHelpTextLines(html: string): number {
        // a help text line can not excceed this number
        let maxLineLength: number = 78; 
        // Remove HTML tags to calculate line breaks
        const textWithoutHTML = html.replace(/<[^>]*>/g, "");
        const words = textWithoutHTML.split(/\s+/); // Split text into words
        let lineCount = 0;
        let currentLineLength = 0;
        for (const word of words) {
          // Check if adding the word exceeds the maximum line length
          if (currentLineLength + word.length + 1 <= maxLineLength) {
            // If adding the word and a space doesn't exceed the max line length, add them to the current line
            if (currentLineLength > 0) {
              currentLineLength += 1; // Add a space
            }
            currentLineLength += word.length;
          } else {
            // Start a new line with the word
            lineCount++;
            currentLineLength = word.length;
          }
        }
        // If there are additional lines left for the remaining words
        if (currentLineLength > 0) {
          lineCount++;
        }

        // Count the number of <p> tags and add them as blank lines
        const pTagCount = (html.match(/<p\s*>/g) || []).length;
        lineCount += pTagCount;

        return lineCount;
    }
}
