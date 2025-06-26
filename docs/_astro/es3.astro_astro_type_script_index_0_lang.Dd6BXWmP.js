import{a}from"./lab_main.BHl-4nac.js";import"./konsole.1Z1AgOxG.js";const i=`/*
	Usando lo scope dinamico definisci una funzione Saluta() che restituisce la stringa "Ciao Pippo" se viene chiamata dalla funzione Pippo
	e "Ciao Pluto" se viene chiamata dalla funzione Pluto().
	Non usare variabili globali.
	Utilizza i breakpoint per visualizzare i frame durante l'esecuzione.
*/

function Pippo(){
  const name = "Pippo";
  return Saluta();
}

function Pluto(){
  const name = "Pluto";
  return Saluta();
}

function Saluta(){
  return;
}

`,o=`
_test(Pippo, "Ciao Pippo")
_test(Pluto, "Ciao Pluto")
`;a(i,o);
