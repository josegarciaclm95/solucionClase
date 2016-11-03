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
        comprobarUsuarioMongo($.cookie('nombre'),undefined,true);
    } else {
        console.log("No hay una cookie");
        mostrarLogin();
    }
}

function limpiarMongo(){
    $.getJSON('/limpiarMongo/', function (datos) {
        console.log("Coleccion vacia");
        console.log(datos);
    });
}
function mostrarLogin(){
    $("#login").remove();
    var form = "";
    form += '<form id="login"><div class="form-group"><input type="text" class="form-control" id="nombreL" placeholder="Introduce tu nombre"><input type="password" class="form-control" id="claveL" placeholder="Introduce tu clave"></div>';
    form += '<button type="button" id="loginBtn" class="btn btn-primary btn-md" style="margin-bottom:10px">Entrar</button>';
    form += '<div id="registerGroup" class="form-group" style="margin-bottom:0px"><label for="register">¿Eres nuevo? Regístrate</label><br/>';
    form += '<button type="button" id="registrBtn" class="btn btn-primary btn-md">Registrar</button></div></form>';
    $("#control").append(form);
    
    $("#nombreL,#claveL").on("keyup", function (e) {
        if (e.keyCode == 13) {
            console.log($("#nombreL").val() + " - " + $("#claveL").val());
            comprobarUsuarioMongo($("#nombreL").val(),$("#claveL").val(), false);
        }
    });
    $("#nombreL,#claveL").on("focus", function (e) {
        $(this).removeAttr("style");
        $(this).val('');
    });
    $("#loginBtn").on("click",function(e){
        console.log($("#nombreL").val() + " - " + $("#claveL").val());
        comprobarUsuarioMongo($("#nombreL").val(),$("#claveL").val(),false);
    });
    $("#registrBtn").on("click",function(e){
        mostrarFormularioRegistro();
    });
}

function mostrarFormularioRegistro(){
    $("#juegoContainer").empty();
    $("#juegoContainer").load('../registro.html',function(){
        $("#password1,#password2,#nombreUsuario").on("focus",function(e){
            $(this).removeAttr("style");
            $(this).val('');
        });
        $("#confirmaRegBtn").on("click", function(){
            console.log($("#nombreUsuario").val() + " - " + $("#password1").val());
            if($("#password2").val() != $("#password1").val()){
                $('#password2').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
                $('#password1').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
            } else {
                crearUsuario($("#nombreUsuario").val(), $("#password2").val(),false);
            }
        });    
});
}

function mostrarFormularioModificar(){
    $("#juegoContainer").empty();
    $("#juegoContainer").load('../registro.html',function(){
        $("#password1,#password2,#nombreUsuario").on("focus",function(e){
            $(this).removeAttr("style");
        });
        $("#nombreUsuario").val($.cookie('nombre'));
        $("#confirmaRegBtn").text("Guardar cambios");
        $("#confirmaRegBtn").on("click", function(){
            console.log($("#nombreUsuario").val() + " - " + $("#password1").val());
            if($("#password2").val() != $("#password1").val()){
                $('#password2').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
                $('#password1').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
            } else {
                modificarUsuarioServer($("#nombreUsuario").val(), $("#password1").val());
            }
        });    
    });
}

function mostrarFormularioEliminar(){
    $("#juegoContainer").empty();
    $("#juegoContainer").load('../registro.html',function(){
        $("#formRegistro").prepend('<span style="color:#FF0000">Confirma tus credenciales</span>');
        $("#camposContra2").remove();
        $("#confirmaRegBtn").text("Eliminar credenciales");
        $("#confirmaRegBtn").on("click", function(){
                eliminarUsuarioServer($("#nombreUsuario").val(), $("#password1").val());
        });
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
    $("#control").append('<button type="button" id="siguienteBtn" class="btn btn-primary btn-md" style="margin-top:5px; margin-right:5px;">Siguiente nivel</button>');
    $("#control").append('<button type="button" id="cerrarSesBtn" class="btn btn-primary btn-md" style="margin-top:5px">Cerrar sesión</button>');
    $("#siguienteBtn").on("click", function () {
        $(this).remove();
        $("#cerrarSesBtn").remove();
        $("#juegoId").remove();
        $("#enh").remove();
		$('#res').remove();
  		$('#resultados').remove();
        $("#formRegistro").remove();
        $("#juegoContainer").append('<div id="juegoId"></div>');
        console.log("Nivel de cookie es ->" + $.cookie("nivel"));
        crearNivel($.cookie("nivel"));
    });
    $("#cerrarSesBtn").on("click", function(){
        $("#control").empty();
        reset();
    });
}

function borrarSiguienteNivel(){
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
    comunicarNivelCompletado(tiempo);
    //obtenerResultados();
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
                $('#nombreUsuario').val('Usuario existente');
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

function modificarUsuarioServer(nombre,pass) {
    $.ajax({
        type:"POST",
        contentType:"application/json",
        url:"/modificarUsuario/",
        data:JSON.stringify({old_email:$.cookie('nombre'),new_email:nombre,new_password:pass}),
        success:function(data){
            console.log(data);
            if(data.nModified != 1){
                $('#nombreUsuario').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
                $('#nombreUsuario').val('Usuario existente');
            } else {
                $("#formRegistro").remove();
                borrarSiguienteNivel();
                reset();
            }
        }
    });
}

function eliminarUsuarioServer(nombre,pass) {
    $.ajax({
        type:"POST",
        contentType:"application/json",
        url:"/eliminarUsuario/",
        data:JSON.stringify({email:nombre,password:pass}),
        success:function(data){
            console.log(data);
            if(data.n != 1){
                $('#nombreUsuario').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
                $('#nombreUsuario').val('Error en servidor');
            } else {
                $("#formRegistro").remove();
                borrarSiguienteNivel();
                reset();
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

function comprobarUsuarioMongo(nombre,pass,fromCookie){
    //console.log(nombre);
    //console.log(pass);
    if (pass == "" && !fromCookie){
        $('#claveL').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
    } else {
        $.ajax({
            type:"POST",
            contentType:"application/json",
            url:"/login/",
            data:JSON.stringify({email:nombre,password:pass}),
            success:function(data){
                if(data.nivel == -1){
                    console.log("No hay nada");
                    borrarLogin();
                    reset();
                    $('#nombreL').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
                    $('#claveL').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
                    $("#nombreL").val('Usuario o contraseña incorrectos');
                    $("#claveL").val('');
                } else {
                    setCookies(data);
                    borrarLogin();
                    mostrarInfoJuego2();
                }
            }
        });
    }
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

function setCookies(data){
    $.cookie("nivel", data.nivel);
    $.cookie("vidas", data.vidas);
    $.cookie('nombre', data.nombre);
    $.cookie('id', data._id);
}

function noHayNiveles(){
	$('#juegoId').append("<h2 id='enh'>Lo siento, no tenemos más niveles</h2>");
	$('#control').append('<button type="button" id="siguienteBtn" class="btn btn-primary btn-md">Volver a empezar</button>')
	$('#siguienteBtn').on('click',function(){
		$('#siguienteBtn').remove();
        $('#datos').remove();
        $('#prog').remove();
		reset();
	});
}

function finDelJuego(){
    game.destroy();
    $('#juegoId').append("<h2 id='enh'>Lo siento,  has perdido :(</h2>");
    $('#control').append('<button type="button" id="siguienteBtn" class="btn btn-primary btn-md">Volver a empezar</button>');
    $('#siguienteBtn').on('click',function(){
        $('#siguienteBtn').remove();
        $('#datos').remove();
        $('#prog').remove();
        siguienteNivel();
	});
}

function reset(){
	borrarCookies();
    $("#control").empty();
	mostrarLogin();
}

function modificarUsuario(){
    if($.cookie('nombre') != undefined){
        mostrarFormularioModificar();
    } else {
        $("#juegoContainer").empty();
        $("#juegoContainer").append('<span style="color:#FF0000">Tienes que logearte primero!!</span>');
    }
}

function eliminarUsuario(){
    if($.cookie('nombre') != undefined){
        mostrarFormularioEliminar();
    } else {
        $("#juegoContainer").empty();
        $("#juegoContainer").append('<span style="color:#FF0000">Tienes que logearte primero!!</span>');
    }
}
