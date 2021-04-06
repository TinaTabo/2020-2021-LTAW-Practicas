//-- Crear una variable con la estructura definida
//-- en un fichero JSON

const fs = require('fs');

//-- Npmbre del fichero JSON a leer
const FICHERO_JSON = "tienda.json"

//-- Leer el fichero JSON (lectura sincrona)
const  tienda_json = fs.readFileSync(FICHERO_JSON);

//-- Crear la estructura tienda a partir del contenido del fichero
const tienda = JSON.parse(tienda_json);

//-- Imprimir contenido de la tienda
console.log("Contenido de la tienda");
console.log("----------------------");
console.log(tienda);

//-- Imprimir el numero de usuarios registrados
console.log("Hay " + tienda[1]["usuarios"].length + " usuarios registrados.");

//-- Imprimir lista de usuarios registrados.
console.log("Lista de usuarios registrados");
console.log("-----------------------------");
tienda[1]["usuarios"].forEach((element, index)=>{
    console.log("Usuario " + (index + 1) + ": " + element.user);
  });
console.log();