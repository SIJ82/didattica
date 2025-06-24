import { generate } from "astring";
import type { CustomEditorView } from "../CustomEditor";
import { Set_Breakpoints } from "../set_breakpoints";
import { Set_Nesting } from "../set_nesting";
import { Frame_Creation, Frame_Deletion, InjectStack, stack_options } from "../stack";
import { Visit } from "../visitor";
import type { Visualizer } from "../visualizer";
import { parse, type Comment } from "acorn";
import { konsole } from "../konsole";

const code_exec = document.getElementById("code_exec") as HTMLButtonElement;
const next_exec = document.getElementById("next_exec") as HTMLButtonElement;
const inject_btn = document.getElementById("inject_btn") as HTMLButtonElement;
const visualizer_btn = document.getElementById("visualizer_btn") as HTMLButtonElement;
const refresh_btn = document.getElementById("refresh_btn") as HTMLButtonElement;
const all_breakpoints_btn = document.getElementById("all_breakpoints") as HTMLButtonElement;
const stop_exec_btn = document.getElementById("stop_exec") as HTMLButtonElement;
const dynamic_btn = document.getElementById("dynamic_btn") as HTMLButtonElement;
const save_btn = document.getElementById("save_btn") as HTMLButtonElement;
const open_btn = document.getElementById("open_btn") as HTMLButtonElement;

export async function Lab_Code_execution(Editor: CustomEditorView, Editor2 : CustomEditorView, visualizer:Visualizer, tests:string, dynamic:boolean) {
    await Lab_Refresh(Editor, Editor2, visualizer, tests, dynamic);
    //@ts-ignore
    window.konsole = konsole(console); //@ts-ignore
    window._lineInfo = _lineInfo; //@ts-ignore
    window._line_Info_Hook = lineInfo; //@ts-ignore
    window._on_end_execution = On_EndExecution; //@ts-ignore
    window._Frame_Creation = Frame_Creation; //@ts-ignore
    window._Frame_Deletion = Frame_Deletion;

    const old_box = document.getElementById("_ScriptNode");
    if(old_box){
        old_box.parentElement.removeChild(old_box);
    }
    const box = document.createElement("script");
    try {
        box.id = "_ScriptNode";
        box.type = "module";
        console.log("\n\n------------ Executing code --------------\n\n");
        box.textContent = Editor2.code;
        document.body.appendChild(box);
    } catch (error) {
        console.log(error);
        document.body.removeChild(box);
        code_exec.disabled = false;
        code_exec.classList.remove("executing");
        refresh_btn.disabled = false;
        next_exec.disabled=true;
        stop_exec_btn.disabled=true;
    }
}

export async function Lab_Refresh(Editor: CustomEditorView, Editor2: CustomEditorView, visualizer : Visualizer, tests:string, dynamic:boolean) {
    stack_options.dynamic = dynamic;
    console.clear();
    let code = Editor.code;
    const comments : Comment[]= []
    const ast = parse(code, {ecmaVersion:'latest', onComment: comments, allowAwaitOutsideFunction:true});
    
    visualizer.ast = ast;
    visualizer.OnRefreshTree();
    

    //**todo** :: dovrei trasformare tutti gli if in block statement
    Set_Nesting(ast);
    //@ts-ignore
    Set_Breakpoints(ast, window.always_break);
    InjectStack(ast);
    
    console.log(ast);
    console.log("Visit ast...")
    const new_ast = await Visit(ast, comments, Editor, tests);
    //console.log(ast);
    
    console.log("Code generation...")
    const gen = generate(new_ast);
    Editor2.setCode(gen);
    
}

export async function _test(fun: Function, result : string, ...params) {
    //@ts-ignore
    const konsole: Console = window.konsole;
    konsole.log(`Test case : ${fun.name}(${params.join(",")})`);
    const res = await fun(...params);
    let color = "red";
    if(String(res) == String(result))
        color = "green";
    //@ts-ignore
    konsole.colored(`Result : ${res}, expected : ${result}`, color);
    
}


async function _lineInfo(line_no, line, stopEx=false){
        //@ts-ignore
        await window._line_Info_Hook(line_no, line);
        

        if(stopEx){ 
            next_exec.disabled=false;
            stop_exec_btn.disabled=false;
            //@ts-ignore
            (window.Editor as CustomEditorView).highlightLine(line_no);

            //@ts-ignore
            window.visualizer.On_Refresh_Stack();

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

async function On_EndExecution() {
    //@ts-ignore
    window.visualizer.On_Refresh_Stack();
    code_exec.disabled = false;
    next_exec.disabled=true;
    code_exec.classList.remove("executing");
    refresh_btn.disabled = false;
    console.log("\n------------ Execution ended --------------");
}