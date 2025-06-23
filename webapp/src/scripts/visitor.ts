import { parse, type AwaitExpression, type CallExpression, type Comment, type ExpressionStatement, type FunctionDeclaration, type Node, type Options, type Program, type Statement, type TryStatement} from "acorn";
import { ancestor } from "acorn-walk";
import type { CustomEditorView } from "./CustomEditor";
import { deepCopy, optionParse } from "./utils";
import { Gen_Dec_FramCreation, Gen_Dec_FrameDeletion } from "./stack";

const BreakCode = `
async function _BreakPoint(lineNo, line){
    //console.log("Break point at line", lineNo);
    await window._lineInfo(lineNo, line, true);
    return;
}
`;

const breakNode : FunctionDeclaration = parse(BreakCode, optionParse).body[0] as FunctionDeclaration;

function copyFunctionInNode(node : FunctionDeclaration, fun: FunctionDeclaration){
    node.type = fun.type;
    node.async = fun.async;
    node.body = fun.body;
    node.params = fun.params;
    node.expression = fun.expression;
    node.generator = fun.generator;
    node.id = fun.id;
}

function Wrap(ast : Program) : Program{
    const wrapper = parse(`
const console = window.konsole;
console.clear();
try{
}catch (e){
    console.error("Errore durante l'esecuzione");
    console.log(e);
}        
        `, optionParse);

    //@ts-ignore
    const tryStatement : TryStatement = wrapper.body[2];
    //@ts-ignore
    tryStatement.block.body = ast.body;
    console.log("Wrapper ", wrapper);
    wrapper.body.push(breakNode);
    wrapper.body.push(Gen_Dec_FramCreation());
    wrapper.body.push(Gen_Dec_FrameDeletion());
    wrapper.body.push(parse(`window._on_end_execution()`, optionParse).body[0]);
    wrapper.body.push(parse("function color_print(text, color=`black`){console.log(`%c${text}`, `color: ${color}`);}", optionParse).body[0]);
    return wrapper;
}

function Wrap_with_testing(ast : Program, tests_code: string) : Program{
    const wrapper = parse(`
const console = window.konsole;
console.clear();
try{
}catch (e){
    console.error("Errore durante l'esecuzione");
    console.log(e);
}        
        `, optionParse);

    //@ts-ignore
    const tryStatement : TryStatement = wrapper.body[2] as TryStatement;
    
    tryStatement.block.body = ast.body as Statement[];

    const tests:Program = parse(tests_code, optionParse);
    for(const t of (tests.body as Statement[])){
        //@ts-ignore
        callExpression_ToAwait_Expression(t.expression);
        tryStatement.block.body.push(t);
    }

    console.log("Wrapper ", wrapper);
    wrapper.body.push(breakNode);
    wrapper.body.push(Gen_Dec_FramCreation());
    wrapper.body.push(Gen_Dec_FrameDeletion());
    wrapper.body.push(parse(`window._on_end_execution()`, optionParse).body[0]);
    wrapper.body.push(parse("function color_print(text, color=`black`){console.log(`%c${text}`, `color: ${color}`);}", optionParse).body[0]);
    wrapper.body.push(parse("async function _test(funName, result, ...params){return await window._test(funName, result, ...params)}", optionParse).body[0]);
    return wrapper;
}

function callExpression_ToAwait_Expression(node : CallExpression){
    //@ts-ignore
    const e : CallExpression= {};
    deepCopy(e, node);
    const awaitExpression : AwaitExpression = {
        start : e.start,
        end: e.end,
        type : "AwaitExpression",
        argument : e
    }
    deepCopy(node, awaitExpression);
}

export async function Visit(ast : Program, comments : Comment[], Editor : CustomEditorView, tests: string=undefined) : Promise<Program>{
    ancestor(ast, {
        FunctionDeclaration(node :FunctionDeclaration){
            //console.log("Funzione", node.id.name);
            node.async = true;
            //console.log(node.start, node.end);
        },
        CallExpression(node : CallExpression, state, ancestor){
            callExpression_ToAwait_Expression(node);
        }        
    });

    if(tests){
        return Wrap_with_testing(ast, tests);
    }else{
        return Wrap(ast);
    }
}