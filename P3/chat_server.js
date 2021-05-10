//-- Cargar las dependencias
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');

//-- Puerto donde se utilizará el chat.
const PUERTO = 9000;

//-- Notificaciones del chat
const command_list = "Estos son los comandos soportados por BangChat:<br>"
                   + "/help: Muestra esta lista de comandos soportados<br>"
                   + "/list: Devuelve el número de usuarios conectados<br>"
                   + "/hello: El servidor devuelve un saludo<br>"
                   + "/date: El servidor nos devuelve la fecha actual";

const msg_hello = "Hello Army!";
const msg_welcome = "Bienvenid@ a BangChat!";
const msg_bye = "Bye Bye!";

//-- Contador de usuarios conectados
let users_count = 0;

//-- Obtener la fecha actual
const date = new Date(Date.now());

//-- Crear una nueva aplciacion web
const app = express();

//-- Crear un servidor, asosiaco a la App de express
const server = http.Server(app);

//-- Crear el servidor de websockets, asociado al servidor http
const io = socket(server);

//-------- PUNTOS DE ENTRADA DE LA APLICACION WEB
//-- Definir el punto de entrada principal de mi aplicación web
app.get('/', (req, res) => {
  res.send('Bienvenido a mi aplicación Web!!!' + '<p><a href="/Ej-09.html">Test</a></p>');
});

//-- Esto es necesario para que el servidor le envíe al cliente la
//-- biblioteca socket.io para el cliente
app.use('/', express.static(__dirname +'/'));

//-- El directorio publico contiene ficheros estáticos
app.use(express.static('public'));

//------------------- GESTION SOCKETS IO
//-- Evento: Nueva conexion recibida
io.on('connect', (socket) => {
  
  console.log('** NUEVA CONEXIÓN **'.yellow);

  //-- Evento de desconexión
  socket.on('disconnect', function(){
    console.log('** CONEXIÓN TERMINADA **'.yellow);
  });  

  //-- Mensaje recibido: Reenviarlo a todos los clientes conectados
  socket.on("message", (msg)=> {
    console.log("Mensaje Recibido!: " + msg.blue);

    //-- Reenviarlo a todos los clientes conectados
    io.send(msg);
  });

});

//-- Lanzar el servidor HTTP
//-- ¡Que empiecen los juegos de los WebSockets!
server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);