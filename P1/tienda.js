//-- Servidor de mi tienda de música.
const http = require('http');
const fs = require('fs');
const url = require('url');

//-- Puerto
const PUERTO = 9000

//-- Crear el servidor. Por cada petición recibida
//-- se imprime un mensaje de control en el terminal
const server = http.createServer((req, res) => {
    console.log("----Petición recibida----");
    
    //-- Obtener y parsear la url de la petición
    let myURL = url.parse(req.url, true);
    console.log("Recurso solicitado (URL): " + req.url);
    console.log("Recurso: " + myURL.pathname);

    //-- Dependiendo del pathname, se define el fichero
    //-- con el que se responderá la petición

    //-- inicializamos el fichero vacío
    let fich = "";

    //-- Obtenemos el fichero correspondiente.
    if(myURL.pathname == '/'){
        fich += "/tienda.html"; //-- Página principal de la tienda
    }else{
        fich += myURL.pathname; //-- Otro recurso.
    }

    //-- Obtenemos el tipo de fichero para saber qué devolver al cliente.
    fich_type = fich.split(".")[1]; //-- Extension del archivo.
    fich = "." + fich; //-- Leer el archivo.
    //-- Comprobamos los parámetros obtenidos por el terminal
    console.log("Nombre del Fichero: " + fich);
    console.log("Tipo de Fichero: " + fich_type);

    //--Lectura asíncrona (mejor para servidor web) del fichero.
    //-- y obtención de la respuesta del servidor.
    fs.readFile(fich, function(err, data){

        //-- Definir tipo de archivo html.
        let mime = "text/html"

        //-- Definir tipo de imágenes
        if(fich_type == 'jpg' || fich_type == 'png'){
            mime = "image/" + fich_type;
        }

        //-- Definir css
        if (fich_type == 'css'){
            mime = "text/css";
        }

        //-- Fichero no encontrado --> Devolver página html de error.
        if (err){
            //-- Generar respuesta de error.
            res.writeHead(404,{'Content-Type': mime})
            res.write(data);
            res.end();
        }else{
            //-- No hay error --> 200 OK
            //-- Generar respuesta.
            res.writeHead(200, {'Content-Type': mime});
            res.write(data);
            res.end();
        }
    });
});

//-- Activar el servidor
server.listen(PUERTO);

console.log("Servidor Activado!. Escuchando en el puerto " + PUERTO);

