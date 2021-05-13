const electron = require('electron');

console.log("Hola desde el proceso de la web...");

//-- Obtener elementos de la interfaz
const btn_test = document.getElementById("btn_test");
const display = document.getElementById("display");
const node_v = document.getElementById("info1");
const electron_v = document.getElementById("info2");
const chrome_v = document.getElementById("info3");
const arquitectura = document.getElementById("info4");
const plataforma = document.getElementById("info5");
const directorio = document.getElementById("info6");
const dir_ip = document.getElementById("dir_ip");
const print = document.getElementById("print");


btn_test.onclick = () => {
    display.innerHTML += "TEST! ";
    console.log("Botón apretado!");

    //-- Enviar mensaje al proceso principal
    electron.ipcRenderer.invoke('test', "MENSAJE DE PRUEBA: Boton apretado");
}

//-- Mensaje recibido del proceso MAIN
electron.ipcRenderer.on('print', (event, message) => {
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
