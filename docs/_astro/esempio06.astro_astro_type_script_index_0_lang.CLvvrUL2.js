import{m as o}from"./babel_test.DPD2IrOL.js";import"./konsole.1Z1AgOxG.js";const e=`let iva = 0.0;

function pagamento( prezzo ){
  let totale = prezzo + (prezzo * iva);
  return totale;
}

function italia( prezzo ){
  let iva = 0.22;
  return pagamento( prezzo );
}

function germania( prezzo ){
  let iva = 0.19;
  return pagamento( prezzo );
}

console.log( italia(100) );
console.log( germania(100) );
`;o(e);
