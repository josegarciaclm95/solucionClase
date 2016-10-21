//Funciones que modifican el index
var sora = undefined;
var maxVida = undefined;
var usuarioDevuelto = undefined;
//var url = "https://juegoprocesos.herokuapp.com/";
//var url = "http://localhost:1338/";
/**
 * Si hay alguna cookie establecida, leemos los datos asociados a ella del servidor. Si no, partimos de cero (pedimos nombre).
 * CAUTION!! En estos momentos no es necesario, pero si hubiera varios clientes (app movil Android, app movil iOS)
 * entonces cabría la posibilidad de que se hubiera avanzado en otro sitio y habría que mantener la información actualizada
 */
function inicio() {
    if ($.cookie('nombre') != undefined) {
        comprobarUsuario();
    } else {
        console.log("No hay una cookie");
        mostrarCabecera();
    }
}

function mierdaPrueba() {
    $.getJSON('/mierdaPrueba/', function (datos) {
        console.log(datos);
        a = "nivel1";
	    console.log(datos.nivel1.platforms);
        for (p in datos[a].platforms){
            console.log(datos.nivel1.platforms[p]);
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
 * Hacemos visible el cuadro de texto de escribir el nombre y llamamos al método que crea el boton de Empezar
 */
function mostrarCabecera() {
    $("#cabecera").remove();
    $("#control").append('<div id="cabecera"><input type="text" id="nombre" placeholder="Introduce tu nombre"></div> ');
    $("#nombre").on("keyup", function (e) {
        if (e.keyCode == 13) {
            SetGame();
        }
    })
    botonNombre();
}

/**
 * Añadimos el botón de Empezar
 */
function botonNombre() {
    $("#cabecera").append('<button type="button" id="nombreBtn" class="btn btn-primary btn-md" style="margin-left:5px">Enviar</button>');
    $("#nombreBtn").on("click", function () {
        SetGame();
    });
}

/**
 * Eliminamos el boton de Empezar, añadimos el cuadro en el que se insertará el juego, llamaremos a crearUsuario y vaciamos el cuadro
 * de texto
 * @constructor
 */
function SetGame() {
    $("#nombreBtn").remove();
    $("#juegoContainer").append('<div id="juegoId"></div>');
    crearUsuario($("#nombre").val());
    $("#nombre").val('');
}

/**
 * Pedimos info de jugador al servidor y la presentamos en el Panel de control usando jQuery
 * @param jugador
 */
/*
function mostrarInfoJuego(jugador){
    sora = jugador;
    maxVida = sora.vidas;
    var infoJuegoHtml = '';
    infoJuegoHtml += '<ul><li><span class="infoPersonaje">Nombre</span></li>';
    infoJuegoHtml += '<li id="nombreJug"><span class="normal">' + sora.nombre + '</span></li>';
    infoJuegoHtml += '<li><span class="infoPersonaje">Vidas</span></li>';
    infoJuegoHtml += '<ul class="vidas" id="vidasJug">';
    for(var i = 0; i <sora.vidas ; i++){
        infoJuegoHtml += '<li><img style="height:40px; width:40px" src="./assets/live.png"></li>';
    }
    infoJuegoHtml += '</ul>';
    infoJuegoHtml += '<li><span class="infoPersonaje">Puntuación</span></li>';
    infoJuegoHtml += '<li id="puntosJug"><span class="normal">0</span></li>';
    infoJuegoHtml += '</ul>';
    $('#infoJuego').append(infoJuegoHtml);
}
*/

/**
 * Haciendo uso de una cookie previa, presentamos la info del jugador (tras haber actualizado la cookie)
 */
function mostrarInfoJuego2() {
    maxVida = $.cookie("vidas");
    var infoJuegoHtml = '';
    infoJuegoHtml += '<ul><li><span class="infoPersonaje">Nombre</span></li>';
    infoJuegoHtml += '<li id="nombreJug"><span class="normal">' + $.cookie("nombre") + '</span></li>';
    infoJuegoHtml += '<li><span class="infoPersonaje">Vidas</span></li>';
    infoJuegoHtml += '<ul class="vidas" id="vidasJug">';
    for (var i = 0; i < maxVida; i++) {
        infoJuegoHtml += '<li><img style="height:40px; width:40px" src="./assets/live.png"></li>';
    }
    infoJuegoHtml += '</ul>';
    infoJuegoHtml += '<li><span class="infoPersonaje">Puntuación</span></li>';
    infoJuegoHtml += '<li id="puntosJug"><span class="normal">0</span></li>';
    infoJuegoHtml += '</ul>';
    $('#infoJuego').append(infoJuegoHtml);
    siguienteNivel();
}

/**
 * Si habia una cookie previa, se llamara a este método para añadir un botón de siguiente nivel. Este refrescará el juego donde
 * se quedó el jugador
 */
function siguienteNivel() {
    $("#control").append('<button type="button" id="siguienteBtn" class="btn btn-primary btn-md" style="margin-top:5px">Siguiente nivel</button>');
    $("#siguienteBtn").on("click", function () {
        $(this).remove();
        $("#juegoId").remove();
        $("#enh").remove();
        $("#juegoContainer").append('<div id="juegoId"></div>');
        crearNivel($.cookie("nivel"));
    });
}
/**
 * Modifica la info de juego de la página
 * @param score
 */
function actualizarPuntuacion(score) {
    $("#puntosJug").contents().text(score);
}

/**
 * Elimina o añade corazones según el usuario ha cogido vida
 * @param vida
 */
function actualizarVida(vida) {
    console.log(vida + " , " + sora.vidas + " , " + maxVida);
    if (vida > 0) {
        for (var i = 0; i < vida && i <= maxVida; i++) {
            $('#vidasJug').append('<img style="height:40px; width:40px" src="./assets/live.png">');
            //sora.vidas += 1;
        }
    } else {
        if (vida < 0) {
            console.log("Vida negativa");
            for (var i = 0; i < -vida && sora.vidas >= 0; i++) {
                $("#vidasJug li").first().remove();
                console.log("Eliminado corazon");
                sora.vidas -= 1;
            }
        }
    }

}

function nivelCompletado(tiempo) {
    //game.destroy();
    game.destroy();
    $('#juegoId').append("<h2 id='enh'>Enhorabuena!</h2>");
    //comunicarNivelCompletado(tiempo);
    //obtenerResultados();
}

//Funciones de comunicación
/**
 * Seteamos la cookie inicial.
 * @param nombre
 */
function crearUsuario(nombre) {
    if (nombre == "") {
        nombre = "jugador";
    }
    $.getJSON('/crearUsuario/' + nombre, function (datos) {
        //Datos será un objeto Usuario
        console.log("Datos recibidos en getJSON");
        //juego = datos;
        usuarioDevuelto = datos;
        crearJuego();
        console.log(datos);
        $.cookie('nombre', datos.nombre);
        $.cookie('id', datos.id);
        $.cookie('nivel', datos.nivel);
        $.cookie('vidas', datos.vidas);
        //mostrarInfoJuego(juego.usuarios[juego.usuarios.length -1]);
        mostrarInfoJuego2();
    });
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
function mostrarResultados() {
    var resultadosJuego = undefined;
    var resultJuegoHtml = "Hola mundo";
    //Prueba con otro método
    $.ajax({
        url: '/resultados/',
        dataType: 'json',
        async: false,
        success: function (data) {
            resultadosJuego = data;
        }
    });
    for (var key in resultadosJuego) {
        if (resultadosJuego.hasOwnProperty(key)) {
            resultJuegoHtml += key + " - " + resultadosJuego[key] + "<br/>";
        }
    }
    $("#resultadosContainer").append(resultJuegoHtml);
}

/**
 * Si hay alguna cookie, comprobamos que el usuario sigue existiendo. Si no existe, borramos la cookie y partimos como
 * cuando no hay cookie inicialmente. Si hay cookie, refrescamos sus datos por si hubieran cambiado.
 */
function comprobarUsuario() {
    var id = $.cookie("id");
    console.log("Comprobando un usuario");
    $.getJSON('/comprobarUsuario/' + id, function (datos) {
        if (datos.nivel < 0) {
            console.log("El usuario no existe");
            borrarCookies();
            mostrarCabecera();
        } else {
            console.log("Actualizamos nivel de cookie");
            $.cookie("nivel", datos.nivel);
            $.cookie("vidas", datos.vidas);
            mostrarInfoJuego2();
        }
    });
}

/**
 * Borramos la cookie que hubiera en el navegador
 */
function borrarCookies() {
    $.removeCookie('nombre');
    $.removeCookie('id');
    $.removeCookie('nivel');
    $.removeCookie('vidas');
}