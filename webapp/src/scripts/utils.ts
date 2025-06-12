import type { Options } from "acorn";

export function deepCopy(o1 : any, o2:any){
    Object.keys(o2).forEach(key => {
        o1[key] = o2[key];
    });
}

export const optionParse : Options = {ecmaVersion:"latest", allowAwaitOutsideFunction:true}