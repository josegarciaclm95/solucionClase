var request = require("request");
//var sleep = require("sleep");
//var url = "http://localhost:1338";
var url = "https://juegoprocesos.herokuapp.com";
/***********************IMPORTANTEEEEEEEEEEEEEEEEEEEEEEEE************************** */
var id = "581e3b2e6a4d870011c7295f"
/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^SETEALOOOOOOOOOOOOOO^^^^^^^^^^^^^^^^^^^^^^^^*/

var headers = {
    "User-Agent":'Super Agent/0.0.1',
    "Content-Type":'application/x-www-form-urlencoded'
}

console.log("==============================================")
console.log(" Inicio de las pruebas del API REST:" + url);
console.log(" 1. Crear usuario - 2. Traer datos de juego");
console.log(" 3. Login de usuario (existente/inexistente)");
console.log(" 4. Modificar usuario - 5. Eliminar usuario");
console.log(" 6. El usuario no puede iniciar sesión");
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
            console.log("Test crearUsuario - " + email + ", " + pass + " Nivel -> " + JSON.parse(body).nivel + " OK");
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
            console.log(response.statusCode);
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
        method:'POST',
        form:{email:email,password:pass},
        headers:headers,
        qs:{'':''}
    }
    request.post(options, function(error, response, body){
       if(!error && response.statusCode == 200){
            console.log("==========================================")
	        console.log("Respuesta testEliminar() - Email " + email +  " Password " + pass);
	        console.log("--------------------------------------------------------");
            //console.log("Body elminar" + body);
            console.log("Test Eliminar - " + email + ' , Password ' + pass + " nModified -> " + JSON.parse(body).n + " OK");
            console.log("========================================== \n")
            testLogin(email,pass);
        } else {
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

testCrearUsuario("dani","dani"); //Nombre que ya existe
testCrearUsuario("pac22","paco"); //nombre que no existe

testDatosJuego();

testLogin("jose",undefined); //sin contrasena (caso de que hay una cookie) devuelve user
testLogin("jose",""); //sin contrasena - no devuelve nada
testLogin("jose","jose"); // contrasena buena - devuelve user

testModificarUsuario("jose","joseM","");
testModificarUsuario("dani","dani","dani1");

testEliminarUsuario("jose2","jose2");

testSiguienteNivel(666);
testObtenerResultados();