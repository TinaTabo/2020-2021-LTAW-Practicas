//-- Cargar las dependencias
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');
const electron = require('electron');
const process = require('process');
const ip = require('ip'); 

//-- Servidor de BangChat

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
const msg_newuser = "Un/a nuev@ Army se ha unido al Chat";

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
  res.send('Bienvenido a BangChat!!!' + '<p><a href="/chat_main.html">Ir a BangChat</a></p>');
});

//-- Esto es necesario para que el servidor le envíe al cliente la
//-- biblioteca socket.io para el cliente
app.use('/', express.static(__dirname +'/'));


//------------------- GESTION SOCKETS IO
//-- Evento: Nueva conexion recibida
io.on('connect', (socket) => {
  
  console.log('** NUEVA CONEXIÓN **'.yellow);
  //-- Contabilizar al nuevo usuario
  users_count += 1;
  
  //-- Enviar mensaje de bienvenida al usuario.
  socket.send(msg_welcome);

  //-- Notificar al resto de usuarios que un nuevo
  //-- usuario a accedido al chat.
  socket.broadcast.emit('message', msg_newuser);

  //-- Evento de desconexión
  socket.on('disconnect', function(){
    console.log('** CONEXIÓN TERMINADA **'.yellow);
    //-- Enviar mensaje de despedida al usuario.
    socket.broadcast.emit('message', msg_bye);
    //-- Actualizar el numero de usuarios conectados
    users_count -= 1;
  });  

  //-- Mensaje recibido: Reenviarlo a todos los clientes conectados
  socket.on("message", (msg)=> {
    console.log("Mensaje Recibido!: " + msg.blue);

    //-- Aqui comienza el tratamiento de los comandos especiales.
    if (msg.startsWith('/')) {
      console.log("Comando Especial".red.bold);
      switch(msg){
        case '/help':
          console.log("Mostrar lista de comandos especiales".red.bold);
          msg = command_list;
          socket.send(msg);
          break;
        case '/list':
          console.log("Mostrar número de usuarios conectados".red.bold);
          msg = users_count;
          socket.send("Hay " + msg + " usuarios conectados.");
          break;
        case '/hello':
          console.log("Obtener saludo del servidor".red.bold);
          msg = msg_hello;
          socket.send(msg);
          break;
        case '/date':
          console.log("Obtener fecha actual".red.bold);
          msg = date;
          socket.send(msg);
          break;
        default:
          console.log("comando no reconocido".red.bold);
          msg = "Comando NO reconocido.";
          socket.send(msg);
          break;
      }
    } else {
      //-- Reenviarlo a todos los clientes conectados
      io.send(msg);
    }; 
  });
});

//-- Lanzar el servidor HTTP
//-- ¡Que empiecen los juegos de los WebSockets!
server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);

//-- Crear aplicación Electron

console.log("Arrancando electron...");

//-- Variable para acceder a la ventana principal
//-- Se pone aquí para que sea global al módulo principal
let win = null;

//-- Punto de entrada. En cuanto electron está listo,
//-- ejecuta esta función
electron.app.on('ready', () => {
    console.log("Evento Ready!");

    //-- Crear la ventana principal de nuestra aplicación
    win = new electron.BrowserWindow({
        width: 1000,   //-- Anchura 
        height: 1000,  //-- Altura

        //-- Permitir que la ventana tenga ACCESO AL SISTEMA
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
    });

  //-- Cargar interfaz gráfica en HTML
  win.loadFile("index.html");

  //-- Obtención de informacion






  //-- Esperar a que la página se cargue y se muestre
  //-- y luego enviar el mensaje al proceso de renderizado para que 
  //-- lo saque por la interfaz gráfica
  win.on('ready-to-show', () => {
    win.webContents.send('print', "MENSAJE ENVIADO DESDE PROCESO MAIN");
  });

});


//-- Esperar a recibir los mensajes de botón apretado (Test) del proceso de 
//-- renderizado. Al recibirlos se escribe una cadena en la consola
electron.ipcMain.handle('test', (event, msg) => {
  console.log("-> Mensaje: " + msg);
  //-- Reenviar el msg a todos los clientes registrados
  io.send(msg);
});
