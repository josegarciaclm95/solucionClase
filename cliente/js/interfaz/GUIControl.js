function limpiarLogin() {
    $("#login").remove();
}

function limpiarJuegoContainer() {
    $("#juegoContainer").empty();
    $("#chat-whole").remove();
}

function limpiarEstilos(selector) {
    $(selector).removeAttr("style");
    $(selector).val('');
}

function loginIncorrecto() {
    estilosAlerta('#nombreL,#claveL');
    $("#nombreL").val('Usuario o contraseña incorrectos');
}

function estilosAlerta(selector) {
    $(selector).attr('style', "border-radius: 5px; border:#FF0000 1px solid;")
}

function construirLogin() {
    limpiarLogin();
    $("#control").load('../login.html', function () {
        $("#claveL").on("keyup", function (e) {
            if (e.keyCode == 13) {
                console.log($("#nombreL").val() + " - " + $("#claveL").val());
                proxy.comprobarUsuarioMongo($("#nombreL").val(), $("#claveL").val(), false);
            }
        });
        $("#nombreL").on("focus", function (e) {
            limpiarEstilos(this);
        });
        $("#claveL").on("focus", function (e) {
            limpiarEstilos(this);
        });
        $("#loginBtn").on("click", function (e) {
            proxy.comprobarUsuarioMongo($("#nombreL").val(), $("#claveL").val(), false);
        });
        $("#registrBtn").on("click", function (e) {
            limpiarEstilos("#nombreL,#claveL");
            construirRegistro();
        });
    });

}

function construirRegistro() {
    limpiarJuegoContainer();
    $("#juegoContainer").load('../registro.html', function () {
        $("#userName").on("focus", function (e) {
            limpiarEstilos(this);
        });
        $("#password1").on("focus", function (e) {
            limpiarEstilos(this);
        });
        $("#password2").on("focus", function (e) {
            limpiarEstilos(this);
        });
        $("#correoUsuario").on("focus", function (e) {
            limpiarEstilos(this);
        });
        $("#confirmaRegBtn").on("click", function () {
            //console.log($("#nombreUsuario").val() + " - " + $("#password1").val());
            if (!validateMail($("#correoUsuario").val())) {
                estilosAlerta('#correoUsuario');
                $('#correoUsuario').val('Formato de mail no válido')
            } else if ($("#password2").val() != $("#password1").val()) {
                estilosAlerta('#password2,#password1');
                $("#formRegistro").prepend('<span id="warning" style="color:#FF0000; font-weight: bold;">Contraseñas no coinciden!!!</span>');
            } else if ($("#password1").val() == "") {
                estilosAlerta('#password2,#password1');
                $("#formRegistro").prepend('<span id="warning" style="color:#FF0000; font-weight: bold;">Contraseña no puede ir en blanco!!!</span>');
            } else {
                crearUsuario($("#userName").val(),$("#correoUsuario").val(), $("#password2").val());
                $.loadingBlockShow({
                    imgPath: 'assets/default.svg',
                    text: 'Un momento por favor. Esta operación es un poco más lenta ...',
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

function construirFormularioModificar() {
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
        $("#labelCorreo").text("Correo electrónico");
        $("#nombreUsuario").val($.cookie('email'));
        $("#confirmaRegBtn").text("Guardar cambios");
        $("#confirmaRegBtn").on("click", function () {
            console.log($("#nombreUsuario").val() + " - " + $("#password1").val());
            if (!validateMail($("#nombreUsuario").val())) {
                estilosAlerta('#nombreUsuario');
                $("#nombreUsuario").val('Email con formato incorrecto. Inserte su email con formato abc@def.ghi');
            } else if ($("#password2").val() != $("#password1").val()) {
                estilosAlerta('#password2,#password1');
                $("#formRegistro").prepend('<span id="warning" style="color:#FF0000">Contraseñas no coinciden!!!</span>');
            } else if ($("#password1").val() == "") {
                estilosAlerta('#password2,#password1');
                $("#formRegistro").prepend('<span id="warning" style="color:#FF0000">Contraseña no puede ir en blanco!!!</span>');
            } else {
                modificarUsuarioServer($("#nombreUsuario").val(), $("#password1").val());
                $("#warning").remove();
            }
        });
    });
}


function construirFormularioEliminar() {
    limpiarJuegoContainer();
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
    var nombre = $.cookie("email");
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
        limpiarJuegoContainer();
        $("#juegoContainer").append('<div id="juegoId"></div>');
        $("#backMusic").animate({
            volume: 0
        }, 1000);
        console.log("Nivel de cookie es ->" + $.cookie("nivel"));
        console.log("Llamamos a crear nivel sin parametros en siguienteNivel()");
        crearNivel();
        $("#chat-box").load("./js/tool/chat/chat.html", function () {
            $("#chat-date").text(new Date());
            var callbackEnviar = function () {
                proxy.enviarMensaje($("#chat-msg").val());
                $("#chat-msg").val('');
            }
            $("#chat-send").on("click", callbackEnviar);
            $("#chat-msg").on("keyup", function (e) {
                if (e.keyCode == 13) {
                    callbackEnviar();
                }
            });
        });
    })
    $("#cerrarSesBtn").on("click", resetControl);
}

function resetControl() {
    borrarCookies();
    proxy.deleteSocket();
    limpiarJuegoContainer();
    $("#control").empty();
    $("#modificar").hide();
    $("#eliminar").hide();
    construirLogin();
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
    peticionAjax("GET", "/resultados/", false, {}, function (data) {
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
            for (var z in resultadosJuego[i].resultados[j]) {
                var date;
                if (z != "idJuego" && resultadosJuego[i].resultados[j][z] != -1) {
                    cadena = cadena + "<tr><td>" + resultadosJuego[i].nombre + "</td><td>" + date + "</td><td> " + z.slice(-1) + "</td>" + "</td><td> " + resultadosJuego[i].resultados[j][z] + "</td></tr>";
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

function pruebaEffects() {
    $("#info1").fadeIn(3500, function () {
        $("#info2").fadeIn(200, function () {
            $("#info3").fadeIn(3000, function () {
                $("#info4").fadeIn(2000);
                $("#info5").fadeIn(2000);
            })
        })
    });
}

function validateMail(email) {
    console.log("Validando Mail");
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    console.log(re.test(email))
    return re.test(email);
}

function nuevoMensaje(msg) {
    var date = new Date();
    date = date.getHours() + ":" + date.getMinutes();
    var html = `
        <div class="row">
            <div class="col-lg-12">
                <div class="media">
                    <div class="media-body">
                        <h4 class="media-heading">${msg.nombre}
                            <span class="small pull-right">${date}</span>
                        </h4>
                        <p>${msg.msg}</p>
                    </div>
                </div>
            </div>
        </div>
        <hr>
    `;
    $("#chat-conversation").append(html);
    var element = document.getElementById("chat-conversation");
    element.scrollTop = element.scrollHeight;
}