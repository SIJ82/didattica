import type { CustomEditorView } from "./CustomEditor";
import { CreateEditor } from "./editor";
import { downloadTextFile, openAndReadTextFile } from "./filemanager";
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
all_breakpoints_btn.onclick = On_All_breakpoints;
const stop_exec_btn = document.getElementById("stop_exec") as HTMLButtonElement;
stop_exec_btn.onclick = On_Stop_Exec_Button;
const dynamic_btn = document.getElementById("dynamic_btn") as HTMLButtonElement;
dynamic_btn.onclick = On_Dynamic_btn;
const save_btn = document.getElementById("save_btn") as HTMLButtonElement;
save_btn.onclick = On_Save_Btn;
const open_btn = document.getElementById("open_btn") as HTMLButtonElement;
open_btn.onclick = On_Open_Btn;


async function On_Code_Exec_Btn() {
    saveStringToLocalStorage(document.title, Editor.code);
    await Lab_Code_execution(Editor, Editor2, visualizer, tests, dynamic);
}

async function On_Next_Exec_Btn() {
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
    await Lab_Refresh(Editor, Editor2, visualizer, tests, dynamic);
}

let dynamic : boolean = false
async function On_Dynamic_btn() {
    dynamic = !dynamic;
    if(dynamic){
        dynamic_btn.childNodes[0].textContent = "👋";
    }else{
        dynamic_btn.childNodes[0].textContent = "🤚";
    }

}

//@ts-ignore
window.always_break = false;
async function On_All_breakpoints() {
    //@ts-ignore
    window.always_break = !window.always_break;
    //@ts-ignore
    if(window.always_break){
        all_breakpoints_btn.style.setProperty("background-color", "red");
    }else{
        all_breakpoints_btn.style.removeProperty("background-color");
    }
}

async function On_Save_Btn() {
    downloadTextFile(Editor.code, `file.js`);
}

async function On_Open_Btn() {
    const code = await  openAndReadTextFile();
    Editor.setCode(code);
}





let tests :string = `
_test(f, 4, 2, 2);
_test(f, 8, 4, 4);
`;
export async function Lab_main(code : string, _tests:string=tests) {
    tests = _tests;
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

export async function Lab_from_file() {
    const file_input = document.getElementById("file_input") as HTMLInputElement;
    file_input.onchange = On_file_inputChange;
}

async function On_file_inputChange(event : Event){
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) {
    return  new Error('Nessun file selezionato.');
    
    
  }
  const file = target.files[0];
  const filename =target.files[0].name;
  const reader = new FileReader();

  reader.onload = (readerEvent: ProgressEvent<FileReader>) => {
    if (readerEvent.target && typeof readerEvent.target.result === 'string') {
        const loaded_code = readerEvent.target.result.split("#test_cases");
        const obfuscate = document.getElementById("obfuscate");
        obfuscate.parentElement.removeChild(obfuscate);

        document.title = filename;
        Lab_main(loaded_code[0], loaded_code[1]);
        return;
    } else {
        return new Error('Impossibile leggere il contenuto del file.');
    }
  };
  reader.onerror = () => {
        return new Error('Errore durante la lettura del file.');
  };
  reader.readAsText(file);
  
}