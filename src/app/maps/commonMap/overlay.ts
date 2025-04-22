
export class Overlay {

    public overlay?: boolean = false;
    public startLineNumber? = 0;
    public transparent?: boolean = false;

    mapDivStyle() {

        // lrg height css
        let height = 1.4;
        let style = "{";

        if(this.overlay !== undefined) {
            if (this.overlay) {
                style += '"position":"absolute"';
                if (this.startLineNumber == 0) {
                    style += ',"top": "0em"';
                } else {
                    style += ',"top": "' + ((this.startLineNumber-1) * height) + 'em"';
                }
            } else {
                style += '"position":"static"';
            }
        }

        if(this.transparent !== undefined) {
            if (this.transparent) {
                style += ',"opacity":0';
            } else {
                style += ',"opacity":1';
            }
        }
        
        style += "}";

        return JSON.parse(style);
    }
}


