
// When modifying those classes, regenerate the associated JSON schema!

// To do so: 
// $ cd webapp
// $ npm install typescript-json-schema -g
// $ typescript-json-schema --required app/term/message.ts BackendMessage > app/term/message.schema.json
//
// See also: https://github.com/YousefED/typescript-json-schema#command-line
//
// Java classes in Gapwalk-Terminal ("tofrontend" sub-package) must be updated in case of modification
//
// The generated schema must be manually edited or some LogicalMessage combinations will not validate:
// replace all "oneOf" by "anyOf"
//
// Also note that a minimum version of 0.33.0 is required for typescript-json-schema
// To upgrade, reinstall after "npm uninstall -g typescript-json-schema"

export class BackendMessage {
    messages: LogicalMessage[];
    nextTransID?: string;
    error?: string;
    serverDescription?: string;
}

/** The parent class of all elementary operations, expressed as messages (V7-1103) */
export abstract class LogicalMessage {
    command: string;
}

/** This message adds new components to the display and fills their fields */
export class AddComponents extends LogicalMessage {
    maps: Map[];
}

/** This message adds new components to the display into modal window */
export class WindowComponents extends LogicalMessage {
    maps: WindowMap[];
}

/** This message update fields of some already displayed components */
export class RebindComponents extends LogicalMessage {
    maps: Map[];
}

/** This message removes all displayed components */
export class RemoveAllComponents extends LogicalMessage {}

/** This message set cursor position */
export class SetCursorPosition extends LogicalMessage {
    cursor: number;
}

export class Map {
    component: string;
    mapWidth: number;
    fields: Field[];
    overlay?: boolean;
    startLineNumber?: number = 0;
    dspMode?: string;
    cursorLine?: number;
    cursorColumn?: number;
    actionKeys?: string[];
}

export class WindowMap extends Map {
    positionLeft?: number;
    positionTop?: number;
    cursorPosition?: boolean;
    height?: number;
    width?: number;
    border?: boolean;
    borderColor?: string;
    borderIntensity?: string;
    borderHilight?: string;
    borderDashed?: boolean;
	titleTop?: string;	
	titleBottom?: string;
	titleColorTop?: string;	
	titleColorBottom?: string;	
	titleAlignTop?: string;
	titleAlignBottom?: string;
	borderTop?: string;
    borderBottom?: string;
    messageLine?: boolean;
    windowRef?: String;
    remove?: boolean;
}

export abstract class Field {
    id: string;
    data?: string;
    attributes?: Attributes;
    initialCursor?: boolean;
    fields?: Map[];
}

export class SimpleField extends Field {
}

export class ArrayField extends Field {
}

export class Attributes {
    intensity?: string;
    protection?: string;
    num?: string;
    numerical?: boolean;
    forceModified?: boolean;
    color?: string;
    highlight?: string;
    charsetMode?: string;
    mask?: string;
    underline?: boolean;
    columnSeparator?: boolean;
    line: number;
    column: number;
    isPassword?: boolean;
    allowLC?: boolean;
    chkMsg?: SimpleField[];

    // For array component
    size?:0;
    numberOfRecordsPerPage?:0;
    pageDown?: string;
    end?: boolean;
    cursor?: boolean;
    top?: boolean;
    display?: boolean;
    foldCommand?: string;
    dropCommand?: string;
    dspMode?: string;
    displayControl?: boolean;
    subfileClear?: boolean;
    subfileDelete?: boolean;
}