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
        comprobarUsuarioMongo($.cookie('nombre'),undefined);
    } else {
        console.log("No hay una cookie");
        mostrarLogin();
    }
}

function limpiarMongo(){
    $.getJSON('/resultados/', function (datos) {
        console.log("Coleccion vacia");
    });
}
function mostrarLogin(){
    $("#login").remove();
    var form = "";
    form += '<form><div class="form-group" id="login"><input type="text" class="form-control" id="nombreL" placeholder="Introduce tu nombre"><input type="password" class="form-control" id="claveL" placeholder="Introduce tu clave"></div>';
    form += '<button type="button" id="loginBtn" class="btn btn-primary btn-md" style="margin-bottom:10px">Entrar</button>';
    form += '<div id="registerGroup" class="form-group" style="margin-bottom:0px"><label for="register">¿Eres nuevo? Regístrate</label><br/>';
    form += '<button type="button" id="registrBtn" class="btn btn-primary btn-md">Registrar</button></div></form>';
    $("#control").append(form);
    
    $("#nombreL").on("keyup", function (e) {
        if (e.keyCode == 13) {
            console.log($("#nombreL").val() + " - " + $("#claveL").val());
            comprobarUsuarioMongo($("#nombreL").val(),$("#claveL").val());
        }
    });
    $("#nombreL,#claveL").on("focus", function (e) {
        $(this).removeAttr("style");
    });
    $("#loginBtn").on("click",function(e){
        console.log($("#nombreL").val() + " - " + $("#claveL").val());
        comprobarUsuarioMongo($("#nombreL").val(),$("#claveL").val());
    });
    $("#registrBtn").on("click",function(e){
        mostrarFormularioRegistro();
    });
}

function mostrarFormularioRegistro(){
    var form = "";
    $("#registerGroup").remove();
    form = '<form id="formRegistro"><div class="form-group"><label for="nombreUsuario">Nombre de usuario:</label>';
    form += '<input type="text" class="form-control" id="nombreUsuario"></div>';
    form += '<div class="form-group"><label for="password1">Contraseña</label>';
    form += '<input type="password" class="form-control" id="password1"></div>';
    form += '<div class="form-group"><label for="password2">Repite la contraseña</label>';
    form += '<input type="password" class="form-control" id="password2"></div>';
    form += '<button type="button" id="confirmaRegBtn" class="btn btn-primary btn-md" style="margin-bottom:10px">Regístrame</button>';
    $("#juegoContainer").append(form);
    $("#password1,#password2,#nombreUsuario").on("focus",function(e){
        $(this).removeAttr("style");
    });
    $("#confirmaRegBtn").on("click", function(){
        console.log($("#nombreUsuario").val() + " - " + $("#password1").val());
        if($("#password2").val() != $("#password1").val()){
            $('#password2').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
            $('#password1').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
        } else {
            crearUsuario($("#nombreUsuario").val(), $("#password2").val());
        }
    });

}

function mierdaPrueba() {
    $.getJSON('/resultados/', function (datos) {
        console.log(JSON.stringify(datos));
        for (p in datos){
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
    maxVida = $.cookie("vidas");
    vidas = $.cookie("vidas");
    var nombre=$.cookie("nombre");
	var id=$.cookie("id");
	var nivel=$.cookie("nivel");
	var percen=Math.floor(((nivel-1)/3)*100);
	$('#datos').remove();
	$('#cabeceraP').remove();
	$('#cabecera').remove();
	$('#prog').remove();
	//$('#control').append('<div id="cabecera"><h2>Panel</h2></div>')
	$('#control').append('<div id="datos"><h4>Nombre: '+nombre+'<br />Nivel: '+nivel+'</h4></div>');
	$('#control').append('<div class="progress" id="prog"><div class="progress-bar progress-bar-success progress-bar-striped" aria-valuemin="0" aria-valuemax="100" style="width:'+percen+'%">'+percen+'%</div></div>');
	$("#registerGroup").remove();
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
        $("#formRegistro").remove();
        $("#juegoContainer").append('<div id="juegoId"></div>');
        console.log("Nivel de cookie es ->" + $.cookie("nivel"));
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
function crearUsuario(nombre,pass) {
    if (nombre == "") {
        nombre = "jugador";
    }
    $.ajax({
        type:"POST",
        contentType:"application/json",
        url:"/crearUsuario/",
        data:JSON.stringify({email:nombre,password:pass}),
        success:function(data){
            if(data.nivel == -1){
                $('#nombreUsuario').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
            } else {
                $("#formRegistro").remove();
                $.cookie("nivel", data.nivel);
                $.cookie("vidas", data.vidas);
                $.cookie('nombre', data.nombre);
                $.cookie('id', data._id);
            }
        }
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
    var resultJuegoHtml = "";
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
        resultJuegoHtml += resultadosJuego[key].user + " - " + resultadosJuego[key].score + "<br/>";
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
            reset();
        } else {
            console.log("Actualizamos nivel de cookie");
            $.cookie("nivel", datos.nivel);
            $.cookie("vidas", datos.vidas);
            mostrarInfoJuego2();
        }
    });
}

function comprobarUsuarioMongo(nombre,pass){
    console.log(nombre);
    $.ajax({
        type:"POST",
        contentType:"application/json",
        url:"/login/",
        data:JSON.stringify({email:nombre,password:pass}),
        success:function(data){
            if(data.nivel == -1){
                $('#nombreL').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
                $('#claveL').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
                $("#nombreL").val('');
                $("#claveL").val('');
            } else {
                $.cookie("nivel", data.nivel);
                $.cookie("vidas", data.vidas);
                $.cookie('nombre', data.nombre);
                $.cookie('id', data._id);
                borrarLogin();
                mostrarInfoJuego2();
            }
        }
    });
}

function borrarLogin(){
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
	mostrarLogin();
}