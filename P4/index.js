const electron = require('electron');

console.log("Hola desde el proceso de la web (index.js)...");

//-- Obtener elementos de la interfaz
const btn_test = document.getElementById("btn_test");
const display = document.getElementById("display");
const node_v = document.getElementById("info1");
const electron_v = document.getElementById("info2");
const chrome_v = document.getElementById("info3");
const arquitectura = document.getElementById("info4");
const plataforma = document.getElementById("info5");
const directorio = document.getElementById("info6");
const usuarios = document.getElementById("users");
const dir_ip = document.getElementById("dir_ip");
const msg_entry = document.getElementById("msg_entry");

//-- MEJORA: Notificar al resto de usuario si uno de ellos
//--         está escribiendo.
const msg_writing = "Army está escribiendo...";
let escribiendo = false;

//-- Crear un websocket. Se establece la conexión con el servidor
const socket = io();

//-- MEJORA
msg_entry.oninput = () => {
    if (!escribiendo){
      socket.send(msg_writing);
      escribiendo = true;
    }
}

//-- Al apretar el botón se envía un mensaje al servidor
msg_entry.onchange = () => {
    if (msg_entry.value)
      socket.send(msg_entry.value);
      escribiendo = false;
    
    //-- Borrar el mensaje actual
    msg_entry.value = "";
}

//-- Funcionamiento del boton de test.
//-- Envia mensajes al proceso MAIN.
btn_test.onclick = () => {
    display.innerHTML += "TEST! ";
    console.log("Botón apretado!");

    //-- Enviar mensaje al proceso principal
    electron.ipcRenderer.invoke('test', "MENSAJE DE PRUEBA: Boton apretado");
}

//-- Mensaje recibido del proceso MAIN con información.
electron.ipcRenderer.on('info', (event, message) => {
    console.log("Recibido: " + message);

    //-- Obtenemos la información que envia el servidor.
    node_v.textContent = message[0];
    electron_v.textContent = message[1];
    chrome_v.textContent = message[2];
    ip = message[3];
    arquitectura.textContent = message[4];
    plataforma.textContent = message[5];
    directorio.textContent = message[6];
    port = message[7];
    fich = message[8];

    //-- Definir la url con la informacion
    url = "http://" + ip + ":" + port + "/" + fich;
    dir_ip.textContent = url;
    
});

//-- Mensaje recibido del proceso MAIN con el numero de usuarios.
electron.ipcRenderer.on('users', (event, message) => {
    console.log("Recibido: " + message);
    usuarios.textContent = message;
});

//-- Mensaje recibido del proceso MAIN con los mensajes de los usuarios.
electron.ipcRenderer.on('message', (event, message) => {
    console.log("Recibido: " + message);
    display.innerHTML += message + "<br>";
});

