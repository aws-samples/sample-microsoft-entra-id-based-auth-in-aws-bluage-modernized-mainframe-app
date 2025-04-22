import { Injectable } from '@angular/core';
import { ConfigService } from 'app/config-service';

/**
 * When creating new messages please keep in mind that format control characters can
 * be used to properly format the displayed first and second level messages.
 * 
 * The format control character must be followed by a blank space.
 * 
 * Format control characters:
 * &N - Forces the message help to a new line (column 2). If the help is longer than one line, the next lines are indented to column 4 until the end of the help or until another format control character is found.
 * &P - Forces the message help to a new line, indented to column 6. If the help is longer than one line, the next lines start in column 4 until the end of the help or until another format control character is found.
 * &B - Forces the message help to a new line, starting in column 4. If the help is longer than one line, the next lines are indented to column 6 until the end of the help or until another format control character is found.
 * 
 * If the message you are adding contains a second-level message, you must add it to the DictionaryHelp type
 * and use the same the ID as the first-level message append "_2" to the end.
 * 
 * Example:
 * 
 * In Dictionary
 * CPF1111: "This is the first level message;,CPF1111_2" 
 * 
 * In Disctionary Help
 * CPF1111_2: "This is the second level message"
*/

//Labels declared in alphabetic order to avoid duplication
export type Dictionary = {
    Additional_Message_Information: string;
    Bottom: string;
    Cancel : string;
    CPF5208: string; // Invalid decimal format for numeric fields
    CPF5223: string; // Invalid value was entered for a field that has VALUES keyword
    // CPF522[A-F] is for invalid value entered for a field that has COMP keyword
    CPF522A: string;
    CPF522B: string;
    CPF522C: string;
    CPF522D: string;
    CPF522E: string;
    CPF522F: string;
    CPF523A: string; // Invalid value was entered for a field that allows for a range of values
    Display_program_messages: string;
    Empty: string;
    ExtendedHelp : string;
    Field_requires_numeric_characters: string;
    InfoAssistant : string;
    Key_not_valid: string;
    Message: string;
    Message_ID: string;
    More: string;
    MoreKeys : string;
    MoveToTop : string;
    Numeric_value: string;
    Only_Chars_0_to_9: string;
    Plus: string;
    Press_Enter: string;
    Press_Enter_to_continue: string;
    Reply: string;
    Roll_up_down_past_first_last_record: string;
    SearchIndex : string;
    Type_reply_Enter: string;

}

//Labels declared in alphabetic order to avoid duplication
//Second level error messages. Refer to Dictionary for explanation of message id's
export type DictionaryHelp = {
    CPF5208_2: string;
    CPF5223_2: string;
    CPF522A_2: string;
    CPF522B_2: string;
    CPF522C_2: string;
    CPF522D_2: string;
    CPF522E_2: string;
    CPF522F_2: string;
    CPF523A_2: string;
    CPF9897_2: string;


}

@Injectable()
export class LanguageService {

    constructor(private configService: ConfigService) {
    }

    translate(rawMsg : string) : string {
        let language = this.configService.getLanguage();

        let dictionary : { [eng: string]: string};
		switch (language) {
            case "French":
                return frenchDictionary[rawMsg];
            case "Spanish":
                return spanishDictionary[rawMsg];
            case "Japanese":
                return japaneseDictionary[rawMsg];
            default:
                return englishDictionary[rawMsg];
        }
    }
    
    translateHelp(msgId : string) : string {
        let language = this.configService.getLanguage();
        if(!msgId.endsWith("_2")){
            msgId += "_2";
        }
        let dictionary : { [eng: string]: string};
		switch (language) {
            case "French":
                return frenchDictionaryHelp[msgId];
            case "Spanish":
                return spanishDictionaryHelp[msgId];
            case "Japanese":
                return japaneseDictionaryHelp[msgId];
            default:
                return englishDictionaryHelp[msgId];
        }
    }
}

const englishDictionary:  Dictionary = {
    Key_not_valid: "This key is not valid.",
    Roll_up_down_past_first_last_record: "Roll up or down past the first or last record in file.",
    Field_requires_numeric_characters: "Field requires numeric characters ",
    Numeric_value: "The value must be numeric.",
    CPF5208: "Use of decimals not correct or too many number entered.;,CPF5208_2",
    Display_program_messages: "Display Program Messages",
    Type_reply_Enter: "Type reply, press Enter.",
    Reply: "Reply . . .",
    Press_Enter: "press Enter.",
    More: "More",
    Plus: "\xa0" + "+" +"\xa0",
    Bottom: "Bottom",
    CPF5223: "Value entered for field is not valid. Valid values listed in message help.;,CPF5223_2",
    CPF523A: "Valid range for the field is &1 to &2;,CPF523A_2",
    Empty: "",
    Additional_Message_Information: "Additional Message Information",
    Message_ID: "Message ID . . . . . . :   ",
    Message: "&N Message . . . . :   ",
    Press_Enter_to_continue: "Press Enter to continue.",
    ExtendedHelp : "Extended help",
    MoveToTop : "Move to top",
    SearchIndex : "Search Index",
    Cancel : "Cancel",
    InfoAssistant : "Information Assistant",
    MoreKeys : "More keys",
    Only_Chars_0_to_9: "Only characters 0 through 9 allowed.",
    CPF522B: "Value must equal &1.;,CPF522B_2",
    CPF522E: "Value must be greater than &1.;,CPF522E_2",
    CPF522C: "Value must be less than &1.;,CPF522C_2",
    CPF522A: "Value must not equal &1.;,CPF522A_2",
    CPF522F: "Value must not be greater than &1.;,CPF522F_2",
    CPF522D: "Value must not be less than &1.;,CPF522D_2"
};

const englishDictionaryHelp:  DictionaryHelp = {
    CPF9897_2: "&N Cause . . . . . :   No additional online help information is available.",
    CPF5223_2: "&N Cause . . . . . :   A field validation error occurred because the value entered does not match one of the following list entries: &B &1 &N Recovery  . . . :   Change the value and then try the request again.",
    CPF522A_2: "&N Cause . . . . . :   A field validation error occurred because the value entered is equal to &1 &N Recovery  . . . :   Change the value and then try the request again.",
    CPF522B_2: "&N Cause . . . . . :   A field validation error occurred because the value entered is not equal to &1 &N Recovery  . . . :   Change the value and then try the request again.",
    CPF522C_2: "&N Cause . . . . . :   A field validation error occurred because the value entered is not less than &1 &N Recovery  . . . :   Change the value and then try the request again.",
    CPF522D_2: "&N Cause . . . . . :   A field validation error occurred because the value entered is less than &1 &N Recovery  . . . :   Change the value and then try the request again.",
    CPF522E_2: "&N Cause . . . . . :   A field validation error occurred because the value entered is not greater than &1 &N Recovery  . . . :   Change the value and then try the request again.",
    CPF522F_2: "&N Cause . . . . . :   A field validation error occurred because the value entered is greater than &1 &N Recovery  . . . :   Change the value and then try the request again.",
    CPF5208_2: "&N Cause . . . . . :   Either there are too many decimal positions in numeric only field, or too many numbers were entered or too many decimal positions were entered. &N Recovery  . . . :   Change the value and then try the request again.",
    CPF523A_2: "&N Cause . . . . . :   A field validation error occurred because the value entered is not in the valid range from &1 to &2 &N Recovery  . . . :   Change the value and then try the request again.",
};

const frenchDictionary:  Dictionary = {
    Key_not_valid: "Cette touche n'est pas valide.",
    Roll_up_down_past_first_last_record: "La roulette haute ou basse a dépassé le premier ou le dernier record.",
    Field_requires_numeric_characters: "Ce champ doit contenir des charactère numérique",
    Numeric_value: "Cette valeur doit être numérique",
    CPF5208: "Trop de décimaux ou trop de chiffres inscrits.;,CPF5208_2",
    Display_program_messages: "Ecran de message programme",
    Type_reply_Enter: "Tapez une réponse et pressez Entrée",
    Reply: "Réponse . . .",
    Press_Enter: "Pressez Entrée",
    More: "Plus",
    Plus: '\xa0' + "+" +'\xa0',
    Bottom: "Fin",
    CPF5223: "La valeur entrée pour ce champ n'est pas valide. Les valeurs valides sont listées dans l'écran d'aide.;,CPF5223_2",
    CPF523A: "La plage valide pour le champ est comprise entre &1 et &2;,CPF523A_2",
    Empty: "",
    Additional_Message_Information: "Message d'information additionnel",
    Message_ID: "Message ID . . . . . . :   ",
    Message: "&N Message . . . . :   ",
    Press_Enter_to_continue: "Appuyez sur Entrée pour continuer.",
    ExtendedHelp : "Aide étendue",
    MoveToTop : "Déplacer vers le haut",
    SearchIndex : "Index de recherche",
    Cancel : "Annuler",
    InfoAssistant : "Assistant d'information",
    MoreKeys : "Plus de clés",
    Only_Chars_0_to_9: "Seuls les characters 0 à 9 sont valides.",
    CPF522B: "La valeur doit être égale à &1.;,CPF522B_2",
    CPF522E: "La valeur doit être supérieure à &1.;,CPF522E_2",
    CPF522C: "La valeur doit être inférieure à &1.;,CPF522C_2",
    CPF522A: "La valeur ne doit pas être égale à &1.;,CPF522A_2",
    CPF522F: "La valeur ne doit pas être supérieure à &1.;,CPF522F_2",
    CPF522D: "La valeur ne doit pas être inférieure à &1.;,CPF522D_2"
};

const frenchDictionaryHelp:  DictionaryHelp = {
    CPF9897_2: "&N Cause . . . . . :   Aucune information d'aide en ligne supplémentaire n'est disponible.",
    CPF5223_2: "&N Cause . . . . . :   La validation du champ a échoué car la valeur saisie ne correspond pas à l'une des entrées suivantes: &B &1 &N Solution  . . . :   Modifiez la valeur et relancez la requête.",
    CPF522A_2: "&N Cause . . . . . :   La validation du champ a échoué car la valeur saisie est égale à &1 &N Solution  . . . :   Modifiez la valeur et relancez la requête.",
    CPF522B_2: "&N Cause . . . . . :   La validation du champ a échoué car la valeur saisie n'est pas égale à &1 &N Solution  . . . :   Modifiez la valeur et relancez la requête.",
    CPF522C_2: "&N Cause . . . . . :   La validation du champ a échoué car la valeur saisie n'est pas inférieure à &1 &N Solution  . . . :   Modifiez la valeur et relancez la requête.",
    CPF522D_2: "&N Cause . . . . . :   La validation du champ a échoué car la valeur saisie est inférieure à &1 &N Solution  . . . :   Modifiez la valeur et relancez la requête.",
    CPF522E_2: "&N Cause . . . . . :   La validation du champ a échoué car la valeur saisie n'est pas supérieure à &1 &N Solution  . . . :   Modifiez la valeur et relancez la requête.",
    CPF522F_2: "&N Cause . . . . . :   La validation du champ a échoué car la valeur saisie est supérieure à &1 &N Solution  . . . :   Modifiez la valeur et relancez la requête.",
    CPF5208_2: "&N Cause . . . . . :   Soit il y a trop de décimales dans le champ numérique, soit trop de chiffres ont été saisis. &N Solution  . . . :   Modifiez la valeur et relancez la requête.",
    CPF523A_2: "&N Cause . . . . . :   La validation du champ a échoué car la valeur saisie ne se situe pas dans la plage valide comprise entre &1 et &2 &N Solution  . . . :   Modifiez la valeur et relancez la requête.",
};

const spanishDictionary:  Dictionary = {
     Key_not_valid: "Esta clave no es válida.",
     Roll_up_down_past_first_last_record: "Suba o baje más allá del primer o último registro del archivo.",
     Field_requires_numeric_characters: "El campo requiere caracteres numéricos",
     Numeric_value: "Este valor debe ser numérico",
     CPF5208: "El uso de decimales no es correcto o se han introducido demasiados números.;,CPF5208_2",
     Display_program_messages: "Pantalla de mensajes del programa",
     Type_reply_Enter: "Escriba la respuesta y pulse Entrar.",
     Reply: "Respuesta . . .",
     Press_Enter: "Pulse Entrar",
     More: "Màs",
     Plus: '\xa0' + "+" +'\xa0',
     Bottom: "Fin",
     CPF5223: "El valor introducido para este campo no es válido. Los valores válidos aparecen en la ayuda del mensaje.;,CPF5223_2",
     CPF523A: "El rango válido para el campo es de &1 a &2;,CPF523A_2",
     Empty: "",
     Additional_Message_Information: "Información adicional del mensaje",
     Message_ID: "Mensajes ID . . . . . . :   ",
     Message: "&N Mensajes . . . . :   ",
     Press_Enter_to_continue: "Pulse Entrar para continuar.",
     ExtendedHelp : "Ayuda extendida",
     MoveToTop : "Mover arriba",
     SearchIndex : "Buscar índice",
     Cancel : "Cancelar",
     InfoAssistant : "Asistente de información",
     MoreKeys : "Más teclas",
     Only_Chars_0_to_9: "Solo se permiten los caracteres del 0 al 9.",
     CPF522B: "El valor debe ser igual a &1.;,CPF522B_2",
     CPF522E: "El valor debe ser mayor que &1.;,CPF522E_2",
     CPF522C: "El valor debe ser inferior a &1.;,CPF522C_2",
     CPF522A: "El valor no debe ser igual a &1.;,CPF522A_2",
     CPF522F: "El valor no debe ser superior a &1.;,CPF522F_2",
     CPF522D: "El valor no debe ser inferior a &1.;,CPF522D_2"
}

const spanishDictionaryHelp:  DictionaryHelp = {
    CPF9897_2: "&N Causa . . . . . :   No hay información adicional de ayuda disponible en línea.",
    CPF5223_2: "&N Causa . . . . . :   Se ha producido un error de validación del campo porque el valor introducido no coincide con una de las siguientes entradas de la lista: &B &1 &N Recuperación . .: Cambie el valor y vuelva a intentar la solicitud.",
    CPF522A_2: "&N Causa . . . . . :   Se ha producido un error de validación de campo porque el valor introducido es igual a &1 &N Recuperación . .: Cambie el valor y vuelva a intentar la solicitud.",
    CPF522B_2: "&N Causa . . . . . :   Se ha producido un error de validación de campo porque el valor introducido no es igual a &1 &N Recuperación . .: Cambie el valor y vuelva a intentar la solicitud.",
    CPF522C_2: "&N Causa . . . . . :   Se ha producido un error de validación de campo porque el valor introducido no es inferior a &1 &N Recuperación . .: Cambie el valor y vuelva a intentar la solicitud.",
    CPF522D_2: "&N Causa . . . . . :   Se ha producido un error de validación de campo porque el valor introducido es inferior a &1 &N Recuperación . .: Cambie el valor y vuelva a intentar la solicitud.",
    CPF522E_2: "&N Causa . . . . . :   Une erreur de validation de champ s'est produite car la valeur saisie n'est pas supérieure à &1 &N Recuperación . .: Cambie el valor y vuelva a intentar la solicitud.",
    CPF522F_2: "&N Causa . . . . . :   Se ha producido un error de validación de campo porque el valor introducido es superior a &1 &N Recuperación . .: Cambie el valor y vuelva a intentar la solicitud.",
    CPF5208_2: "&N Causa . . . . . :   Hay demasiadas posiciones decimales en el campo solo numérico, o se han introducido demasiados números o se han introducido demasiadas posiciones decimales. &N Recuperación . .: Cambie el valor y vuelva a intentar la solicitud.",
    CPF523A_2: "&N Causa . . . . . :   Se ha producido un error de validación del campo porque el valor introducido no está en el intervalo válido de &1 a &2 &N Recuperación . .: Cambie el valor y vuelva a intentar la solicitud.",
};

const japaneseDictionary:  Dictionary = {
     Key_not_valid: "このキーは無効です",
     Roll_up_down_past_first_last_record: "ロールアップまたはロールダウンは最初か最後のレコードを超えました",
     Field_requires_numeric_characters: "フィールドには数字が必要です",
     Numeric_value: "値は数値である必要があります",
     CPF5208: "小数の使用が正しくないか、入力された数値が多すぎます。;,CPF5208_2",
     Display_program_messages: "プログラムメッセージを表示する",
     Type_reply_Enter: "「返信」と入力し、Enter キーを押します。",
     Reply: "返事 。 。 。",
     Press_Enter: "Enterを押します。",
     More: "もっと",
     Plus: '\xa0' + "+" +'\xa0',
     Bottom: "終わり",
     CPF5223: "値はアカンで！;,CPF5223_2",
     CPF523A: "フィールドの有効範囲は &1 ~ &2;,CPF523A_2",
     Empty: "",
     Message_ID: "メッセージ ID 。 。 。 。 。 。 。 。:   ",
     Message: "&N メッセージ 。 。 。 。 。 。:   ",
     Press_Enter_to_continue: "Enter キーを押してください。",
     Additional_Message_Information: "追加情報メッセージ",
     ExtendedHelp : "拡張ヘルプ",
     MoveToTop : "トップに移動",
     SearchIndex : "検索インデックス",
     Cancel : "キャンセル",
     InfoAssistant : "情報アシスタント",
     MoreKeys : "追加のキー",
     Only_Chars_0_to_9: "数字0から9までのみが有効です",
     CPF522B: "値は &1 でなければなりません。;,CPF522B_2",
     CPF522E: "値は &1 より大きくなければなりません。;,CPF522E_2",
     CPF522C: "値は &1 未満でなければなりません。;,CPF522C_2",
     CPF522A: "値は &1 と同じであってはなりません。;,CPF522A_2",
     CPF522F: "値は &1 より大きくてはいけません。;,CPF522F_2",
     CPF522D: "値は &1 以上でなければなりません。;,CPF522D_2"
}

const japaneseDictionaryHelp:  DictionaryHelp = {
    CPF9897_2: "&N 原因 。 。 。 。 。 。 。 。: その他のオンラインヘルプ情報はありません。",
    CPF5223_2: "&N 原因 。 。 。 。 。 。 。 。: フィールド検証エラーが発生しました。入力値は入力範囲内の値を選択してください: &B &1 &N リカバリー。 。 。 。 。 。 。: 値を変更してから、再試行してください。",
	CPF522A_2: "&N 原因 。 。 。 。 。 。 。 。: フィールド検証エラーが発生しました。値は &1 であってはなりません: &N リカバリー。 。 。 。 。 。 。: 値を変更してから、再試行してください。",
	CPF522B_2: "&N 原因 。 。 。 。 。 。 。 。: フィールド検証エラーが発生しました。値は &1 でなければなりません: &N リカバリー。 。 。 。 。 。 。: 値を変更してから、再試行してください。",
	CPF522C_2: "&N 原因 。 。 。 。 。 。 。 。: フィールド検証エラーが発生しました。値は &1 以上であってはなりません: &N リカバリー。 。 。 。 。 。 。: 値を変更してから、再試行してください。",
	CPF522D_2: "&N 原因 。 。 。 。 。 。 。 。: フィールド検証エラーが発生しました。値は &1 より小さくてはいけません: &N リカバリー。 。 。 。 。 。 。: 値を変更してから、再試行してください。",
	CPF522E_2: "&N 原因 。 。 。 。 。 。 。 。: フィールド検証エラーが発生しました。値は &1 より大きくなければなりません: &N リカバリー。 。 。 。 。 。 。: 値を変更してから、再試行してください。",
	CPF522F_2: "&N 原因 。 。 。 。 。 。 。 。: フィールド検証エラーが発生しました。値は &1 より大きくてはいけません: &N リカバリー。 。 。 。 。 。 。: 値を変更してから、再試行してください。",
	CPF5208_2: "&N 原因 。 。 。 。 。 。 。 。: 数値のみのフィールドに小数点以下の桁数が多すぎるか、入力された数字が多すぎるか、入力された小数点以下の桁数が多すぎます。 &N リカバリー。 。 。 。 。 。 。: 値を変更してから、再試行してください。",
	CPF523A_2: "&N 原因 。 。 。 。 。 。 。 。: 入力された値が &1 ~ &2 の有効な範囲にないため、フィールド検証エラーが発生しました &N リカバリー。 。 。 。 。 。 。: 値を変更してから、再試行してください。",
};

