import { parse, type CallExpression, type ExpressionStatement, type FunctionDeclaration, type Program, type Statement, type VariableDeclaration } from "acorn";
import { full, fullAncestor, recursive, simple } from "acorn-walk";
import type { Extended_FunctionDeclaration, Extended_Identifier, Extended_VariableDeclarator , Extended_ReturnStatement, Extended_BlockStatement} from "./extended_nodes";
import type { CustomEditorView } from "./CustomEditor";
import { deepCopy, optionParse } from "./utils";

let Editor : CustomEditorView;
export function Set_Breakpoints(ast : Program, always_break:boolean){
    //@ts-ignore
    Editor = window.Editor;

    simple(ast, {
        ExpressionStatement(node : ExpressionStatement){
                    if(node.expression.type == "Identifier" && node.expression.name == "bp"){
                        let line = Editor.lineAt(node.start);
                        line = Editor.state.doc.line(line.number+1);
                        deepCopy( node, GenBreakCall(line.number, line.text) );
                    }
        }
    });

    if(!always_break) return;

    recursive(ast, {p : undefined}, {
        BlockStatement(node : Extended_BlockStatement, state, c){
            for(const child of node.body){
                c(child, {p: node})
            }
        },
        ReturnStatement(node: Extended_ReturnStatement, state, c){
            if(state.p){
                //console.log("Return statement", node, state.p);
                PushBreak(state.p, node);
                
            }
        },
        ExpressionStatement(node: ExpressionStatement, state, c){
            if(node.expression.type=="CallExpression"){
                //console.log("call expression", node.expression);
                if(state.p)
                    PushBreak(state.p, node);
                else
                    PushBreak(ast, node);
            }
        },
        FunctionDeclaration(node: FunctionDeclaration, state, c){
            FunctionBreak(node);
            c(node.body, state);
        },VariableDeclaration(node: VariableDeclaration, state, c){
            if(state.p)
                PushBreak(state.p, node);
            else
                PushBreak(ast, node);
        }
    });

}

function GenBreakCall(lineNo: number, line: string){
    const BreakCallCode = ` await _BreakPoint(${lineNo}, \`break point : ${line}\`); `;
    const breakCall : ExpressionStatement = parse(BreakCallCode, optionParse).body[0] as ExpressionStatement;

    return breakCall;
}

function PushBreak(parent, node){
    const body : Statement[] = parent.body;
    const idx : number = body.indexOf(node);
    if(idx <0){
        console.error(node,"  not found in ",body);
        return;
    }

    let line = Editor.lineAt(node.start);
    parent.body = body.toSpliced(idx, 0, GenBreakCall(line.number, line.text));
}

function FunctionBreak(node : FunctionDeclaration){
    const body : Statement[] = node.body.body;
    let line = Editor.lineAt(node.start);
    node.body.body = body.toSpliced(0, 0, GenBreakCall(line.number, line.text));
}