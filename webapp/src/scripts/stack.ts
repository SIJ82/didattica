import { parse, type AssignmentExpression, type BlockStatement, type CallExpression, type ExpressionStatement, type FunctionDeclaration, type Identifier, type Literal, type Program, type Statement, type VariableDeclaration } from "acorn";
import { recursive, simple } from "acorn-walk";
import type { Extended_BlockStatement, Extended_FunctionDeclaration, Extended_Identifier, Extended_VariableDeclarator } from "./extended_nodes";
import { deepCopy, optionParse } from "./utils";
import { Create_Stack_Card } from "./visualizer";
import type { Expression, ReturnStatement, VariableDeclarator } from "acorn";

export class Var{
    public label:string;
    public value : any;
    public isConst : boolean;
    constructor(label, value, isConst=false){
        this.label = label;
        this.value = value;
        this.isConst = isConst;
    }
}
export const stack_options = {dynamic:false};
//le funzioni di libreria come console.log non vanno gestite
export class FunctionFrame{
    public label : string;
    public childs : FunctionFrame[] = [];
    public parent : FunctionFrame = undefined;
    public caller : FunctionFrame = undefined;
    public nesting : number =0;
    public stack : FunctionFrame[] =[];
    public scope : Var[][] = [[]];
    constructor(label: string, pars:string[], nesting: number){
        this.label = label;
        this.nesting = nesting;
        this.stack.push(this);
    }

    public enter_scope(){
        this.scope.push([]);
    }

    public exit_scope(){
        this.scope.pop();
    }

    public top_lookup(id, context=undefined) : Var{
        if(!context)
            context = this.scope.at(-1);
        for(const v of context){
            if(v.label == id)
                return v;
        }
        return undefined;
    }

    public lookup(id){
        for(let i= this.scope.length-1 ; i>=0; i-=1){
            const v = this.top_lookup(id, this.scope[i]);
            if(v)
                return v;
        }



        if(this.parent)
            return this.parent.lookup(id);
        else
            return undefined;
    }

    public addVar(id, value = undefined){
        if(this.top_lookup(id))
            throw new Error(`Variable ${id} alredy declared`);

        this.scope.at(-1).push(new Var(id, value));
    }

    public addConst(id, value){
        if(this.top_lookup(id))
            throw new Error(`Variable ${id} alredy declared`);
        this.scope.at(-1).push(new Var(id, value, true));
    }

    public getVar(id) : Var{
        const v = this.lookup(id);

        if(v)
            return v;

        throw new Error(`Variable ${id} not declared`);
    }

    public getVal(id){
        return this.getVar(id).value;
    }

    public assign(id, value){
        const v = this.lookup(id);
        if(v.isConst)
            throw Error(`${id} is a const`);
        if(v){
            v.value = value;
            return;
        }
        throw new Error(`Variable ${id} not declared`);
    }

    public addChild(f : FunctionFrame){
        const dynamic_scope = stack_options.dynamic;
        //console.log("Adding ", f.label, f.nesting, "to", f.label, f.nesting);

        if(dynamic_scope || !this.parent){
            f.parent = this;
            this.childs.push(f);
        }else{
            const current_nesting = this.nesting;
            const nesting = f.nesting;
            let parent :FunctionFrame= this;
            for(let i=-1; i<current_nesting-nesting; i+=1){
                parent = parent.parent;
            }
            f.parent = parent;

            parent.childs.push(f);
        }
    }

    public removeChild(label){
        for(let i= this.childs.length-1; i>=0 ; i-=1){
            if(this.childs[i].label == label){
                this.childs = this.childs.toSpliced(i, 1);
                return;
            }
        }

        if(this.parent)
            return this.parent.removeChild(label);

        alert("Problema durante la rimozione del frame "+label);
    }

    public remove(){
        const idx = this.parent.childs.indexOf(this);
        this.parent.childs = this.parent.childs.toSpliced(idx,1);
    }

    public toCard() : HTMLDivElement{
        const card : HTMLDivElement = Create_Stack_Card(this);
        const childs_div = card.getElementsByClassName("card_childs")[0] as HTMLDivElement;
        for(const c of this.childs){
            const subCard = c.toCard();
            childs_div.appendChild(subCard);
        }

        return card;
    }
}





export function InjectStack(ast : Program){
    const symbols : string[] = [];

    recursive(ast, {c : false}, {
        BlockStatement(node : Extended_BlockStatement, state, c){
            for(const s of node.body){
                if(s.type == "VariableDeclaration"){
                    c(s, state);

                }else{
                    c(s, state);
                }
            }
            //@ts-ignore
            const enter_scope : ExpressionStatement = parse(`__frame.enter_scope()`, optionParse).body[0]; //@ts-ignore
            const exit_scope : ExpressionStatement = parse(`__frame.exit_scope()`, optionParse).body[0];
            node.body = node.body.toSpliced(0,0, enter_scope);
            node.body.push(exit_scope);

        },VariableDeclaration(node: VariableDeclaration, state, c){
            const kind = node.kind; //const, let
            for(const d of node.declarations){
                if(kind == "const")
                    c(d, {c:true});
                else
                    c(d, state);
            }

            const block :Extended_BlockStatement = {
                //@ts-ignore
                body : node.declarations,
                type:"BlockStatement",
                start : node.start,
                end:node.end                
            }
            deepCopy(node, block);
        }, VariableDeclarator(node : Extended_VariableDeclarator, state, c){
            let exp : ExpressionStatement;
            if(state.c) //@ts-ignore
                exp = parse(`__frame.addConst()`, optionParse).body[0];
            else //@ts-ignore
                exp = parse(`__frame.addVar()`, optionParse).body[0];
            const call_exp = exp.expression as CallExpression;
            const name : Literal ={
                type : "Literal",
                start : node.id.start,
                end : node.id.end,
                //@ts-ignore
                value : node.id.name
            }
            call_exp.arguments.push(name);
            if(node.init)
                call_exp.arguments.push(node.init);
            exp.expression = call_exp;
            symbols.push(name.value as string);
            //console.log(exp.type, exp, call_exp.type, call_exp);
            deepCopy(node, exp);
        },FunctionDeclaration(node: Extended_FunctionDeclaration, state, c){
            //@ts-ignore
            const pars: Extended_Identifier[]= node.params;
            for(const p of pars){
                symbols.push(p.name);
            }
            c(node.body, state);
        }
    });

    console.log("Symbols ", symbols.join(", "));

    simple(ast, {
        AssignmentExpression(node : AssignmentExpression){
            //left può anche essere più complessa, es. x["a"] =1
            const left = node.left as Identifier;
            if(!symbols.includes(left.name))
                return;
            //@ts-ignore
            const exp : ExpressionStatement = parse(`__frame.assign()`, optionParse).body[0];
            const call_exp = exp.expression as CallExpression;
            const name : Literal ={
                type : "Literal",
                start : left.start,
                end : left.end,
                //@ts-ignore
                value : left.name
            }
            call_exp.arguments.push(name);
            call_exp.arguments.push(node.right);
            deepCopy(node, exp);
        },Identifier(node : Identifier){
            if(!symbols.includes(node.name))
                return;
            //console.log("Identifier", node.name);
            //@ts-ignore
            const exp : ExpressionStatement = parse(`__frame.getVal("${node.name}")`, optionParse).body[0];
            deepCopy(node, exp.expression);
        }
    })


    recursive(ast, {p : undefined as Extended_BlockStatement},{
        FunctionDeclaration(node: Extended_FunctionDeclaration, state, c){
            //@ts-ignore
            const pars: Extended_Identifier[]= node.params;
            const vars : string[] = []
            for(const p of pars){
                vars.push(p.name);
                symbols.push(p.name);
            }
            c(node.body, state);

            const stms = Genc_Call_FrameCreation(node, vars);
            for(const s of stms)
                node.body.body = node.body.body.toSpliced(0,0, s); 
        },
        BlockStatement(node : Extended_BlockStatement, state, c){
            for(const child of node.body){
                c(child, {p: node})
            }
        },
        ExpressionStatement(node: ExpressionStatement, state, c){
            /*if(node.expression.type=="CallExpression"){
                if(state.p)
                    Push_Call_FrameDeletion(state.p, node);
                else
                    Push_Call_FrameDeletion(ast, node);
            }*/
        },        
    });

    recursive(ast, {p:undefined as BlockStatement},{
        BlockStatement(node : BlockStatement, state , c){
            for(const n of node.body)
                c(n, {p:node});
        },ReturnStatement(node :ReturnStatement, state, c){

            const ast = parse(`let _ret_val = 1;`, optionParse).body[0] as VariableDeclaration;
            ast.declarations[0].init = node.argument;
            
            const idx = state.p.body.indexOf(node);
            state.p.body = state.p.body.toSpliced(idx, 0, ast);

            Push_Call_FrameDeletion(state.p, node);

            //@ts-ignore
            const _ret_val = parse(`_ret_val`, optionParse).body[0].expression as Expression;
            node.argument = _ret_val;
            //console.log(_ret_val);
            
        }
    });




    ast.body = ast.body.toSpliced(0,0, parse(`const __frame = _Frame_Creation(0, "Global_frame", [], [], true);`, optionParse).body[0]);
    ast.body = ast.body.toSpliced(1,0, parse(`window._Global_frame=__frame`, optionParse).body[0]);

}

function Genc_Call_FrameCreation(node: Extended_FunctionDeclaration, pars:string[]) : Statement[]{
    const label = node.id.name;
    const par_names : string[]= []
    for(const p of pars){
        par_names.push(`"${p}"`);
    }
    //in reverse perchè vengono aggiunti al contrario
    const ast = parse(`
const __frame = _Frame_Creation(${node.nesting}, "${label}", _pars_names, _pars_values);
const _pars_names = [${par_names.join(", ")}];
const _pars_values = [${pars.join(", ")}];
`, optionParse);

    //@ts-ignore
    return ast.body;
}

export function Gen_Dec_FramCreation(): FunctionDeclaration{
    const ast = parse(`
async function _Frame_Creation(nesting, label, par_names, par_values, global=false){
    return window._Frame_Creation(nesting, label, par_names, par_values, global);
}        
`, optionParse);

    return ast.body[0] as FunctionDeclaration;
}

export function Gen_Dec_FrameDeletion(): FunctionDeclaration{
    const ast = parse(`
async function _Frame_Deletion(current_frame){
    window._Frame_Deletion(current_frame);
}        
`, optionParse);

    return ast.body[0] as FunctionDeclaration;
}

function Push_Call_FrameDeletion(parent : Extended_BlockStatement, node:ReturnStatement){
    //@ts-ignore
    const ast = parse(`_Frame_Deletion(__frame)`, optionParse);
    const idx = parent.body.indexOf(node); //@ts-ignore
    parent.body = parent.body.toSpliced(idx, 0, ast.body[0]);
}

export function Frame_Creation(nesting, label, par_names : string[], par_values: any[], global=false) : FunctionFrame{
    //@ts-ignore
    const _Global_frame : FunctionFrame = window._Global_frame;
    if(!_Global_frame || global)
        return new FunctionFrame(label, [], nesting);

    const active_frame : FunctionFrame = _Global_frame.stack.at(-1);
    //console.log("New frame",nesting, label, par_names, par_values);
    const frame = new FunctionFrame(label, [], nesting);
    for(let i=0; i<par_names.length; i+=1){
        frame.addVar(par_names[i], par_values[i]);
    }
    active_frame.addChild(frame);
    _Global_frame.stack.push(frame);
    return frame;
}

export function Frame_Deletion(current_frame : FunctionFrame){
    //@ts-ignore
    const _Global_frame : FunctionFrame = window._Global_frame;
    _Global_frame.stack.pop();

    current_frame.remove();
    
}