//Funciones que modifican el index
var vidas = undefined;
var usuarioDevuelto = undefined;

//var url = "https://juegoprocesos.herokuapp.com/";
//var url = "http://localhost:1338/";
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

/**
 * Borramos el elemento control (Panel de control)
 */
function borrarControl() {
    $("#control").remove();
}

/**
 * Haciendo uso de una cookie previa, presentamos la info del jugador (tras haber actualizado la cookie)
 */
function mostrarInfoJuego2() {
    vidas = $.cookie("vidas");
    var nombre = $.cookie("nombre");
    var id = $.cookie("id");
    var nivel = $.cookie("nivel");
    var percen = Math.floor(((nivel - 1) / $.cookie("maxNivel")) * 100);
    $('#datos').remove();
    $('#cabeceraP').remove();
    $('#cabecera').remove();
    $('#prog').remove();
    //$('#control').append('<div id="cabecera"><h2>Panel</h2></div>')
    $('#control').append('<div id="datos"><h4>Nombre: ' + nombre + '<br />Nivel: ' + nivel + '</h4></div>');
    $('#control').append('<div class="progress" id="prog"><div class="progress-bar progress-bar-success progress-bar-striped" aria-valuemin="0" aria-valuemax="100" style="width:' + percen + '%">' + percen + '%</div></div>');
    $("#registerGroup").remove();
    siguienteNivel();
}

/**
 * Si habia una cookie previa, se llamara a este método para añadir un botón de siguiente nivel. Este refrescará el juego donde
 * se quedó el jugador
 */
function siguienteNivel() {
    $("#control").append('<button type="button" id="siguienteBtn" class="btn btn-primary btn-md" style="margin-top:5px; margin-right:5px;">Siguiente nivel</button>');
    $("#control").append('<button type="button" id="cerrarSesBtn" class="btn btn-primary btn-md" style="margin-top:5px">Cerrar sesión</button>');
    $("#siguienteBtn").on("click", function () {
        $(this).remove();
        $("#cerrarSesBtn").remove();
        //$("#juegoId").remove();
        $("#enh").remove();
        $('#res').remove();
        $('#resultados').remove();
        $("#formRegistro").remove();
        $("#juegoContainer").empty();
        $("#juegoContainer").append('<div id="juegoId"></div>');
        $("#backMusic").animate({volume:0},1000);
        console.log("Nivel de cookie es ->" + $.cookie("nivel"));
        console.log("Llamamos a crear nivel sin parametros en siguienteNivel()");
        crearNivel();
    });
    $("#cerrarSesBtn").on("click", function () {
        $("#control").empty();
        resetControl();
    });
}

function borrarSiguienteNivel() {
    $("#siguienteBtn").remove();
    $("#cerrarSesBtn").remove();
    $('#datos').remove();
    $('#cabeceraP').remove();
    $('#cabecera').remove();
    $('#prog').remove();
}

function nivelCompletado(tiempo) {
    game.destroy();
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
        if (data.result == "userExists") {
            $('#nombreUsuario').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
            $('#nombreUsuario').val('Usuario existente');
        } else {
            //$("#formRegistro").remove();
            //setCookies(data);
            $("#juegoContainer").prepend('<span id="warning" style="color:#FF0000; font-weight: bold;">Confirma tu correo!!!</span>');
        }
    }
    var url = window.location.href;
    //url = url.slice(0, url.length - 10);
    url = "http://juegoprocesos.herokuapp.com"
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
                $('#nombreUsuario').val('Error en servidor');
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

function mostrarResultados() {
    var resultadosJuego = undefined;
    console.log("LLamamos a mostrar resultados");
    peticionAjax("GET","/resultados/",false,{},function(data){
        resultadosJuego = data;
    });
    $('#resultadosContainer').append('<h3 id="res">Resultados</h3>');
    var cadena = "";
    cadena += "<table id='resultados' class='table table-bordered table-condensed'>";
    cadena += "<tr><th colspan='4' style='text-align:center;'><img style='height:150px; width:150px' src='./assets/wall-fame.png'></th></tr>";
    cadena += "<tr><th style='text-align:center'>Nombre</th><th style='text-align:center'>Partida</th><th style='text-align:center'>Nivel</th><th style='text-align:center'>Tiempo</th></tr>";

    for (var i in resultadosJuego) {
        for (var j in resultadosJuego[i].resultados) {
            for (var z in resultadosJuego[i].resultados[j]){
                var date;
                if(z != "idJuego" && resultadosJuego[i].resultados[j][z] != -1){
                    cadena = cadena + "<tr><td>" + resultadosJuego[i].nombre + "</td><td>" + date +"</td><td> " + z.slice(-1) + "</td>" + "</td><td> " + resultadosJuego[i].resultados[j][z] + "</td></tr>";
                } else {
                    date = new Date(resultadosJuego[i].resultados[j][z]);
                    date = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes();
                }
            }
        }
    }
    cadena = cadena + "</table>";
    $('#resultadosContainer').append(cadena);
}

function comprobarUsuarioMongo(nombre, pass, fromCookie) {
    if (pass == "" && !fromCookie) {
        $('#claveL').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
    } else {
        var callback = function(data){
            if (data.nivel == -1) {
                    console.log("No hay nada");
                    borrarLogin();
                    resetControl();
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

/*
function loginIncorrecto(){
    $('#nombreL').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
    $('#claveL').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
    $("#nombreL").val('Usuario o contraseña incorrectos');
    $("#claveL").val('');
}*/

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

function noHayNiveles() {
    $('#juegoId').append("<h2 id='enh'>Lo siento, no tenemos más niveles</h2>");
    $('#control').append('<button type="button" id="volverBtn" class="btn btn-primary btn-md">Volver a empezar</button>')
    $('#volverBtn').on('click', function () {
        $('#volverBtn').remove();
        $('#datos').remove();
        $('#prog').remove();
        resetControl();
    });
}

function finDelJuego() {
    game.destroy();
    $('#juegoId').append("<h2 id='enh'>Lo siento,  has perdido :(</h2>");
    $('#control').append('<button type="button" id="finBtn" class="btn btn-primary btn-md">Volver a empezar</button>');
    $('#finBtn').on('click', function () {
        $('#finBtn').remove();
        $('#datos').remove();
        $('#prog').remove();
        mostrarInfoJuego2();
    });
}

function resetControl() {
    borrarCookies();
    $("#control").empty();
    //$("#juegoContainer").empty();
    construirLogin();
}

function modificarUsuario() {
    if ($.cookie('nombre') != undefined) {
        construirFormularioModificar();
    } else {
        avisoLogin();
    }
}

function eliminarUsuario() {
    if ($.cookie('nombre') != undefined) {
        construirFormularioEliminar();
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
            url: url,
            data: body,
            success: successCallback
     });
}