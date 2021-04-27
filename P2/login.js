//-- Servidor de mi tienda

const http = require('http');
const fs = require('fs');
const PUERTO = 9000;

//-- Cargar la pagina principal de la web
const INICIO = fs.readFileSync('inicio.html', 'utf-8');

//-- Cargar pagina web del formulario login
const FORMULARIO = fs.readFileSync('login.html','utf-8');

//-- Cargar las paginas de respuesta
const LOGIN_OK = fs.readFileSync('login-ok.html','utf-8');
const LOGIN_KO = fs.readFileSync('login-ko.html','utf-8');

//-- Registro -> Fichero JSON
const FICHERO_JSON = "tienda.json";

//-- Leer el fichero JSON (lectura sincrona)
const  tienda_json = fs.readFileSync(FICHERO_JSON);

//-- Crear la estructura tienda a partir del contenido del fichero
const tienda = JSON.parse(tienda_json);

//-- Imprimir lista de usuarios registrados.
console.log("Lista de usuarios registrados");
console.log("-----------------------------");
tienda[1]["usuarios"].forEach((element, index)=>{
    console.log("Usuario " + (index + 1) + ": " + element.user);
  });
console.log();

//-- Crear el SERVIDOR.
const server = http.createServer((req, res) => {

    //-- Construir el objeto url con la url de la solicitud
    const myURL = new URL(req.url, 'http://' + req.headers['host']);  
    console.log("");
    console.log("Método: " + req.method);
    console.log("Recurso: " + req.url);
    console.log("  Ruta: " + myURL.pathname);
    console.log("  Parametros: " + myURL.searchParams);

    //-- Obtener el nombre de usuario
    let user = myURL.searchParams.get('nombre');
    console.log('Nombre: ' + user);


});

server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);