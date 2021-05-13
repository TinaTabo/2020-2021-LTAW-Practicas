//-- Elementos del interfaz
const display = document.getElementById("display");
const msg_entry = document.getElementById("msg_entry");

//-- MEJORA: Notificar al resto de usuario si uno de ellos
//--         está escribiendo.
const msg_writing = "Un usuario está escribiendo...";
let escribiendo = false;

//-- Crear un websocket. Se establece la conexión con el servidor
const socket = io();


socket.on("message", (msg)=>{
  display.innerHTML += '<p>' + msg + '</p>';
});

//-- Al apretar el botón se envía un mensaje al servidor
msg_entry.onchange = () => {
  if (msg_entry.value)
    socket.send(msg_entry.value);
    escribiendo = false;
  
  //-- Borrar el mensaje actual
  msg_entry.value = "";
}

//-- MEJORA
msg_entry.oninput = () => {
  if (!escribiendo){
    socket.send(msg_writing);
    escribiendo = true;
  }
}
