var request = require("request");
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

function encrypt(text){
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}


//var sleep = require("sleep");
//var url = "http://localhost:1338";
var url = "https://juegoprocesos.herokuapp.com";
/***********************IMPORTANTEEEEEEEEEEEEEEEEEEEEEEEE************************** */
var id = "58449b0f1dc69d00118a2282"
/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^SETEALOOOOOOOOOOOOOO^^^^^^^^^^^^^^^^^^^^^^^^*/

/**
 * TENEMOS UNA CUENTA ACTIVA xemagg95@gmail.com - jose
 * UN USUARIO jose - jose EN EL limbo
 * UN USUARIO josem - jose ACTIVO
 * UN USUARIO dani - dani ACTIVO
 * UN USUARIO jose2 - jose2 ACTIVO
 * UN USUARIO juan - juan ACTIVO
 * UN USUARIO pepe - pepe ACTIVO
 */
var headers = {
    "User-Agent":'Super Agent/0.0.1',
    "Content-Type":'application/x-www-form-urlencoded'
}

console.log("==============================================")
console.log(" Inicio de las pruebas del API REST:" + url);
console.log(" 1. Crear usuario - 2. Confirmar usuario");
console.log(" 3. Traer datos de juego");
console.log(" 4. Login de usuario (existente/inexistente)");
console.log(" 5. Modificar usuario - 6. Eliminar usuario");
console.log(" 7. El usuario no puede iniciar sesión");
console.log("============================================== \n")

console.log("==============================================")
console.log("******************IMPORTANTE******************")
console.log("       Setear ID de usuario de pruebas        ");
console.log("**********************************************")
console.log("==============================================")



function testRaiz(){
    var options = {
        url:url,
        method:'GET',
        headers:headers,
        qs:{'':''}
    }
    request(options, function(error, response,body){
        if(!error && response.statusCode == 200){
            //console.log(body);
            console.log("==========================================")
	        console.log("Respuesta testRaiz()");
	        console.log("--------------------------------------------------------");
            console.log("Test Raiz OK");
            console.log("========================================== \n")
        } else {
            console.log(response.statusCode);
        }
    });
}

function testCrearUsuario(email, pass){
    //console.log(email + " " + pass)
    var options = {
        url:url + '/crearUsuario/',
        method:'POST',
        form:{email:email,password:pass},
        headers:headers,
        qs:{'':''}
    }
    request.post(options, function(error, response, body){
       if(!error && response.statusCode == 200){
            //console.log("Body crear" + body);
            console.log("========================================== ")
	        console.log("Respuesta testCrearUsuario() con datos - Email " + email + " Password " + pass);
	        console.log("--------------------------------------------------------");
            console.log("Test crearUsuario - " + email + ", " + pass + " Resultado -> " + JSON.parse(body).result + " OK");
            console.log("========================================== \n")
        } else {
            console.log(response.statusCode);
        } 
    });
}

function testConfirmarUsuario(email,id){
    var options = {
        url:url + '/confirmarCuenta/' + email + '/' + id,
        method:'GET',
        headers:headers,
        qs:{'':''}
    }
    request(options, function(error, response, body){
       if(!error && response.statusCode == 200){
            //console.log("Body crear" + body);
            console.log("========================================== ")
	        console.log("Respuesta testConfirmarUsuario() con datos - Email " + email + " id " + id);
	        console.log("--------------------------------------------------------");
            console.log("Test confirmarUsuario - " + email + ", " + id + " Resultado ->  OK");
            console.log("========================================== \n")
        } else {
            console.log(response.statusCode);
        } 
    });
}



function testDatosJuego(){
    var options = {
        url:url+'/datosJuego/'+id,
        method:'GET',
        headers:headers,
        qs:{'':''}
    }
    request(options, function(error, response,body){
        if(!error && response.statusCode == 200){
            console.log("==========================================")
	        console.log("Respuesta testDatosJuego()");
	        console.log("--------------------------------------------------------");
            console.log(body);
            console.log("Test testDatosJuego - Nivel " + JSON.parse(body).nivel + " Numero de plataformas " + JSON.parse(body).platforms.length + " OK");
            console.log("========================================== \n")
        } else {
            console.log(response.statusCode);
        }
    });
}

function testLogin(email, pass){
    var options = {
        url:url + '/login/',
        method:'POST',
        form:{email:email,password:pass},
        headers:headers,
        qs:{'':''}
    }
    request.post(options, function(error, response, body){
       if(!error && response.statusCode == 200){
            //console.log("Body login" + body);
            console.log("==========================================")
	        console.log("Respuesta testLogin() - Email " + email + " Password " + pass);
	        console.log("--------------------------------------------------------");
            console.log("Test Login - " + email + ", " + pass + " Nivel -> " + JSON.parse(body).nivel + " OK");
            console.log("========================================== \n")
        } else {
            console.log(error)
            //console.log(response)
            //console.log(response.statusCode);
        } 
    });
}

function testModificarUsuario(old_email, new_email, new_pass){
    var options = {
        url:url + '/modificarUsuario/',
        method:'POST',
        form:{old_email:old_email,new_email:new_email,new_password:new_pass},
        headers:headers,
        qs:{'':''}
    }
    request.post(options, function(error, response, body){
       if(!error && response.statusCode == 200){
            console.log("==========================================")
	        console.log("Respuesta testModificar() - Email viejo " + old_email + " Email Nuevo " + new_email +  " Password nueva " + new_pass);
	        console.log("--------------------------------------------------------");
            //console.log("Body modificar" + body);
            console.log("Test Modificar - " + old_email + " to " + new_email + ' , Password ' + new_pass + " nModified -> " + JSON.parse(body).nModified + " OK");
            console.log("========================================== \n")
        } else {
            console.log(response.statusCode);
        } 
    });
}

function testEliminarUsuario(email,pass){
    var options = {
        url:url + '/eliminarUsuario/',
        method:'DELETE',
        form:{email:email,password:pass},
        headers:headers,
        qs:{'':''}
    }
    request(options, function(error, response, body){
       if(!error && response.statusCode == 200){
            console.log("==========================================")
	        console.log("Respuesta testEliminar() - Email " + email +  " Password " + pass);
	        console.log("--------------------------------------------------------");
            //console.log("Body elminar" + body);
            console.log("Test Eliminar - " + email + ' , Password ' + pass + " nModified -> " + JSON.parse(body).n + " OK");
            console.log("========================================== \n")
            testLogin(email,pass);
        } else {
            console.log("Error en eliminar")
            console.log(response.statusCode);
        } 
    });
}

function testSiguienteNivel(tiempo){
    console.log(url + '/nivelCompletado/' + id + '/' + tiempo);
    var options = {
        url:url + '/nivelCompletado/' + id + '/' + tiempo,
        method:'GET',
        headers:headers,
        qs:{'':''}
    }
    request(options, function(error, response, body){
       if(!error && response.statusCode == 200){
            //console.log("Body login" + body);
            console.log("==========================================")
	        console.log("Respuesta testSiguienteNivel() - Tiempo " + tiempo );
	        console.log("--------------------------------------------------------");
            console.log("Test Siguiente nivel - Nivel -> " + JSON.parse(body).nivel + " OK");
            console.log("========================================== \n")
        } else {
            //console.log(response);
            console.log(response.statusCode);
        } 
    });
}

function testObtenerResultados(){
    var options = {
        url:url + '/obtenerResultados/' + id,
        method:'GET',
        headers:headers,
        qs:{'':''}
    }
    request(options, function(error, response, body){
       if(!error && response.statusCode == 200){
            //console.log("Body login" + body);
            console.log("==========================================")
	        console.log("Respuesta testObtenerResultados() - id " + id );
	        console.log("--------------------------------------------------------");
            console.log("Test Obtener resultados - Numero de resultados -> " + JSON.parse(body).length + " OK");
            console.log("========================================== \n")
        } else {
            //console.log(response);
            console.log(response.statusCode);
        } 
    });
}


testRaiz();


testCrearUsuario("xemagg95@gmail.com","jose"); //Nombre que ya existe
testCrearUsuario("jose","jose"); //Nombre que ya esta en el limbo

testCrearUsuario("josemariagarcia95@gmail.com","jose"); //nombre que no existe

testConfirmarUsuario("jose",1480939237928)

testDatosJuego();

testLogin("xemagg95@gmail.com",""); //sin contrasena - no devuelve nada
testLogin("juan",undefined); //sin contrasena (caso de que hay una cookie) devuelve user
testLogin("pepe","pepe"); // contrasena buena - devuelve user

testModificarUsuario("josem","joseM","");
testModificarUsuario("dani","dani","dani1");


testEliminarUsuario("jose2","jose2");

testSiguienteNivel(666);
testObtenerResultados();


