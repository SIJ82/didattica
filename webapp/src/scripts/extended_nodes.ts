import type { BlockStatement, FunctionDeclaration, Identifier, ReturnStatement, VariableDeclarator } from "acorn";

export interface Extended_FunctionDeclaration extends FunctionDeclaration{
    nesting ?: number,
    parentDiv? :HTMLDivElement,
    div? : HTMLDivElement
    lineElement? : HTMLElement

}

export interface Extended_Identifier extends Identifier{
    div? : HTMLDivElement
}

export interface Extended_VariableDeclarator extends VariableDeclarator{
    nesting?: number,
    parentDiv?: HTMLDivElement,
    div? : HTMLDivElement,
    lineElement? : HTMLElement
}

export interface Extended_BlockStatement extends BlockStatement{

}

export interface Extended_ReturnStatement extends ReturnStatement{
}