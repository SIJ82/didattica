import type { CustomEditorView } from "./CustomEditor";
import { CreateEditor } from "./editor";
import { _test, Lab_Code_execution, Lab_Refresh } from "./lab/lab_utils";
import { getStringFromLocalStorage, saveStringToLocalStorage } from "./store_manager";
import { Visualizer } from "./visualizer";

let Editor : CustomEditorView;
let Editor2 : CustomEditorView;
let visualizer : Visualizer;
const editor_div = document.getElementById("editor_div") as HTMLDivElement;
const debug_editor_div = document.getElementById("debug_editor_div") as HTMLDivElement;
const visualizer_div = document.getElementById("visualizer") as HTMLDivElement;

const code_exec = document.getElementById("code_exec") as HTMLButtonElement;
code_exec.onclick = On_Code_Exec_Btn;
const next_exec = document.getElementById("next_exec") as HTMLButtonElement;
next_exec.onclick = On_Next_Exec_Btn;
const inject_btn = document.getElementById("inject_btn") as HTMLButtonElement;
inject_btn.onclick = On_Injected_btn;
const visualizer_btn = document.getElementById("visualizer_btn") as HTMLButtonElement;
visualizer_btn.onclick = On_Visualizer_btn;
const refresh_btn = document.getElementById("refresh_btn") as HTMLButtonElement;
refresh_btn.onclick = On_Refresh_btn;
const all_breakpoints_btn = document.getElementById("all_breakpoints") as HTMLButtonElement;
const stop_exec_btn = document.getElementById("stop_exec") as HTMLButtonElement;
const dynamic_btn = document.getElementById("dynamic_btn") as HTMLButtonElement;
const save_btn = document.getElementById("save_btn") as HTMLButtonElement;
const open_btn = document.getElementById("open_btn") as HTMLButtonElement;


async function On_Code_Exec_Btn() {
    saveStringToLocalStorage(document.title, Editor.code);
    await Lab_Code_execution(Editor, Editor2, visualizer, tests);
}

async function On_Next_Exec_Btn() {
    //@ts-ignore
    if(!window.resolveOperation)
        throw new Error("No code blocked!");

    //@ts-ignore
    window.resolveOperation({status:"continue"});
}

async function On_Injected_btn() {
    inject_btn.disabled = true;
    visualizer_btn.disabled = false;
    visualizer_div.classList.add("closed");
    debug_editor_div.classList.remove("closed");
}

async function On_Visualizer_btn() {
    visualizer_btn.disabled = true;
    inject_btn.disabled = false;
    debug_editor_div.classList.add("closed");
    visualizer_div.classList.remove("closed");
}

async function On_Refresh_btn() {
    await Lab_Refresh(Editor, Editor2, visualizer, tests);
}



const tests = `
_test(f, 4, 2, 2);
_test(f, 8, 4, 4);
`;


export async function Lab_main(code : string) {
    const saved_code = getStringFromLocalStorage(document.title);
    if(saved_code)
        code = saved_code;
    Editor = CreateEditor(editor_div, code);
    //@ts-ignore
    window.Editor = Editor;
    //@ts-ignore
    window._test = _test;
    Editor2 = CreateEditor(debug_editor_div, code);
    visualizer =new  Visualizer("visualizer");
    //@ts-ignore
    window.visualizer = visualizer;
    
}