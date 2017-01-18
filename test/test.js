var request = require("request");
var colors = require('colors');

var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}


//var sleep = require("sleep");
//var urlD = "http://localhost:1338";
var urlD = "https://juegoprocesos.herokuapp.com";
/***********************IMPORTANTEEEEEEEEEEEEEEEEEEEEEEEE************************** */
var id;
var tiempoConfir;
var maxNiveles;
/***********************IMPORTANTEEEEEEEEEEEEEEEEEEEEEEEE************************** */

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
    "User-Agent": 'Super Agent/0.0.1',
    "Content-Type": 'application/x-www-form-urlencoded'
}

console.log("==============================================".rainbow)
console.log(" Inicio de las pruebas del API REST:" + urlD);
console.log(" 1. Crear usuario (email existente en limbo/emial existente en usuarios/email nuevo)");
console.log(" 2. Confirmar usuario");
console.log(" 3. Traer datos de juego");
console.log(" 4. Login de usuario (existente/inexistente/inicio por cookies)");
console.log(" 5. Modificar usuario (usuario no existe/cambiar nombre/cambiar contraseña)");
console.log(" 6. Eliminar usuario e intentar loguear después");
console.log(" 7. Simular que juega todos los niveles, que vuelve a empezar y comprobar resultados");
console.log("============================================== \n".rainbow)

/*****************************************AUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUXILIARES */

function peticionAjax(peticion, url, async, body, successCallback) {
    var options = {
        url: urlD + url,
        method: peticion,
        form: body,
        headers: headers,
        qs: {
            '': ''
        }
    }
    request(options, successCallback);

}

function preparacionPruebas() {

    var callbackPepe = function () {
        peticionAjax("POST", "/meterEnUsuarios/", true, {
            email: "pepe",
            password: "pepe",
            activo: true
        }, function (data) {
            testRaiz();
            /*
            testCrearUsuario("xemagg95@gmail.com","jose"); //Nombre que ya existe
            testCrearUsuario("jose","jose"); //Nombre que ya esta en el limbo
            testCrearUsuario("josemariagarcia95@gmail.com","jose"); //nombre que no existe
            testConfirmarUsuario("jose", tiempoConfir) //confirmar usuario
            testConfirmarUsuario("pedro",45716);
            */
            testDatosJuego(); //Aqui traemos los datos de un nivel y simulamos el juego entero
            
            /*
            testLogin("xemagg95@gmail.com",""); //sin contrasena - no devuelve nada
            testLogin("juan",undefined); //sin contrasena (caso de que hay una cookie) devuelve user
            testLogin("pepe","pepe"); // contrasena buena - devuelve user
            */
            //testModificarUsuario("josem2","joseM",""); //cambio de usuario que no existe
            //testModificarUsuario("josem","joseM",""); //cambio de usuario que existe (nombre)
            //testModificarUsuario("dani","dani","dani1"); //cambio de usuario que existe (contraseña)
            //testEliminarUsuario("jose31","jose2"); //eliminar usuario que no existe
            //testEliminarUsuario("jose2","jose2"); //eliminar usuario que no existe
        })
    }

    var callbackJuan = function () {
        peticionAjax("POST", "/meterEnUsuarios/", true, {
            email: "juan",
            password: "juan",
            activo: true
        }, callbackPepe);
    }
    var callbackJose2 = function () {
        peticionAjax("POST", "/meterEnUsuarios/", true, {
            email: "jose2",
            password: "jose2",
            activo: true
        }, callbackJuan);
    }
    var callbackDani = function () {
        peticionAjax("POST", "/meterEnUsuarios/", true, {
            email: "dani",
            password: "dani",
            activo: true
        }, callbackJose2);
    }
    var callbackJoseM = function (error, response, body) {
        console.log(body);
        tiempoConfir = JSON.parse(body).tiempo;
        console.log(tiempoConfir);
        peticionAjax("POST", "/meterEnUsuarios/", true, {
            email: "josem",
            password: "jose",
            activo: true
        }, callbackDani);
    }
    var callbackJose = function (error, response, body) {
        id = JSON.parse(body).id;
        maxNiveles = JSON.parse(body).maxNivel;
        peticionAjax("POST", "/meterEnUsuarios/", true, {
            email: "jose",
            password: "jose",
            activo: false
        }, callbackJoseM);
    }
    var callbackXema = function () {
        peticionAjax("POST", "/meterEnUsuarios/", true, {
            email: "xemagg95@gmail.com",
            password: "jose",
            activo: true
        }, callbackJose);
    }
    peticionAjax("GET", "/limpiarMongo/", true, {}, callbackXema);

}

/*****************************************FIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIN DE AUXILIARES */

function testRaiz() {
    var options = {
        url: urlD,
        method: 'GET',
        headers: headers,
        qs: {
            '': ''
        }
    }
    request(options, function (error, response, body) {
        console.log("==========================================")
        console.log("Respuesta testRaiz()");
        console.log("--------------------------------------------------------");
        if (!error && response.statusCode == 200) {
            console.log("Test Raiz OK".green);
        } else {
            console.log("Test Raiz ERROR".red);
            console.log(error)
        }
        console.log("========================================== \n")
    });
}

function testCrearUsuario(email, pass) {
    var options = {
        url: urlD + '/crearUsuario/',
        method: 'POST',
        form: {
            email: email,
            password: pass,
            url: urlD
        },
        headers: headers,
        qs: {
            '': ''
        }
    }
    request.post(options, function (error, response, body) {
        var result = JSON.parse(body).result;
        console.log("========================================== ")
        console.log("Respuesta testCrearUsuario() con datos - Email " + email + " Password " + pass);
        console.log("--------------------------------------------------------");
        console.log("Test crearUsuario - " + email + ", " + pass + " Resultado -> " + result);
        if (!error && response.statusCode == 200) {
            if (result == "userExists") {
                console.log("Test crearUsuario INCORRECTO. Usuario existe".green);
            } else if (result == "EmailNotSent") {
                console.log("Test crearUsuario INCORRECTO. Fallo el envio del email".green);
            } else if (result == "insertOnUsuarios") {
                console.log("Test crearUsuario CORRECTO. Usuario pendiente de confirmar. Confirme mail".green);
            }
        } else {
            console.log("Test crearUsuario ERROR".red);
            console.log(response.statusCode);
            console.log(error)
        }
        console.log("========================================== ")
    });
}

function testConfirmarUsuario(email, id) {
    var options = {
        url: urlD + '/confirmarCuenta/' + email + '/' + id,
        method: 'GET',
        headers: headers,
        qs: {
            '': ''
        }
    }
    request(options, function (error, response, body) {
        console.log("========================================== ")
        console.log("Respuesta testConfirmarUsuario() con datos - Email " + email + " id " + id);
        console.log("--------------------------------------------------------");
        if (!error && response.statusCode == 200) {
            if (body.includes('id="welcome"')) {
                var output = "Test confirmarUsuario - " + email + ", " + id + " Resultado ->  OK";
                console.log(output.green);
            } else if (body.includes('id="bad-welcome"')) {
                var output = "Test confirmarUsuario - " + email + ", " + id + " Resultado ->  ERROR";
                console.log(output.green);
            } 
        } else {
            console.log("Test confirmarUsuario ERROR".red);
            console.log(response.statusCode);
            console.log(error)
        }
        console.log("========================================== \n")
    });
}

function testDatosJuego() {
    var options = {
        url: urlD + '/datosJuego/' + id,
        method: 'GET',
        headers: headers,
        qs: {
            '': ''
        }
    }
    request(options, function (error, response, body) {
        console.log("==========================================")
        console.log("Respuesta testDatosJuego()");
        console.log("--------------------------------------------------------");
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body).nivel;
            var output;
            if (result != -1) {
                output = "Test testDatosJuego - Nivel " + JSON.parse(body).nivel + " Numero de plataformas " + JSON.parse(body).platforms.length + " CORRECTO";
                console.log(output.green);
                testSimularJuego(314);
            } else {
                output = "Test testDatosJuego - Nivel " + JSON.parse(body).nivel + " Numero de plataformas " + JSON.parse(body).platforms.length + " INCORRECTO";
                console.log(output.green);
            }
        } else {
            console.log("Test testDatosJuego ERROR".red);
            console.log(response.statusCode);
            console.log(error)
        }
        console.log("========================================== \n")
    });
}

function testLogin(email, pass) {
    var options = {
        url: urlD + '/login/',
        method: 'POST',
        form: {
            email_name: email,
            password: pass
        },
        headers: headers,
        qs: {
            '': ''
        }
    }
    request.post(options, function (error, response, body) {
        console.log("==========================================")
        console.log("Respuesta testLogin() - Email " + email + " Password " + pass);
        console.log("--------------------------------------------------------");
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body).user_name;
            var output;
            if (result == "ERROR") {
                output = "Test Login - " + email + ", " + pass + "  INCORRECTO. USUARIO NO EXISTE/NO ACTIVO - CONTRASEÑA INCORRECTA";
                console.log(output.green);
            } else {
                output = "Test Login - " + email + ", " + pass + " CORRECTO";
                console.log(output.green);
            }
        } else {
            console.log("Test Login ERROR".red);
            console.log(response.statusCode);
            console.log(error)
        }
        console.log("========================================== \n")
    });
}

function testModificarUsuario(old_email, new_email, new_pass) {
    var options = {
        url: urlD + '/modificarUsuario/',
        method: 'POST',
        form: {
            old_email: old_email,
            new_email: new_email,
            new_password: new_pass
        },
        headers: headers,
        qs: {
            '': ''
        }
    }
    request.post(options, function (error, response, body) {
        console.log("==========================================")
        console.log("Respuesta testModificar() - Email viejo " + old_email + " Email Nuevo " + new_email + " Password nueva " + new_pass);
        console.log("--------------------------------------------------------");
        if (!error && response.statusCode == 200) {
            var nModified = JSON.parse(body).nModified;
            var ok = JSON.parse(body).ok;
            if (ok != 1) {
                var output = "Test Modificar ERROR. NO OK";
                console.log(output.red);
            } else if (nModified != 1) {
                var output = "Test Modificar INCORRECTO. NO SE HA REALIZADO MODIFICACIÓN";
                console.log(output.green);
            } else {
                var output = "Test Modificar CORRECTO. EMAIL VIEJO " + old_email + " - EMAIL NUEVO " + new_email + " - CONTRASEÑA NUEVA " + new_pass;
                console.log(output.green);
            }
        } else {
            console.log("Test Modificar ERROR".red);
            console.log(response.statusCode);
            console.log(error)
        }
        console.log("========================================== \n")
    });
}

function testEliminarUsuario(email, pass) {
    var options = {
        url: urlD + '/eliminarUsuario/',
        method: 'DELETE',
        form: {
            email: email,
            password: pass
        },
        headers: headers,
        qs: {
            '': ''
        }
    }
    request(options, function (error, response, body) {
        console.log("==========================================")
        console.log("Respuesta testEliminar() - Email " + email + " Password " + pass);
        console.log("--------------------------------------------------------");
        if (!error && response.statusCode == 200) {
            var n = JSON.parse(body).n;
            var ok = JSON.parse(body).ok;
            if (ok != 1) {
                var output = "Test Eliminar ERROR. NO OK";
                console.log(output.red);
            } else if (n != 1) {
                var output = "Test Eliminar INCORRECTO. NO SE HA REALIZADO LA ELIMINACIÓN. COMPRUEBA QUE EL USUARIO EXISTE";
                console.log(output.green);
            } else {
                var output = "Test Eliminar CORRECTO. EMAIL  " + email + " - CONTRASEÑA " + pass;
                console.log(output.green);
                testLogin(email, pass);
            }
        } else {
            console.log("Test Eliminar ERROR".red);
            console.log(response.statusCode);
            console.log(error)
        }
        console.log("========================================== \n")
    });
}

function testObtenerResultados() {
    var options = {
        url: urlD + '/obtenerResultados/' + id,
        method: 'GET',
        headers: headers,
        qs: {
            '': ''
        }
    }
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body).length;
            var output = "Test Obtener resultados - Numero de resultados -> " + result + " OK";
            console.log("Respuesta testObtenerResultados() - id " + id);
            console.log("--------------------------------------------------------");
            console.log(output.green);
            console.log("========================================== \n")
        } else {
            console.log("Test Obtener Resultados ERROR".red);
            console.log(response.statusCode);
            console.log(error)
        }
    });
}

preparacionPruebas();

var i = 0;

function testSimularJuego(tiempo) {
    var options = {
        url: urlD + '/nivelCompletado/' + id + '/' + tiempo + '/' + 5,
        method: 'GET',
        headers: headers,
        qs: {
            '': ''
        }
    }

    function callbackRequest(error, response, body) {
        if (!error && response.statusCode == 200) {
            var result = JSON.parse(body).nivel;
            console.log("==========================================")
            console.log("Respuesta testSimularJuego() - id " + id);
            if (result != -1) {
                var output = "Test Siguiente nivel - Nivel -> " + result + " CORRECTO";
                console.log(output.green);
                i++;
            } else {
                var output = "Test Siguiente nivel - Nivel -> " + result + " INCORRECTO";
                console.log(output.red);
            }
            if (i < maxNiveles) {
                testSimularJuego();
            } else {
                testObtenerResultados(tiempo);
                console.log("========================================== \n")
            }
        } else {
            console.log("Test Simular juego ERROR".red);
            console.log(error);
            console.log(response.statusCode);
        }
    }
    request(options, callbackRequest);
}