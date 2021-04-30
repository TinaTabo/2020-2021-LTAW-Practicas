//-- Servidor de mi tienda

const http = require('http');
const fs = require('fs');
const PUERTO = 9000;

//-- Definir los tipos de mime
const mime_type = {
  "html" : "text/html",
  "css"  : "text/css",
  "js"   : "application/javascript",
  "jpg"  : "image/jpg",
  "JPG"  : "image/jpg",
  "jpeg" : "image/jpeg",
  "png"  : "image/png",
  "gif"  : "image/gif",
  "ico"  : "image/x-icon",
  "json" : "application/json",
  "TTF"  : "font/ttf"
};

//-- Cargar la pagina principal de la web
const INICIO = fs.readFileSync('inicio.html', 'utf-8');

//-- Cargar las paginas de los productos
const PRODUCTO1 = fs.readFileSync('producto1.html', 'utf-8');
const PRODUCTO2 = fs.readFileSync('producto2.html', 'utf-8');
const PRODUCTO3 = fs.readFileSync('producto3.html', 'utf-8');
const PRODUCTO4 = fs.readFileSync('producto4.html', 'utf-8');

//-- Cargar la pagina del Carrito
const CARRITO = fs.readFileSync('carrito.html','utf-8');

//-- Variable para saber si hay articulos en el carrito
let carrito_existe = false;

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

//-- Crear una lista de productos disponibles.
let productos_disp = [];
console.log("Lista de productos disponibles");
console.log("-----------------------------");
tienda[0]["productos"].forEach((element, index)=>{
  console.log("Producto " + (index + 1) + ": " + element.nombre +
              ", Stock: " + element.stock + ", Precio: " + element.precio 
              + ", Descuento: " + element.descuento);
  productos_disp.push([element.nombre, element.descripcion, element.stock, 
                       element.precio, element.descuento]);
});
console.log();

//-- Analizar la cookie y devolver el nombre de usuario si existe,
//-- null en caso contrario.
function get_user(req) {
  
  //-- Leer la cookie recibida
  const cookie = req.headers.cookie;

  //-- Si hay cookie, guardamos el usuario
  if (cookie) {
    //-- Obtener un array con todos los pares nombre-valor
    let pares = cookie.split(";");

    //-- Variable para guardar el usuario
    let user;

    //-- Recorrer todos los pares nombre-valor
    pares.forEach((element, index) => {
      //-- Obtener los nombre y los valores por separado
      let [nombre, valor] = element.split('=');

      //-- Leer el usuario solo si nombre = user
      if (nombre.trim() === 'user') {
        user = valor;
      }
    });

    //-- si user no esta asignada se devuelve null
    return user || null;
  }
}

//-- Funcion para crear las cookies al añadir articulos al carrito.
function añadir_al_carrito(req, res, producto) {
  const cookie = req.headers.cookie;

  if (cookie) {
    //-- Obtener un array con todos los pares nombre-valor
    let pares = cookie.split(";");

    //-- Recorrer todos los pares nombre-valor
    pares.forEach((element, index) => {
      //-- Obtener los nombre y los valores por separado
      let [nombre, valor] = element.split('=');

      //-- Si nombre = carrito enviamos cookie de respuesta
      if (nombre.trim() === 'carrito') {
        res.setHeader('Set-Cookie', element + ':' + producto);
      }
    });
  }
}

//-- Obtener el carrito
function get_carrito(req){
  //-- Leer la cookie recibida
  const cookie = req.headers.cookie;

  if (cookie){
    //-- Obtener un array con todos los pares nombre-valor
    let pares = cookie.split(";");

    //-- Variables para guardar los datos del carrito
    let carrito;
    let guitarra = '';
    let num_guitarras = 0;
    let piano = '';
    let num_pianos = 0;
    let acordeon = '';
    let num_acordeones = 0;
    let bateria = '';
    let num_baterias = 0;

    //-- Recorrer todos los pares nombre-valor
    pares.forEach((element, index) => {
      //-- Obtener los nombre y los valores por separado
      let [nombre, valor] = element.split('=');

      //-- Si nombre = carrito registramos los articulos
      if (nombre.trim() === 'carrito') {
        productos = valor.split(:);
        productos.forEach((producto) => {
          if (producto == 'guitarra'){
            if (num_guitarras == 0) {
              guitarra = productos_disp[0][0];
            }
            num_guitarras += 1;
          }else if (producto == 'piano'){
            if (num_pianos == 0){
              piano = productos_disp[1][0];
            }
            num_pianos += 1;
          }else if (producto == 'acordeon'){
            if (num_acordeones == 0){
              acordeon = productos_disp[2][0];
            }
            num_acordeones += 1;
          }else if (producto == 'bateria'){
            if (num_baterias == 0){
              bateria = productos_disp[3][0];
            }
            num_baterias += 1;
          }
        });

        if (num_guitarras != 0) {
          guitarra += ' x ' + num_guitarras;
        }
        if (num_pianos != 0) {
          piano += ' x ' + num_pianos;
        }
        if (num_acordeones != 0) {
          acordeon += ' x ' + num_acordeones;
        }
        if (num_baterias != 0) {
          bateria += ' x ' + num_baterias;
        }
        carrito = guitarra + '<br>' + piano + '<br>' + acordeon + '<br>' + bateria;
      }
    });

    //-- Si esta vacío se devuelve null
    return carrito || null;
  }
}

//-- Crear el SERVIDOR.
const server = http.createServer((req, res) => {

    //-- Construir el objeto url con la url de la solicitud
    const myURL = new URL(req.url, 'http://' + req.headers['host']);  
    console.log("");
    console.log("Método: " + req.method);
    console.log("Recurso: " + req.url);
    console.log("  Ruta: " + myURL.pathname);
    console.log("  Parametros: " + myURL.searchParams);

    //-- Obtener el usuario que ha accedido
    let user = get_user(req);

    //-- Por defecto -> pagina de inicio
    let content_type = mime_type["html"]; 
    let content = INICIO;
    if (myURL.pathname == '/'){
      //-- Si la variable user está asignada
      //-- no mostrar el acceso a login.
      if (user) {
        //-- Anadir a la página el nombre del usuario
        content = INICIO.replace("HTML_EXTRA", "<h2>Usuario: " + user + "</h2>" +
                  `<form action="/carrito" method="get"><input type="submit" value="Carrito"/></form>`);
      }else{
        //-- Mostrar el enlace al formulario Login
        content = INICIO.replace("HTML_EXTRA", 
                  `<form action="/login" method="get"><input type="submit" value="Login"/></form>`);
      }
    }

    //-- Acceso a las pagina de los productos
    if (myURL.pathname == '/producto1'){
      content_type = mime_type["html"]; 
      content = PRODUCTO1;
      content = content.replace('NOMBRE', productos_disp[0][0]);
      content = content.replace('DESCRIPCION', productos_disp[0][1]);
      content = content.replace('PRECIO', productos_disp[0][3]);
      content = content.replace('DESCUENTO', productos_disp[0][4]);
    }

    if (myURL.pathname == '/producto2'){
      content_type = mime_type["html"]; 
      content = PRODUCTO2;
      content = content.replace('NOMBRE', productos_disp[1][0]);
      content = content.replace('DESCRIPCION', productos_disp[1][1]);
      content = content.replace('PRECIO', productos_disp[1][3]);
      content = content.replace('DESCUENTO', productos_disp[1][4]);
    }

    if (myURL.pathname == '/producto3'){
      content_type = mime_type["html"]; 
      content = PRODUCTO3;
      content = content.replace('NOMBRE', productos_disp[2][0]);
      content = content.replace('DESCRIPCION', productos_disp[2][1]);
      content = content.replace('PRECIO', productos_disp[2][3]);
      content = content.replace('DESCUENTO', productos_disp[2][4]);
    }

    if (myURL.pathname == '/producto4'){
      content_type = mime_type["html"]; 
      content = PRODUCTO4;
      content = content.replace('NOMBRE', productos_disp[3][0]);
      content = content.replace('DESCRIPCION', productos_disp[3][1]);
      content = content.replace('PRECIO', productos_disp[3][3]);
      content = content.replace('DESCUENTO', productos_disp[3][4]);
    }

    //-- Procesar los articulos que van al carrito
    

    //-- Acceso al formulario login
    if (myURL.pathname == '/login') {
        content_type = mime_type["html"]; 
        content = FORMULARIO_LOGIN;
    }

    //-- Procesar la respuesta del formulario login
    if (myURL.pathname == '/procesarlogin') {
        //-- Obtener el nombre de usuario
        let user = myURL.searchParams.get('nombre');
        console.log('Nombre: ' + user);
        //-- Dar bienvenida solo a usuarios registrados.
        content_type = mime_type["html"]; 
        if (users_reg.includes(user)){
            console.log('El usuario esta registrado');
            //-- Asignar la cookie al usuario registrado.
            res.setHeader('Set-Cookie', "user=" + user);
            //-- Asignar la página web de login ok.
            content = LOGIN_OK;
            html_extra = user;
            content = content.replace("HTML_EXTRA", html_extra);
        }else{
            content = LOGIN_KO;
        }
    }

    //-- Acceso al formulario pedido
    if (myURL.pathname == '/pedido') {
      content_type = mime_type["html"]; 
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
          "user": user,
          "dirección": direccion,
          "tarjeta": tarjeta,
          "productos": "guitarra",
          "total": 1000
        }
        tienda[2]["pedidos"].push(pedido);
        //-- Convertir a JSON y registrarlo
        let myTienda = JSON.stringify(tienda, null, 4);
        fs.writeFileSync(FICHERO_JSON_PRUEBA, myTienda);
      }
      //-- Confirmar pedido
      content_type = mime_type["html"]; 
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