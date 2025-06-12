import type { FunctionDeclaration, Identifier, Program } from "acorn";
import { recursive, simple } from "acorn-walk";
import type { Extended_FunctionDeclaration, Extended_Identifier, Extended_VariableDeclarator } from "./extended_nodes";
import type { FunctionFrame, Var } from "./stack";

function CreateFunctionNode(parent : HTMLDivElement, node : Extended_FunctionDeclaration) {
    const div = document.createElement("div");
    div.className = "treeElement";
    const span=document.createElement("span");
    span.textContent = node.id.name;
    div.appendChild(span);
    const paramsDiv = document.createElement("div");
    paramsDiv.className = "treeParams";
    div.appendChild(paramsDiv);
    node.parentDiv = parent;
    node.div = div;
    //@ts-ignore
    node.lineElement = window.Editor.getLineElementAt(node.start);

    parent.appendChild(div);
}

function CreateParamNode(parent: HTMLDivElement, node: Extended_Identifier, count:number){
    const paramsDiv = parent.getElementsByTagName("span")[0];
    const span = document.createElement("span");
    span.textContent = node.name;
    if(count>1)
        span.textContent = `, ${node.name}`;
    paramsDiv.append(span);
}

export function Create_Stack_Card(frame:FunctionFrame) : HTMLDivElement{
    const div = document.createElement("div");
    div.className = "card";
    const frameName : HTMLSpanElement = document.createElement("span");
    frameName.className = "card_title";
    frameName.textContent = frame.label;
    div.appendChild(frameName);

    for(const s of frame.scope){
        for(const v of s){
            Append_Variable(div, v);
        }
    }

    
    const childs_div = document.createElement("div");
    childs_div.className = "card_childs";
    div.appendChild(childs_div);

    return div;
}

function Append_Variable(div : HTMLDivElement, v: Var){
    const span = document.createElement("span");
    span.textContent = `${v.label}=${v.value}`

    div.appendChild(span);
}

function CreateVarDecNode(parent : HTMLDivElement, node :Extended_VariableDeclarator){
    const div = document.createElement("div");
    div.className = "treeElement varElement";

    const span=document.createElement("span");
    //@ts-ignore
    span.textContent =node.id.name;
    div.appendChild(span);

    node.div = div;
    node.parentDiv = parent;
    //@ts-ignore
    node.lineElement = window.Editor.getLineElementAt(node.start);
    parent.appendChild(div);
}

export class Visualizer{
    private div:HTMLDivElement;
    private tree_div:HTMLDivElement;
    private context_div:HTMLDivElement;
    public ast:Program;

    constructor(div_id : string){
        this.div = document.getElementById(div_id) as HTMLDivElement;
        if(!this.div)
            throw new Error(`No element fount with id ${div_id}`)
        while (this.div.firstChild) {
            this.div.removeChild(this.div.firstChild);
        }

        this.tree_div = document.createElement("div");
        this.tree_div.id = "tree";
        this.div.appendChild(this.tree_div);
        const tree_span = document.createElement("span");
        tree_span.textContent = "Gerarchia  ";
        const refreshTree_btn= document.createElement("button");
        refreshTree_btn.onclick = this.OnRefreshTree.bind(this);
        refreshTree_btn.textContent = "🔄";
        //tree_span.appendChild(refreshTree_btn);
        this.tree_div.appendChild(tree_span);

        this.context_div = document.createElement("div");
        this.context_div.id = "context";
        this.div.appendChild(this.context_div);

        this.Clear();
    }

    public Clear(){
        this.ClearContext();
        while (this.tree_div.lastChild && this.tree_div.lastChild.nodeName!="SPAN") {
            this.tree_div.removeChild(this.tree_div.lastChild);
        }
    } 

    public ClearContext(){
        while (this.context_div.firstChild) {
            this.context_div.removeChild(this.context_div.firstChild);
        }
    }

    public OnRefreshTree(){
        this.Clear();
        const treeRoot = document.createElement("div");
        treeRoot.className = "treeElement";
        const span=document.createElement("span");
        span.textContent = "GlobalScope";
        treeRoot.appendChild(span);

        //console.log("--- Recursive walk ----");
        recursive(this.ast, {nesting: 1, parent:treeRoot}, {
            FunctionDeclaration(node: Extended_FunctionDeclaration, state, c){
                node.nesting = state.nesting;
                CreateFunctionNode(state.parent, node);
                c(node.body, {nesting: state.nesting+1, parent:node.div});
            },
            VariableDeclarator(node: Extended_VariableDeclarator, state, c){
                node.nesting = state.nesting;
                //CreateVarDecNode(state.parent, node);
            }

        });

        recursive(this.ast, {parent:undefined, count:0}, {
            FunctionDeclaration(node: Extended_FunctionDeclaration, state, c){
                c(node.body, {parent:undefined, count:0});
                const b = document.createElement("span");
                b.textContent = "(";
                node.div.getElementsByTagName("span")[0].appendChild(b);

                let n = 1;
                node.params.forEach(element => {
                    c(element, {parent:node.div, count:n});
                    n+=1;
                });

                const e = document.createElement("span");
                e.textContent = ")";
                node.div.getElementsByTagName("span")[0].appendChild(e);
            },
            Identifier(node: Extended_Identifier, state, c){
                if(state.parent){
                    CreateParamNode(state.parent, node, state.count);
                }
            
            }
        })


        treeRoot.style.setProperty("border-left", "transparent");
        this.tree_div.appendChild(treeRoot);

    }

    public On_Refresh_Stack(){
        //@ts-ignore
        const _Global_frame : FunctionFrame = window._Global_frame;
        //console.log("resfreshing stack", _Global_frame);

        this.ClearContext();
        this.context_div.appendChild(_Global_frame.toCard());

    }


}