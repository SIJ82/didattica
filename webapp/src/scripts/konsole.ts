
let realConsole : Console;
const console_div = document.getElementById("konsole") as HTMLDivElement;
export function konsole(rConsole): Console{
    realConsole = rConsole;
    return {
        ...realConsole, // Copia tutte le funzioni originali (warn, error, info, etc.)
        log: customLog, // Sovrascrivi solo la funzione log con la nostra versione personalizzata
        clear: clear,
        //@ts-ignore
        colored : coloredLog
    };
} 

function customLog(message? : any, ...optionalParams: any[]): void{
    const line = document.createElement("div");
    line.innerHTML = createString(message, ...optionalParams);
    console_div.appendChild(line);
    realConsole.log(message, ...optionalParams);
}

function coloredLog(message : any, color : string){
    const line = document.createElement("div");
    line.innerHTML = createString(message);
    line.style.setProperty("color", color);
    console_div.appendChild(line);
    
    realConsole.log(`%c${message}`, `color: ${color}`);
}

function clear(){
    console_div.innerHTML = "";
}

function convertToString(any):string{
    try {
        //console.log(any, typeof any);
        if(any instanceof Array){
            return JSON.stringify(any);
        }else if(any instanceof Object){
            return JSON.stringify(any, null, 2);
        }

    } catch (error) {
    }
    return String(any);
}

function createString(message? : any, ...optionalParams: any[]): string{

    let text = convertToString(message);
    for(const o of optionalParams){
        text += ` ${convertToString(o)}`;
    }

    return `<pre>${text}</pre>`;
}