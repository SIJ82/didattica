import{m as o}from"./babel_test.DqCd0q3g.js";const l=`let saldo = 1000;
let tassoInteresse = 0.02;

function calcolaInteressi() {
    let saldo = 500;
    let mesi = 12;
    console.log("A) Saldo in calcolaInteressi:", saldo);
    console.log("B) Tasso in calcolaInteressi:", tassoInteresse);
  
    function applicaBonus() {
        let bonus = 50;
        let tassoInteresse = 0.05;
        console.log("C) Saldo in applicaBonus:", saldo);
        console.log("D) Tasso in applicaBonus:", tassoInteresse);
        console.log("E) Calcolo interesse:", saldo * tassoInteresse);
        return saldo + bonus;
    }
    
    let risultato = applicaBonus();
    console.log("F) Risultato bonus:", risultato);
    console.log("G) Saldo dopo bonus:", saldo);
    return;
}

function verificaCredito() {
    let commissioni = 10;
    console.log("H) Saldo in verificaCredito:", saldo);
    console.log("I) Saldo - commissioni:", saldo - commissioni);
    
    function controllaLimite() {
        let limite = 100;
        console.log("J) Controllo saldo > limite:", saldo > limite);
        return;
    }
    
    controllaLimite();
    return;
}

console.log("1) Saldo iniziale:", saldo);
calcolaInteressi();
console.log("2) Saldo dopo calcolaInteressi:", saldo);
verificaCredito();`;o(l);
