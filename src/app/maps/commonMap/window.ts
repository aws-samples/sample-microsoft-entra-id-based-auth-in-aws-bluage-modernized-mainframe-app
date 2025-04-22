import { Overlay } from "./overlay";


export class Window extends Overlay {

    // Pattern of border
    public motif: string ;
    // Top left corner position
    public position: {line: number, column: number};
    // Flag to position window close to the cursor
    public cursor: boolean;
    // Height (nb of line into the window)
    public height: number;
    // Width (nb of column into the window)
    public width: number;
    // Titles
	public titleTop: string;	
	public titleBottom: string;
	// color
}


