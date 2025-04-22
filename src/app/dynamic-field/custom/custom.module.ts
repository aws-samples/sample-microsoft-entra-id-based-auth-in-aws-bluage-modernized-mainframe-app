import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Additional
import { CalendarModule, } from 'primeng/calendar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SharedModule } from 'primeng/api';

// Components
import { BooleanCheckboxComponent } from './boolean-checkbox.component';
import { DynamicDatepickerComponent } from './dynamic-datepicker.component';
import { DynamicAutoCompleteComponent } from './dynamic-autocomplete.component';
import { DynamicRadioComponent } from './dynamic-radio.component';
import { DynamicSelectComponent } from './dynamic-select.component';
import { DynamicSwitchComponent } from './dynamic-switch.component';
import { SplitDynamicFieldComponent } from './split-dynamic-field.component';


import {
    MatInputModule
  } from '@angular/material/input';
import {
    MatAutocompleteModule
  } from '@angular/material/autocomplete';
import {
    MatToolbarModule
  } from '@angular/material/toolbar';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatAutocompleteModule,
        MatToolbarModule,
        // Additional
        CalendarModule,
        InputSwitchModule,
        SharedModule
    ],
    declarations: [
        // Components
        BooleanCheckboxComponent,
        DynamicDatepickerComponent,
        DynamicAutoCompleteComponent, 
        DynamicRadioComponent,
        DynamicSelectComponent,
        DynamicSwitchComponent,
        SplitDynamicFieldComponent
    ],
    exports: [
        CommonModule,
        FormsModule,
        // Additional
        CalendarModule,
        InputSwitchModule,
        // Components
        BooleanCheckboxComponent,
        DynamicDatepickerComponent,
        DynamicAutoCompleteComponent,
        DynamicRadioComponent,
        DynamicSelectComponent,
        DynamicSwitchComponent,
        SplitDynamicFieldComponent
    ]
})
export class DynamicFieldCustomModule {}
