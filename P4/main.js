//-- Cargar las dependencias
const socket = require('socket.io');
const http = require('http');
const express = require('express');
const colors = require('colors');
const ip = require('ip');
const electron = require('electron');
const process = require('process');

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
const msg_newuser = "Un/a nuev@ Army se ha unido a BangChat";
//-- Obtener la fecha actual
const date = new Date(Date.now());
//-- Contador de usuarios conectados
let users_count = 0;

//-- Crear una nueva aplciacion web
const app = express();

//-- Crear un servidor, asosiaco a la App de express
const server = http.Server(app);

//-- Crear el servidor de websockets, asociado al servidor http
const io = socket(server);

//-- Variable para acceder a la ventana principal
//-- Se pone aquí para que sea global al módulo principal
let win = null;

//-------- PUNTOS DE ENTRADA DE LA APLICACION WEB
//-- Definir el punto de entrada principal de mi aplicación web
app.get('/', (req, res) => {
  path = __dirname + '/public/chat_main.html';
  res.sendFile(path);
  console.log("solicitud de acceso al chat");
});

//-- Esto es necesario para que el servidor le envíe al cliente la
//-- biblioteca socket.io para el cliente
app.use('/', express.static(__dirname +'/'));

//-- Directorio público que contiene ficheros estáticos.
app.use(express.static('public'));


//------------------- GESTION SOCKETS IO
//-- Evento: Nueva conexion recibida
io.on('connect', (socket) => {
  
  console.log('** NUEVA CONEXIÓN **'.yellow);
  //-- Contabilizar al nuevo usuario
  users_count += 1;
  //-- Enviar al render
  win.webContents.send('users', users_count);
  
  //-- Enviar mensaje de bienvenida al usuario.
  socket.send(msg_welcome);

  //-- Notificar al resto de usuarios que un nuevo
  //-- usuario a accedido al chat.
  io.send(msg_newuser);
  //-- Enviar al render
  win.webContents.send('msg', msg_newuser);

  //-- Evento de desconexión
  socket.on('disconnect', function(){
    console.log('** CONEXIÓN TERMINADA **'.yellow);
    //-- Enviar mensaje de despedida al usuario.
    io.send(msg_bye);
    //-- Enviar al render
    win.webContents.send('msg', msg_bye);

    //-- Actualizar el numero de usuarios conectados
    users_count -= 1;
    //-- Enviar al render
    win.webContents.send('users', users_count);
  });  

  //-- Mensaje recibido: Reenviarlo a todos los clientes conectados
  socket.on("message", (msg)=> {
    console.log("Mensaje Recibido!: " + msg.blue);

    //-- Enviar mensaje al render
    win.webContents.send('msg', msg);

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

//--------------------ELECTRON APP--------------------
//-- Punto de entrada. En cuanto electron está listo,
//-- ejecuta esta función
electron.app.on('ready', () => {
    console.log("Evento Ready!");

    //-- Crear la ventana principal de nuestra aplicación
    win = new electron.BrowserWindow({
        width: 1100,   //-- Anchura 
        height: 1100,  //-- Altura

        //-- Permitir que la ventana tenga ACCESO AL SISTEMA
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
    });

  //-- En la parte superior se nos ha creado el menu
  //-- por defecto
  //-- Si lo queremos quitar, hay que añadir esta línea
  win.setMenuBarVisibility(false)

  //-- Cargar interfaz gráfica en HTML
  let interfaz = "index.html"
  win.loadFile(interfaz);

  //-- Obtener la información del sistema
  //-- versión de node
  node_v = process.versions.node;
  //-- versión de electron
  electron_v = process.versions.electron;
  //-- versión de chrome
  chrome_v = process.versions.chrome;
  //-- URL a ka qye se deben conectar los clientes
  //-- para chatear.
  dir_ip =  ip.address();
  //-- arquitectura
  arquitectura = process.arch;
  //-- plataforma
  plataforma = process.platform;
  //-- directorio
  directorio = process.cwd();
  //-- numero de usuarios conectados
  //-- users_count (ya definido)
  //-- puerto (ya definido) -> PUERTO
  //-- Agrupar información
  let info = [node_v, electron_v, chrome_v, dir_ip, arquitectura,
              plataforma, directorio, PUERTO, interfaz];

  //-- Esperar a que la página se cargue y se muestre
  //-- y luego enviar el mensaje al proceso de renderizado para que 
  //-- lo saque por la interfaz gráfica
  win.on('ready-to-show', () => {
    console.log("Enviando info".red);
    win.webContents.send('info', info);
  });

});


//-- Esperar a recibir los mensajes de botón apretado (Test) del proceso de 
//-- renderizado. Al recibirlos se escribe una cadena en la consola
electron.ipcMain.handle('test', (event, msg) => {
  console.log("-> Mensaje: " + msg);
  //-- Reenviarlo a todos los usuarios
  io.send(msg);
});