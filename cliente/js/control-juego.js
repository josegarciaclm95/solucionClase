//Funciones que modifican el index
var vidas = undefined;
var usuarioDevuelto = undefined;

var urlD = "https://juegoprocesos.herokuapp.com";
//var urlD = "http://localhost:1338";
/**
 * Si hay alguna cookie establecida, leemos los datos asociados a ella del servidor. Si no, partimos de cero (pedimos nombre).
 * CAUTION!! En estos momentos no es necesario, pero si hubiera varios clientes (app movil Android, app movil iOS)
 * entonces cabría la posibilidad de que se hubiera avanzado en otro sitio y habría que mantener la información actualizada
 */

/**
 * Libreria sendGrid - proveedor de correo
 * nodemailer + sendgrid
 * En el signup, en lugar de meter el usuario hacemos una confirmación de correo.
 * Tenemos una coleccion limbo
 * Metemos el usuario en limbo
 * fabricamos un mail
 * metemos lo de loly crypto  en un fichero y exportamos ese codigo como funciones encrypt y un decrypt
 * En el node-express importamos el modulo crypto
 * Al meter en el limbo tiene que ir ya la password cifrada
 */

function inicio() {
    if ($.cookie('nombre') != undefined) {
        comprobarUsuarioMongo($.cookie('nombre'), undefined, true);
    } else {
        console.log("No hay una cookie");
        construirLogin();
    }
}
/**
 * Definir una funcion para las llamadas de AJAX que reciba el tipo de llamada, el cuerpo, y el callback en caos de exito 
 */

function limpiarMongo() {
    $.getJSON('/limpiarMongo/', function (datos) {
        console.log("Coleccion vacia");
        console.log(datos);
    });
}

function mierdaPrueba() {
    $.getJSON('/resultados/', function (datos) {
        console.log(JSON.stringify(datos));
        for (p in datos) {
            console.log(datos[p].user);
        }
    });
}

function nivelCompletado(tiempo) {
    game.destroy();
    $("#gameMusic").animate({volume:0},1000,function(){
        $(this).remove();
    });
    $('#juegoId').append("<h2 id='enh'>Enhorabuena!</h2>");
    var callbackNivelCompletado = function(datos){
        $.cookie("nivel", datos.nivel);
        mostrarInfoJuego2();
    }
    peticionAjax("GET","/nivelCompletado/"+$.cookie("id")+"/"+tiempo,true,{},callbackNivelCompletado);
    //comunicarNivelCompletado(tiempo);
    var callbackObtenerResultados = function(datos){
        console.log("Callback de obtener resultados con " + datos);
        mostrarResultadosUsuario(datos);
    }
    peticionAjax("GET","/obtenerResultados/"+$.cookie("id"),true,{},callbackObtenerResultados);
    //obtenerResultados();
}

function mostrarResultadosUsuario(datos) {
    console.log("Mostrar resultados con parametros")
    $('#res').remove();
    $('#resultados').remove();
    $('#juegoId').append('<h3 id="res">Resultados</h3>');
    var cadena = "<table id='resultados' class='table table-bordered table-condensed'><tr><th>Nombre</th><th>Nivel</th><th>Tiempo</th></tr>";
    for (var i = 0; i < datos.length; i++) {
        cadena = cadena + "<tr><td>" + $.cookie("nombre") + "</td><td> " + datos[i].nivel + "</td>" + "</td><td> " + datos[i].tiempo + "</td></tr>";
    }
    cadena = cadena + "</table>";
    $('#juegoId').append(cadena);
}

//Funciones de comunicación
/**
 * Seteamos la cookie inicial.
 * @param nombre
 */
function crearUsuario(nombre, pass) {
    if (nombre == "") {
        nombre = "jugador";
    }
    var callback = function(data){
        $.loadingBlockHide();
        if (data.result == "userExists") {
            estilosAlerta('#estilosAlerta');
            //$('#nombreUsuario').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
            $('#nombreUsuario').val('Usuario existente');
        } else {
            //setCookies(data);
            $("#formRegistro").remove();
            $("#juegoContainer").prepend('<span id="warning" style="color:#FF0000; font-weight: bold;">Confirma tu correo!!!</span>');
        }
    }
    var url = window.location.href;
    //url = url.slice(0, url.length - 10);
    url = "http://localhost:1338"
    //url = "http://juegoprocesos.herokuapp.com";
    peticionAjax("POST","/crearUsuario/",true,JSON.stringify({ email:nombre, password:pass,url:url }),callback);
}

function modificarUsuarioServer(nombre, pass) {
    var callback = function(data){
        if (data.nModified != 1) {
           $('#nombreUsuario').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
           $('#nombreUsuario').val('Usuario existente');
        } else {
            $("#juegoContainer").prepend('<span id="warning" style="color:#04B404">Yay!!! Todo ha ido bien</span>');
            $("#formRegistro").remove();
            borrarSiguienteNivel();
            resetControl();
        }
    }
    peticionAjax("POST","/modificarUsuario/",true,
        JSON.stringify({ old_email: $.cookie('nombre'), new_email: nombre, new_password: pass }),callback);
}

function eliminarUsuarioServer(nombre, pass) {
    var callback = function(data){
        if (data.n != 1) {
                $('#nombreUsuario').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
                $('#nombreUsuario').val('Error al borrar. Comprueba que usuario y contraseña son correctos');
            } else {
                $("#formRegistro").remove();
                borrarSiguienteNivel();
                resetControl();
            }
    }
    peticionAjax("DELETE","/eliminarUsuario/",true,JSON.stringify({ email: nombre, password: pass }),callback);
}
/**
 * Enviamos el score del jugador al servidor
 * @param puntos
 */
function salvarPuntuacion(puntos) {
    $.getJSON('/puntuaciones/' + usuarioDevuelto.nombre + '/' + puntos, function (datos) {
        usuarioDevuelto = datos;
        console.log("Puntuacion guardada");
    });
}

/**
 * Mostramos los resultados de los que tiene registro el servidor
 */
function auxiliar(){
    var d;
    $.ajax({
        url: '/resultados/',
        dataType: 'json',
        async: false,
        success: function (data) {
            d = data;
        }
    });
    return d;
}

function comprobarUsuarioMongo(nombre, pass, fromCookie) {
    if (pass == "" && !fromCookie) {
        estilosAlerta('#claveL')
    } else {
        var callback = function(data){
            if (data.nivel == -1) {
                console.log("No hay nada");
                //resetControl();
                borrarCookies();
                loginIncorrecto();
            } else {
                setCookies(data);
                borrarLogin();
                mostrarInfoJuego2();
            }
        }
        peticionAjax("POST","/login/",true,JSON.stringify({email: nombre, password: pass}),callback);
    }
}

function meterEnColeccion(email,pass,col){
    peticionAjax("POST","/meterEn"+col+"/",true,JSON.stringify({email: email, password: pass}), function(data){
        console.log(data);
    })
}

function borrarLogin() {
    $("#login").remove();
    $("#loginBtn").remove();
}
/**
 * Borramos la cookie que hubiera en el navegador
 */
function borrarCookies() {
    $.removeCookie('nombre');
    $.removeCookie('id');
    $.removeCookie('nivel');
    $.removeCookie('vidas');
    $.removeCookie('maxNivel');
}

function setCookies(data) {
    $.cookie('nivel', data.nivel);
    $.cookie("vidas", data.vidas);
    $.cookie('nombre', data.nombre);
    $.cookie('id', data.id);
    $.cookie('maxNivel', data.maxNivel);
}

function finJuego(text,callback){
    $("#gameMusic").animate({volume:0},1000);
    $('#juegoId').append("<h2 id='enh'>"+text+"</h2>");
    $('#control').append('<button type="button" id="volverBtn" class="btn btn-primary btn-md">Volver a empezar</button>')
    $('#volverBtn').on('click', function () {
        $(this).remove();
        $('#datos').remove();
        $('#prog').remove();
        callback();
    });
}

function resetControl() {
    borrarCookies();
    $("#control").empty();
    $("#modificar").hide();
    $("#eliminar").hide();
    construirLogin();
}

function cambiarUsuario(action){
    if ($.cookie('nombre') != undefined) {
        eval("construirFormulario"+action+"()")
    } else {
        avisoLogin();
    } 
}

function avisoLogin(){
    $("#juegoContainer").empty();
    $("#juegoContainer").append('<span style="color:#FF0000">Tienes que logearte primero!!</span>');
}

function peticionAjax(peticion,url,async,body,successCallback){
     $.ajax({
            type: peticion,
            contentType: "application/json",
            async:async,
            url: urlD + url,
            data: body,
            success: successCallback
     });
}