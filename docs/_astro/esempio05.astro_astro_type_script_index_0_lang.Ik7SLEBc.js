import{m as o}from"./babel_test.BCX0R-xq.js";const n=`let x = 10;
function f(){
  console.log("Scope di f");
  let x = 20;
  g();
  return;
}

function g(){
  console.log("In g x vale", x);
  return;
}

console.log("Main scope");
g();
f();`;o(n);
