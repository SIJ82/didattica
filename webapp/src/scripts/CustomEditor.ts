import type { Line } from "@codemirror/state";
import {EditorView, Decoration, type DecorationSet, keymap} from "@codemirror/view"



export class CustomEditorView extends EditorView{
    private lastHilightLineNo : number = undefined;

    public get code() : string{
        return this.getCode();
    }

    private getCode() : string{
        return this.state.doc.toString();
    }

    public setCode(code: string){
        this.dispatch({changes:{from : 0, to: this.state.doc.length, insert: code}}); 
    }

    public lineAt(pos: number) : Line{
        return this.state.doc.lineAt(pos);
    }

    public deHilightLastLine(){
        if(this.lastHilightLineNo){
            this.highlightLine(this.lastHilightLineNo, false);
        }
    }

    public highlightLine(lineno : number, status:boolean=true){
      this.lastHilightLineNo = lineno;
      const element = this.getLineElement(lineno)
      if(!element){
        console.error(`Line ${lineno} does not exist or not visible`);
        return;
      }
    
      if(status)
        element.id="highlight_line";
      else
        element.id = "";
    
    }
    public getLineElementAt(pos: number): HTMLElement | null{
        const lineno : number = this.lineAt(pos).number;
        return this.getLineElement(lineno);

    }

    public getLineElement(lineNumber: number): HTMLElement | null {
        // Ottieni l'oggetto Line (attenzione: lineNumber è 1-based in questo metodo)
        try {
                const line: Line = this.state.doc.line(lineNumber)
                // Ottieni il blocco DOM che contiene la linea
                const linePos = this.coordsAtPos(line.from)
                if (!linePos) return null
                // Trova l'elemento DOM alla posizione specifica
                const lineElement = this.domAtPos(line.from)?.node
                // Risali fino a trovare l'elemento linea completo
                if (lineElement) {
                let element: Node | null = lineElement
                while (element && !(element instanceof HTMLElement && element.classList.contains('cm-line'))) {
                    element = element.parentNode
                }
                return element as HTMLElement
                }
                return null
            } catch (e) {
                console.error("Linea non trovata:", e)
                return null
            }
    }

}