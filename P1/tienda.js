//-- Servidor de mi tienda de música.
const http = require('http');
const fs = require('fs');
const url = require('url');

//-- Puerto a utilizar
const PUERTO = 9000

//-- Crear el servidor. Por cada petición recibida
//-- se imprime un mensaje de control en el terminal
const server = http.createServer((req, res) => {
    console.log("Petición recibida");

    //-- Aqui se va a programar la lectura de 
    //-- ficheros que el servidor devuelva las 
    //-- paginas correspondientes a las distintas 
    //-- peticiones.
    

})

//-- Activar el servidor
server.listen(PUERTO);

console.log("Servidor Activado!. Escuchando en el puerto " + PUERTO);

