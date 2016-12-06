function limpiarLogin(){
    $("#login").remove();
}

function limpiarJuegoContainer(){
    $("#juegoContainer").empty();
}

function limpiarEstilos(selector){
    $(selector).removeAttr("style");
    $(selector).val('');
}

function loginIncorrecto(){
    estilosAlerta('#nombreL,#claveL');
    $("#nombreL").val('Usuario o contraseña incorrectos');
}

function estilosAlerta(selector){
    $(selector).attr('style', "border-radius: 5px; border:#FF0000 1px solid;")
}

function construirLogin(){
    limpiarLogin();
    var form = "";
    form += '<form id="login"><div class="form-group"><input type="text" class="form-control" id="nombreL" placeholder="Introduce tu email"><input type="password" class="form-control" id="claveL" placeholder="Introduce tu clave"></div>';
    form += '<button type="button" id="loginBtn" class="btn btn-primary btn-md" style="margin-bottom:10px">Entrar</button>';
    form += '<div id="registerGroup" class="form-group" style="margin-bottom:0px"><label for="register">¿Eres nuevo? Regístrate</label><br/>';
    form += '<button type="button" id="registrBtn" class="btn btn-primary btn-md">Registrar</button></div></form>';
    $("#control").append(form);
    $("#nombreL,#claveL").on("keyup", function (e) {
        if (e.keyCode == 13) {
            console.log($("#nombreL").val() + " - " + $("#claveL").val());
            comprobarUsuarioMongo($("#nombreL").val(), $("#claveL").val(), false);
        }
    });
    $("#nombreL").on("focus", function (e) {
        limpiarEstilos(this);
    });
    $("#claveL").on("focus", function (e) {
        limpiarEstilos(this);
    });
    $("#loginBtn").on("click", function (e) {
        //console.log($("#nombreL").val() + " - " + $("#claveL").val());
        comprobarUsuarioMongo($("#nombreL").val(), $("#claveL").val(), false);
    });
    $("#registrBtn").on("click", function (e) {
        limpiarEstilos("#nombreL,#claveL");
        construirRegistro();
    });
}

function construirRegistro(){
    limpiarJuegoContainer();
    $("#juegoContainer").load('../registro.html', function () {
        $("#password1").on("focus", function (e) {
            limpiarEstilos(this);
        });
        $("#password2").on("focus", function (e) {
            limpiarEstilos(this);
        });
        $("#nombreUsuario").on("focus", function (e) {
            limpiarEstilos(this);
        });
        $("#confirmaRegBtn").on("click", function () {
            //console.log($("#nombreUsuario").val() + " - " + $("#password1").val());
            if ($("#password2").val() != $("#password1").val()) {
                estilosAlerta('#password2,#password1');
                $("#formRegistro").prepend('<span id="warning" style="color:#FF0000; font-weight: bold;">Contraseñas no coinciden!!!</span>');
            } else {
                crearUsuario($("#nombreUsuario").val(), $("#password2").val(), false);
                $.loadingBlockShow({
                    imgPath: 'assets/default.svg',
                    text: 'Un momento pls, que esto tarda ...',
                    style: {
                        position: 'fixed',
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0, 0, 0, .8)',
                        left: 0,
                        top: 0,
                        zIndex: 10000
                    }
                });
            }
        });
    });
}

function construirFormularioModificar(){
    limpiarJuegoContainer()
    $("#juegoContainer").load('../registro.html', function () {
        $("#password1").on("focus", function (e) {
            limpiarEstilos(this);
        });
        $("#password2").on("focus", function (e) {
            limpiarEstilos(this);
        });
        $("#nombreUsuario").on("focus", function (e) {
            limpiarEstilos(this);
        });
        $("#labelCorreo").text("Correo electrónico");
        $("#nombreUsuario").val($.cookie('nombre'));
        $("#confirmaRegBtn").text("Guardar cambios");
        $("#confirmaRegBtn").on("click", function () {
            console.log($("#nombreUsuario").val() + " - " + $("#password1").val());
            if ($("#password2").val() != $("#password1").val()) {
                estilosAlerta('#password2,#password1');
                $("#formRegistro").prepend('<span id="warning" style="color:#FF0000">Contraseñas no coinciden!!!</span>');
            } else {
                modificarUsuarioServer($("#nombreUsuario").val(), $("#password1").val());
                 $("#warning").remove();
            }
        });
    });
}


function construirFormularioEliminar() {
    $("#juegoContainer").empty();
    $("#juegoContainer").load('../registro.html', function () {
        $("#formRegistro").prepend('<span style="color:#FF0000">Confirma tus credenciales</span>');
        $("#camposContra2").remove();
        $("#confirmaRegBtn").text("Eliminar credenciales");
        $("#labelCorreo").text("Correo electrónico");
        $("#confirmaRegBtn").on("click", function () {
            eliminarUsuarioServer($("#nombreUsuario").val(), $("#password1").val());
        });
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
    $('#control').append('<div id="datos"><h4>Nombre: ' + nombre + '<br />Nivel: ' + nivel + '</h4></div>');
    $('#control').append('<div class="progress" id="prog"><div class="progress-bar progress-bar-success progress-bar-striped" aria-valuemin="0" aria-valuemax="100" style="width:' + percen + '%">' + percen + '%</div></div>');
    $("#registerGroup").remove();
    $("#modificar").show();
    $("#eliminar").show();
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

function mostrarResultados() {
    var resultadosJuego = undefined;
    console.log("LLamamos a mostrar resultados");
    peticionAjax("GET","/resultados/",false,{},function(data){
        console.log("Ya tengo resultados");
        console.log(data.length);
        resultadosJuego = data;
    });
    limpiarJuegoContainer();
    $('#juegoContainer').append('<h3 id="res">Resultados</h3>');
    var cadena = "";
    cadena += "<table id='resultados' class='table table-bordered table-condensed'>";
    cadena += "<tr><th colspan='4' style='text-align:center;'><img style='height:150px; width:150px' src='./assets/wall-fame.png'></th></tr>";
    cadena += "<tr><th style='text-align:center'>Nombre</th><th style='text-align:center'>Partida</th><th style='text-align:center'>Nivel</th><th style='text-align:center'>Tiempo</th></tr>";

    for (var i in resultadosJuego) {
        console.log(i)
        console.log(resultadosJuego[i])
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
    $('#juegoContainer').append(cadena);
}

function pruebaEffects(){
    $("#info1").fadeIn(3500, function(){
         $("#info2").fadeIn(200,function(){
             $("#info3").fadeIn(3000,function(){
                 $("#info4").fadeIn(2000);
                 $("#info5").fadeIn(2000);
             })
         })
    });
}