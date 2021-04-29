//-- Servidor de mi tienda

const http = require('http');
const fs = require('fs');
const PUERTO = 9000;

//-- Cargar la pagina principal de la web
const INICIO = fs.readFileSync('inicio.html', 'utf-8');

//-- Cargar pagina web del formulario login
const FORMULARIO_LOGIN = fs.readFileSync('login.html','utf-8');
const FORMULARIO_PEDIDO = fs.readFileSync('pedido.html','utf-8');

//-- Cargar las paginas de respuesta
const LOGIN_OK = fs.readFileSync('login-ok.html','utf-8');
const LOGIN_KO = fs.readFileSync('login-ko.html','utf-8');
const PEDIDO_OK = fs.readFileSync('pedido-ok.html', 'utf-8');

//-- Registro -> Fichero JSON
const FICHERO_JSON = "tienda.json";
const FICHERO_JSON_PRUEBA = "tienda_prueba.json";

//-- Leer el fichero JSON (lectura sincrona)
const  tienda_json = fs.readFileSync(FICHERO_JSON);

//-- Crear la estructura tienda a partir del contenido del fichero
const tienda = JSON.parse(tienda_json);

//-- Crear una lista de usuarios registrados.
let users_reg = [];
console.log("Lista de usuarios registrados");
console.log("-----------------------------");
tienda[1]["usuarios"].forEach((element, index)=>{
    console.log("Usuario " + (index + 1) + ": " + element.user);
    users_reg.push(element.user);
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

    //-- Por defecto -> pagina de inicio
    let content_type = "text/html";
    let content = INICIO;

    //-- Acceso al formulario login
    if (myURL.pathname == '/login') {
        content_type = "text/html";
        content = FORMULARIO_LOGIN;
    }

    //-- Procesar la respuesta del formulario login
    if (myURL.pathname == '/procesarlogin') {
        //-- Obtener el nombre de usuario
        let user = myURL.searchParams.get('nombre');
        console.log('Nombre: ' + user);
        //-- Dar bienvenida solo a usuarios registrados.
        content_type = "text/html";
        if (users_reg.includes(user)){
            console.log('El usuario esta registrado');
            content = LOGIN_OK;
            html_extra = user;
            content = content.replace("HTML_EXTRA", html_extra);
        }else{
            content = LOGIN_KO;
        }
    }

    //-- Acceso al formulario pedido
    if (myURL.pathname == '/pedido') {
      content_type = "text/html";
      content = FORMULARIO_PEDIDO;
    }

    //-- Procesar la respuesta del formulario pedido
    if (myURL.pathname == '/procesarpedido') {
      //-- Guardar los datos del pedido en el fichero JSON
      //-- Primero obtenemos los parametros
      let direccion = myURL.searchParams.get('dirección');
      let tarjeta = myURL.searchParams.get('tarjeta');
      console.log("Dirección de envío: " + direccion + "\n" +
                  "Número de la tarjeta: " + tarjeta + "\n");
      //-- Guardar datos del pedido en el registro tienda.json
      //-- si este no es nulo (null)
      if ((direccion != null) && (tarjeta != null)) {
        let pedido = {
          "user": "root",
          "dirección": direccion,
          "tarjeta": tarjeta,
          "productos": [
            {
              "producto": "guitarra"
            },
            {
              "producto": "piano"
            }
          ]
        }
        tienda[2]["pedidos"].push(pedido);
        //-- Convertir a JSON y registrarlo
        let myTienda = JSON.stringify(tienda, null, 4);
        fs.writeFileSync(FICHERO_JSON_PRUEBA, myTienda);
      }
      //-- Confirmar pedido
      content_type = "text/html";
      console.log('Pedido procesado correctamente');
      content = PEDIDO_OK;
     }

    //-- Si hay datos en el cuerpo, se imprimen
  req.on('data', (cuerpo) => {

    //-- Los datos del cuerpo son caracteres
    req.setEncoding('utf8');
    console.log(`Cuerpo (${cuerpo.length} bytes)`)
    console.log(` ${cuerpo}`);
  });

  //-- Esto solo se ejecuta cuando llega el final del mensaje de solicitud
  req.on('end', ()=> {
    //-- Generar respuesta
    res.setHeader('Content-Type', content_type);
    res.write(content);
    res.end()
  });

});

server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);