import { Component} from '@angular/core';
import { Window } from "../commonMap/window";
import { LanguageService } from 'app/language/language-service';

@Component({
    moduleId: module.id,
    selector: 'help-modal',
    template: `
    <div [ngStyle]="mapDivStyle()">
        <div class='lgr_col'>
            <div [innerHTML]="getHelpTitleHtml()" [ngStyle]="helpTitleStyle()"></div>
            <div class='lgr_col empty'></div>
            <div [innerHTML]="getHelpContentHtml()" [ngStyle]="helpContentStyle()"></div>
            
            <div class='lgr_col'>
                <div class='lgr_6 col_72'><span class='white' id='text1'>{{languageService.translate("Bottom")}}</span></div>
            </div>
            <div class='lgr_col'>
                <div class='lgr_13 col_02'><span class='blue' id='textF2'>F2={{languageService.translate("ExtendedHelp")}}</span></div>
                <div class='lgr_11 col_25'><span class='blue' id='textF10'>F10={{languageService.translate("MoveToTop")}}</span></div>
                <div class='lgr_12 col_55'><span class='blue' id='textF11'>F11={{languageService.translate("SearchIndex")}}</span></div>
            </div>
            <div class='lgr_col'>
                <div class='lgr_13 col_02'><span class='blue' id='textF12'>F12={{languageService.translate("Cancel")}}</span></div>
                <div class='lgr_11 col_25'><span class='blue' id='textF13'>F13={{languageService.translate("InfoAssistant")}}</span></div>
                <div class='lgr_12 col_55'><span class='blue' id='textF24'>F24={{languageService.translate("MoreKeys")}}</span></div>
            </div>
        </div>
    </div>`
})
export class HelpModalSubComponent extends Window {
    helpTitle: any = {};
    helpContent: any = {};
    diplayMode: any = {};

    public FIELDS: string[] = ['helpTitle', 'helpContent', 'diplayMode'];

    constructor(public languageService: LanguageService) {
        super();
    }

    getHelpTitleHtml() {
        return this.helpTitle.value;
    }

    getHelpContentHtml() {
        return this.helpContent.value;
    }

    helpTitleStyle() {
        const dspCoeff : string = this.diplayMode.value === "*DS4" ? "100%/131" : "1.25%"
        const helpWindowWidth : number = 79;
        let titleTextLenght = this.helpTitle.value.toString().replace(/<[^>]*>/g, "").trim().length;
        let titleStartPosition : number = (helpWindowWidth - titleTextLenght)/2
        let style = "{";
        style += '"color":"white"';
        style += ',"margin-left": "calc(' + dspCoeff + ' * '+ titleStartPosition + ')"';
        style += "}";
        return JSON.parse(style);
    }

    helpContentStyle() {
        const dspCoeff : string = this.diplayMode.value === "*DS4" ? "100%/131" : "1.25%";
        const marginRight: number = this.diplayMode.value === "*DS4" ? 53 : 2; // 132-79 = 53
        let style = "{";
        style += '"color":"green"';
        style += ',"margin-left": "calc(' + dspCoeff + ' * 2)"';
        style += ',"margin-right": "calc(' + dspCoeff + ' * ' + marginRight + ')"';
        style += "}";
        return JSON.parse(style);
    }

}