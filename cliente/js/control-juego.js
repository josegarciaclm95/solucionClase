//Funciones que modifican el index
var vidas = undefined;
var maxVidas = undefined;
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
 * Haciendo uso de una cookie previa, presentamos la info del jugador (tras haber actualizado la cookie)
 */
function mostrarInfoJuego2() {
    maxVida = $.cookie("vidas");
    vidas = $.cookie("vidas");
    var nombre=$.cookie("nombre");
	var id=$.cookie("id");
	var nivel=$.cookie("nivel");
	var percen=Math.floor((nivel/3)*100);
	$('#datos').remove();
	$('#cabeceraP').remove();
	$('#cabecera').remove();
	$('#prog').remove();
	$('#control').append('<div id="cabecera"><h2>Panel</h2></div>')
	$('#control').append('<div id="datos"><h4>Nombre: '+nombre+'<br />Nivel: '+nivel+'</h4></div>');
	$('#control').append('<div class="progress" id="prog"><div class="progress-bar" aria-valuemin="0" aria-valuemax="100" style="width:'+percen+'%">'+percen+'%</div></div>');
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
		$('#res').remove();
  		$('#resultados').remove();
        $("#juegoContainer").append('<div id="juegoId"></div>');
        crearNivel($.cookie("nivel"));
    });
}

function nivelCompletado(tiempo) {
    //game.destroy();
    game.destroy();
    $('#juegoId').append("<h2 id='enh'>Enhorabuena!</h2>");
    comunicarNivelCompletado(tiempo);
    obtenerResultados();
}

function comunicarNivelCompletado(tiempo){
	var id=$.cookie("id");
	$.getJSON('/nivelCompletado/'+id+"/"+tiempo,function(datos){
			$.cookie("nivel",datos.nivel);
			mostrarInfoJuego2();
	});	
}

function obtenerResultados(){
	var id=$.cookie("id");
	$.getJSON('/obtenerResultados/'+id,function(datos){
			//$.cookie("nivel",datos.nivel);
			mostrarResultados(datos);
	});
}

function mostrarResultados(datos){
  //eliminarGame();
  //eliminarCabeceras();
  $('#res').remove();
  $('#resultados').remove();
  $('#juegoId').append('<h3 id="res">Resultados</h3>');
  var cadena="<table id='resultados' class='table table-bordered table-condensed'><tr><th>Nombre</th><th>Nivel</th><th>Tiempo</th></tr>";
    for(var i=0;i<datos.length;i++){
      cadena=cadena+"<tr><td>"+datos[i].nombre+"</td><td> "+datos[i].nivel+"</td>"+"</td><td> "+datos[i].tiempo+"</td></tr>";      
    }
    cadena=cadena+"</table>";
    $('#juegoId').append(cadena);
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
        //crearJuego();
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
        if (datos.nivel < 1) {
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

function noHayNiveles(){
	$('#juegoId').append("<h2 id='enh'>Lo siento, no tenemos más niveles</h2>");
	$('#control').append('<button type="button" id="siguienteBtn" class="btn btn-primary btn-md">Volver a empezar</button>')
	$('#siguienteBtn').on('click',function(){
		$('#siguienteBtn').remove();
		reset();
	});
}

function reset(){
	borrarCookies();
	mostrarCabecera();
}