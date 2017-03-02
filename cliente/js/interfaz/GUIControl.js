function limpiarLogin() {
    //$("#login").remove();
    //$("#myModal").css("display","none");
    
}

function limpiarJuegoContainer() {
    $("#juegoContainer").empty();
}

function limpiarEstilos(selector) {
    $(selector).removeAttr("style");
    $(selector).val('');
    $("#warning").remove();
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
    $("#modal-login").load('../login.html', function () {
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
        $("#userName").on("focus", function (e) {
            limpiarEstilos(this);
        });
        $("#correoUsuario").on("focus", function (e) {
            limpiarEstilos(this);
        });
        $("#labelCorreo").text("Correo electrónico");
        $("#userName").val($.cookie('user_name'));
        $("#correoUsuario").val($.cookie('email'));
        $("#confirmaRegBtn").text("Guardar cambios");

        $("#confirmaRegBtn").on("click", function () {
            console.log($("#userName").val() + " - " + $("#password1").val());
            if (!validateMail($("#correoUsuario").val())) {
                estilosAlerta('#correoUsuario');
                $("#correoUsuario").val('Email con formato incorrecto. Inserte su email con formato abc@def.ghi');
            } else if ($("#password2").val() != $("#password1").val()) {
                estilosAlerta('#password2,#password1');
                $("#formRegistro").prepend('<span id="warning" style="color:#FF0000">Contraseñas no coinciden!!!</span>');
            } else if ($("#password1").val() == "") {
                estilosAlerta('#password2,#password1');
                $("#formRegistro").prepend('<span id="warning" style="color:#FF0000">Contraseña no puede ir en blanco!!!</span>');
            } else {
                modificarUsuarioServer($("#userName").val(), $("#correoUsuario").val(), $("#password1").val());
                $("#warning").remove();
            }
        });
    });
}


function construirFormularioEliminar() {
    limpiarJuegoContainer();
    $("#juegoContainer").load('../registro.html', function () {
        $("#formRegistro").prepend('<span style="color:#FF0000; font-weight:bold">Confirma tus credenciales. Vas a eliminar tus datos</span>');
        $("#camposContra2").remove();
        $("labelUserName").remove();
        $("#userName").remove();
        $("#confirmaRegBtn").text("Eliminar credenciales");
        $("#labelCorreo").text("Correo electrónico");
        $("#confirmaRegBtn").on("click", function () {
            eliminarUsuarioServer($("#correoUsuario").val(), $("#password1").val());
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
        //$("#social").hide();
        $("#cerrarSesBtn").remove();
        limpiarJuegoContainer();
        $("#juegoContainer").append('<div id="juegoId"></div>');
        $("#backMusic").animate({
            volume: 0
        }, 1000);
        console.log("Nivel de cookie es ->" + $.cookie("nivel"));
        console.log("Llamamos a crear nivel sin parametros en siguienteNivel()");
        crearNivel();
        //onStart();
    })
    $("#cerrarSesBtn").on("click", resetControl);
}

function resetControl() {
    borrarCookies();
    limpiarJuegoContainer();
    $("#control").empty();
    $("#modificar").hide();
    $("#social").hide();
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
        console.log(data);
        resultadosJuego = data;
    });
    limpiarJuegoContainer();
    $('#juegoContainer').append('<h3 id="res">Resultados</h3>');
    var cadena = "";
    cadena += "<table id='resultados' class='table table-bordered table-condensed'>";
    cadena += "<tr><th colspan='5' style='text-align:center;'><img style='height:150px; width:150px' src='./assets/wall-fame.png'></th></tr></table>";
    $('#juegoContainer').append(cadena);

    cadena = "";
    cadena += '<p>Aquí se presentan los resultados de todas las partidas realizadas. Puede hacer clic en la cabecera de'; 
    cadena += ' cada columna para cambiar la organización (ascendente, descentente, A a Z, Z a A, etc.)</p>';
    cadena += '<p>Tambien puede realizar busquedas mediante el cuadro Search. Estas busquedas se hacen por todos los atributos</p>'    
    $('#juegoContainer').append(cadena);
    var resultados = [];
    for (var i in resultadosJuego) {
        if(resultadosJuego[i].resultados.length != 0) flag = false;
        for (var j in resultadosJuego[i].resultados) {
            for (var z in resultadosJuego[i].resultados[j].resultados) {
                var date = new Date(resultadosJuego[i].resultados[j].id_partida);
                var dia = (date.getDate() < 10) ? "0" + date.getDate() : date.getDate()
                var mes = (date.getMonth() < 9) ? "0" + (date.getMonth()+1) : date.getMonth()+1
                var horas = (date.getHours() < 10) ? "0" + date.getHours() : date.getHours()
                var minutos = (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes()
                //date = date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes();
                 date = dia+ "/" + mes + "/" + date.getFullYear() + " " + horas + ":" + minutos;
                 var nombre = (resultadosJuego[i].usuario.user_name == null) ? resultadosJuego[i].usuario.email : resultadosJuego[i].usuario.user_name;
                resultados.push([nombre,date,resultadosJuego[i].resultados[j].resultados[z].nivel, resultadosJuego[i].resultados[j].resultados[z].tiempo])
            }
        }
    }
    $('#juegoContainer').append('<table id="table" width="100%"></table>');
    $('#table').DataTable({
        data: resultados,
        columns: [
            { title: "Nombre" },
            { title: "Fecha" },
            { title: "Nivel" },
            { title: "Tiempo" }
        ]
    });
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
