import type { Program } from "acorn";
import { recursive } from "acorn-walk";
import type { Extended_FunctionDeclaration, Extended_VariableDeclarator } from "./extended_nodes";

export function Set_Nesting(ast : Program){
    recursive(ast, {nesting: 1}, {
        FunctionDeclaration(node: Extended_FunctionDeclaration, state, c){
            node.nesting = state.nesting;
            c(node.body, {nesting: state.nesting+1});
        },
        VariableDeclarator(node: Extended_VariableDeclarator, state, c){
            node.nesting = state.nesting;        
        }
    
    });    
}