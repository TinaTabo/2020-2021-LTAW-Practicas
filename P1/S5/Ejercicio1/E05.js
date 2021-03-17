//-- Vamos a crear un cliente!!

//-- Importacion del modulo http/https(encriptado)
const https = require('https');

//--Recurso (EndPoint) que le vamos a pedir al servidor.
const ENDPOINT = "https://www.metaweather.com/api/location/766273/";

//--Creacion de la petición http que se va a enviar al servidor.
let request = https.get(ENDPOINT, (res) => { 
    //-- El servidor me ha respondido, tratamos la respuesta.
    //-- Hay error:
    if (res.statusCode !== 200 ) {
        console.error("Error");
        console.log("Código de respuesta: " + res.statusCode);
        res.resume();
        return;
    }

    //-- No hay error, sigue por aqui:
    let data = '';

    //-- Tratar el string de entrada.
    //-- se va a llamar cada vez que haya datos disponibles en el cuerpo.
    res.on('data', (chunk) => {
        data += chunk;
    });

    //-- Una vez terminado, se llama close y se analizan los datos.
    //-- los datos estan en json, y estan guardados en data.
    res.on('close', () => {
        console.log('Datos recibidos');

        //-- Obtener la variable con la informacion
        let tiempo = JSON.parse(data);

        //-- Se que la variable tiene una estructura determinada porque
        //-- me he leido la documentacion.
        //-- de dicha estructura obtenemos los datos relacionados con la
        //-- temperatura y los mostramos por consola.
        let temp = tiempo.consolidated_weather[0].the_temp;

        console.log("Lugar: " + tiempo.title);
        console.log("Temperatura: " + temp);
        console.log("Hora: " + tiempo.time);
        
    });
   
});