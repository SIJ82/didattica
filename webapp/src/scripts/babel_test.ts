import type { CustomEditorView } from './CustomEditor';
import { CreateEditor} from './editor';
import { Visualizer } from './visualizer';
import { Visit } from './visitor';
import { parse, type Comment } from 'acorn';
import { generate } from 'astring';
import { Set_Breakpoints } from './set_breakpoints';
import { Frame_Creation, Frame_Deletion, InjectStack, stack_options } from './stack';
import { Set_Nesting } from './set_nesting';

const code_editor = document.getElementById("code_editor") as HTMLDivElement;
const debug_editor = document.getElementById("debug_editor") as HTMLDivElement;
const visualizer_div = document.getElementById("visualizer") as HTMLDivElement;
let vis: Visualizer;
let Editor : CustomEditorView = undefined;
let Editor2 : CustomEditorView = undefined;

const code_exec = document.getElementById("code_exec") as HTMLButtonElement;
const next_exec = document.getElementById("next_exec") as HTMLButtonElement;
const inject_btn = document.getElementById("inject_btn") as HTMLButtonElement;
const visualizer_btn = document.getElementById("visualizer_btn") as HTMLButtonElement;
const refresh_btn = document.getElementById("refresh_btn") as HTMLButtonElement;
const all_breakpoints_btn = document.getElementById("all_breakpoints") as HTMLButtonElement;
const stop_exec_btn = document.getElementById("stop_exec") as HTMLButtonElement;
const dynamic_btn = document.getElementById("dynamic_btn") as HTMLButtonElement;

async function _lineInfo(line_no, line, stopEx=false){
        //@ts-ignore
        await window._line_Info_Hook(line_no, line);
        

        if(stopEx){ 
            next_exec.disabled=false;
            stop_exec_btn.disabled=false;
            //@ts-ignore
            (window.Editor as CustomEditorView).highlightLine(line_no);

            vis.On_Refresh_Stack();

            //@ts-ignore
            window.operationPromise = new Promise(resolve => { //@ts-ignore
                window.resolveOperation = resolve; // Esponi il resolver globalmente
            }); //@ts-ignore
            const res = await window.operationPromise;
            
            if(res.status != "continue"){
                throw new Error(res.message);
            }
            stop_exec_btn.disabled=true;

            //@ts-ignore
            (window.Editor as CustomEditorView).deHilightLastLine();
        }

}

async function lineInfo(line_no: number, line:string){
    //@ts-ignore
    const Editor : CustomEditorView = window.Editor;
    if(!Editor)
        throw new Error("lineInfo : Editor not found");

    Editor.deHilightLastLine();

    Editor.getLineElement(line_no);
    //console.log(line_no,`: ${line}`);

}

async function On_Code_Exec() {
    await refresh_btn.onclick(null);
    code_exec.disabled = true;     
    code_exec.classList.add("executing");
    refresh_btn.disabled = true;//@ts-ignore    
    window._lineInfo = _lineInfo; // @ts-ignore
    window._line_Info_Hook = lineInfo;// @ts-ignore
    window._on_end_execution = On_EndExecution; //@ts-ignore
    window._Frame_Creation = Frame_Creation; //@ts-ignore
    window._Frame_Deletion = Frame_Deletion

    const old_box = document.getElementById("_ScriptNode");
    if(old_box){
        old_box.parentElement.removeChild(old_box);
    }

    try {
        console.log("\n\n------------ Executing code --------------\n\n");

        // create window.stack


        const box = document.createElement("script");
        box.id = "_ScriptNode";
        box.type = "module";
        try {
            //box.type = "module";
            box.textContent = Editor2.code;
            document.body.appendChild(box);
        } catch (error) {
            console.log(error.message);
            document.body.removeChild(box);
            code_exec.disabled = false;
            code_exec.classList.remove("executing");
            refresh_btn.disabled = false;
            next_exec.disabled = true;
            stop_exec_btn.disabled=true;
        }

    } catch (error) {
        console.log(error.message);
        code_exec.disabled = false;
        code_exec.classList.remove("executing");
        refresh_btn.disabled = false;
        next_exec.disabled=true;
        stop_exec_btn.disabled=true;
    }
    

}

async function On_EndExecution() {
    vis.On_Refresh_Stack();
    code_exec.disabled = false;
    next_exec.disabled=true;
    code_exec.classList.remove("executing");
    refresh_btn.disabled = false;
    console.log("\n------------ Execution ended --------------");
}

async function On_Visualizer_btn() {
    visualizer_btn.disabled = true;
    inject_btn.disabled = false;
    debug_editor.classList.add("closed");
    visualizer_div.classList.remove("closed");
}

async function On_Injected_btn() {
    inject_btn.disabled = true;
    visualizer_btn.disabled = false;
    visualizer_div.classList.add("closed");
    debug_editor.classList.remove("closed");
}

async function On_next_exec() {
    //@ts-ignore
    if(!window.resolveOperation)
        throw new Error("No code blocked!");

    //@ts-ignore
    window.resolveOperation({status:"continue"});
}

async function On_Stop_Exec_Button() {
    //@ts-ignore
    if(!window.resolveOperation)
        throw new Error("No code blocked!");
    //@ts-ignore
    window.resolveOperation({status:"stopped", message:"Execution was stopped by user"});
}



let always_break = false;
async function On_RefhreshBtn(vis : Visualizer) {
    console.clear();
    let code = Editor.code;
    const comments : Comment[]= []
    const ast = parse(code, {ecmaVersion:'latest', onComment: comments, allowAwaitOutsideFunction:true});
    
    vis.ast = ast;
    vis.OnRefreshTree();
    

    //**todo** :: dovrei trasformare tutti gli if in block statement
    Set_Nesting(ast);
    Set_Breakpoints(ast, always_break);
    InjectStack(ast);
    
    console.log(ast);
    //console.log(comments);
    //console.log(JSON.stringify(ast));
    console.log("Visit ast...")
    const new_ast = await Visit(ast, comments, Editor);
    //console.log(ast);
    
    console.log("Code generation...")
    const gen = generate(new_ast);
    Editor2.setCode(gen);
}

async function LoadEditor(code : string) {
    Editor = CreateEditor(code_editor, code);
    Editor2 = CreateEditor(debug_editor, code);
    //@ts-ignore
    window.Editor = Editor;
    code_exec.disabled = false;
    
}

async function On_All_breakpoints() {
    always_break = !always_break;
    if(always_break){
        all_breakpoints_btn.style.setProperty("background-color", "red");
    }else{
        all_breakpoints_btn.style.removeProperty("background-color");
    }
}

async function On_Dynamic_btn() {
    stack_options.dynamic = !stack_options.dynamic;
    if(stack_options.dynamic){
        dynamic_btn.textContent = "👋";
    }else{
        dynamic_btn.textContent = "🤚";
    }

}

export async function main_proc(code : string =undefined) {
    

    code_exec.onclick = On_Code_Exec;
    code_exec.disabled = true;

    LoadEditor(code);
    visualizer_btn.onclick = On_Visualizer_btn;
    inject_btn.onclick = On_Injected_btn;
    next_exec.onclick = On_next_exec;
    vis = new Visualizer("visualizer");
    refresh_btn.onclick = On_RefhreshBtn.bind(this, vis);
    all_breakpoints_btn.onclick = On_All_breakpoints;
    stop_exec_btn.onclick = On_Stop_Exec_Button;
    dynamic_btn.onclick = On_Dynamic_btn;
}

//main_proc(`ciao`);