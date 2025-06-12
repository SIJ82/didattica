export class AST{
    public childs:AST[] = [];
    public root=false;
    public nesting = undefined;

    constructor(nodes:AST[] =[]){
        this.childs=nodes;
    }

    public toString(tab="") : string{
        let childsString =""
        for(const c of this.childs){
            childsString += c.toString(tab+"  ");
        }

        return childsString;

    }

    public toTree(): HTMLDivElement{
        if(this.root){
            const div = document.createElement("div");
            div.className = "treeElement";
            const span=document.createElement("span");
            span.textContent = "GlobalScope";
            div.appendChild(span);
            for(const n of this.childs){
                const c = n.toTree();
                if(c)
                    div.appendChild(c);
            }
            return div;
        }
        return undefined;
    }

    public CodeGen() : string{
        

        if(this.root){
            let code = "";
            for(const c of this.childs){
                code += c.CodeGen();
            }

            return code;
        }else{
            let code = "";
            for(const c of this.childs){
                code += c.CodeGen();
            }

            return code;
        }
    }

    
}

export class MainScope extends AST{
    constructor(nodes){
        super();
        this.childs=nodes;
    }
}

export class CodeNode extends AST{
    public code:string;
    constructor(code:string){
        super();
        this.code = code;
    }

    public toString(tab: string=""): string {
        //@ts-ignore
        return "";
        const lines = this.code.split("\n");
        let pr = "";
        for(const l of lines){
            if(l.length<=0)
                continue;
            pr+= tab + l +"\n";
        }
        return pr;
    }

    public CodeGen(): string {
        return this.code;
    }


}

export class FunNode extends AST{
    public funLabel:string;
    public args: FunArg[];
    public body: AST;
    constructor(_label:string, _args:FunArg[], _body:AST){
        super();
        this.funLabel = _label;
        this.args = _args;
        this.body=_body;
    }

    public toString(tab: string): string {
        const params :string[]= [];
        for(const a of this.args){
            params.push(a.toString());
        }

        return tab+`function ${this.funLabel}(${params.join(", ")}) \n`+
                this.body.toString(tab+"  ")+"\n";
    }

    public toTree() : HTMLDivElement{
        const div = document.createElement("div");
        div.className = "treeElement";

        const span=document.createElement("span");
        span.textContent =this.funLabel;
        div.appendChild(span);

        const params :string[]= [];
        for(const a of this.args){
            params.push(a.toString());
        }
        span.textContent += `(${params.join(", ")})`

        //span.textContent += ` _n:${this.nesting}`;
        

        for(const n of this.body.childs){
            const c = n.toTree();
            if(c)
                div.appendChild(c);
        }
        return div;
    }

    public CodeGen(): string {
        let code = "";

        code += `async function ${this.funLabel}`;

        let argCodes = [];
        for(const a of this.args){
            argCodes.push(a.toString());
        }

        code += `(${argCodes.join(",")})`;

        const bodyCode = this.body.CodeGen();
        code += `{\n${bodyCode}}`;

        return code;
    }
}


export class FunArg extends AST{
    public argName:string;
    public defValue:string;
    constructor(_name:string, _defValue=undefined){
        super();
        this.argName =_name;
        this.defValue=_defValue;
    }

    public toString(tab: string=""): string {
        let dv ="";
        if(this.defValue)
            dv = "="+this.defValue;

        return this.argName+dv;
    }

}

export class VarDecNode extends AST{
    public label:string;
    public value:string;
    public isConst:boolean;
    constructor(_label, _const=false,_value=undefined){
        super();
        this.label=_label;
        this.value = _value;
        this.isConst = _const;
    }


    public toString(tab: string=""): string {
        let v = "";
        if(this.value)
            v = " = "+this.value;

        if(this.isConst)
            return tab+"const "+this.label+v+"\n";
        else
            return tab+"var "+this.label+v+"\n";
    }

    public toTree(): HTMLDivElement {
        const div = document.createElement("div");
        div.className = "treeElement varElement";
        if(this.isConst)
            div.classList.add("const");

        const span=document.createElement("span");
        span.textContent =this.label;
        div.appendChild(span);
        return div;
    }

    public CodeGen(): string {
        let code="";
        if(this.isConst)
            code += `const `;
        else
            code += `let `;

        code += this.label;

        if(this.value)
            code += ` = ${this.value}`;

        code += `;`;


        return code;
    }
}