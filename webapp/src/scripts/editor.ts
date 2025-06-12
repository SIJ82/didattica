import {basicSetup} from "codemirror"
import {keymap} from "@codemirror/view"
import {indentWithTab} from "@codemirror/commands"
import { javascript } from "@codemirror/lang-javascript"
import {Line} from "@codemirror/state"
import { CustomEditorView } from "./CustomEditor"


const _doc = `const pi = 3.14159;

function piValue(){
  console.log("Pi vale ", pi);
  return pi;
}

function Informatico(varX, varY){
  let pi = Math.PI;
  piValue();
}

function Ingegnere(){
  let pi = 3;
  piValue();
}

piValue();
Informatico(1, " ciao");
Ingegnere();`;

export function CreateEditor (parent:Element, doc:string = _doc) :CustomEditorView{
  const css = `

  #highlight_line {

    background-color: rgba(255, 0, 0, 0.2);

    text-decoration: underline;

    text-decoration-color: red;

  }

  `
  document.head.appendChild(document.createElement("style")).textContent = css;

  if(!doc)
    doc = _doc;

  const Editor :CustomEditorView = new CustomEditorView({
    doc,
    extensions: [
      basicSetup,
      keymap.of([indentWithTab]),
      javascript(),
    ],
    parent: parent
  })


  return Editor;
}



