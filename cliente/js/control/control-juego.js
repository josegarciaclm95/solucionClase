//************************//
// En este fichero se encuentra la lógica relacionada con el control del cliente: comprobación de cookies,
// llamadas al servidor (a través de Proxy), métodos de fin del juego, configuración del audio, etc.
//************************//

function inicio() {
    if ($.cookie('email') != undefined) {
        proxy.comprobarUsuarioMongo($.cookie('email'), undefined, true)
    } else if (typeof $.cookie('visitado') === 'undefined') {
        console.log("No hay una cookie");
        construirLogin();
        $(function(){
            $("#footer").append('<p id="warning" style="color:#FF0000; font-weight: bold;">¿Es la primera vez que entras aquí? Echa un vistazo a nuestro aviso legal en la barra superior </p>');
        });
        $.cookie("visitado", 1);
    } else {
        console.log("Has estado aqui antes");
    }
}

function limpiarMongo() {
    $.getJSON('/limpiarMongo/', function (datos) {
        console.log("Coleccion vacia");
        console.log(datos);
    });
}

function nivelCompletado(tiempo,vidas) {
    $('#juegoId').append("<h2 id='enh'>¡Enhorabuena!</h2>");
    proxy.nivelCompletado(tiempo,vidas);
    proxy.obtenerResultados();
}

//Funciones de comunicación
/**
 * Registramos al usuario
 * @param user_name - nombre de usuario (nick)
 * @param nombre - email validado
 * @param pass - contrasena introducida
 */
function crearUsuario(user_name, email, pass) {
    console.log(user_name + " - " + email + " - " + pass);
    if (user_name == "") {
        user_name = "jugador";
    }
    var url = '';
    //url = "http://localhost:1338"
    url = "https://juegoprocesos.herokuapp.com";
    proxy.crearUsuario(user_name, email, pass, url);
    
}

function modificarUsuarioServer(user_name, email, pass) {
    proxy.modificarUsuario(user_name, email, pass);
}

function eliminarUsuarioServer(nombre, pass) {
    proxy.eliminarUsuario(nombre,pass);
}

/**
 * Borramos la cookie que hubiera en el navegador
 */
function borrarCookies() {
    $.removeCookie('user_name');
    $.removeCookie('email');
    $.removeCookie('id');
    $.removeCookie('nivel');
    $.removeCookie('maxNivel');
}

function setCookies(data) {
    $.cookie('user_name', data.user_name);
    $.cookie('email', data.email);
    $.cookie('id', data.id);
    $.cookie('nivel', data.nivel);
    $.cookie('maxNivel', data.maxNivel);
}

function finJuego(text,callback){
    $("#gameMusic").animate({volume:0},1000);
    $('#juegoId').append("<h2 id='enh'>"+text+"</h2>");
    $('#control').append('<button type="button" id="volverBtn" class="btn btn-primary btn-md" style="margin-top:5px; margin-left:5px;">Volver a empezar</button>')
    $('#volverBtn').on('click', function () {
        $(this).remove();
        $('#datos, #prog, #cerrarSesBtn').remove();
        callback();
    });
}

function cambiarUsuario(action){
    eval("construirFormulario"+action+"()")
}

function apagarMusica(){
    $("audio").animate({volume:0},100);
    $("#sonido").addClass("active");
    $("#sonidoControl").off("click");
    $("#sonidoControl").on("click", encenderMusica);
}

function encenderMusica(){
    $("audio").animate({volume:1},100);
    $("#sonido").removeClass("active");
    $("#sonidoControl").off("click");
    $("#sonidoControl").on("click", apagarMusica);
}
