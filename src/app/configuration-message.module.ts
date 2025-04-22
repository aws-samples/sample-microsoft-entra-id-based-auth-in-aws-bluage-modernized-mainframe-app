/** The configuration informations returned by our server (V7-179) */
export class AppConfigurationMessage {
    backendURL?: string;
    useModernLegacyStyle?: boolean; // Temporary (V7-316)
    // Flag to display or to log more informations
    verbose?: boolean;
    webApp?:WebAppDetail;
    useCombinationsAttributes?: boolean; // Deprecated (V7-3020)
    emulatedTerminal?: TerminalKind;
    forceModifiedCanResetMDT?: boolean;
    uppercaseInput?: boolean;
}

export class WebAppDetail {
    name: string;
    version?: string;
}

export enum TerminalKind {
    Term3270 = '3270', Term5250 = '5250'
}
