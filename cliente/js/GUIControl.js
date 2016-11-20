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
    form += '<form id="login"><div class="form-group"><input type="text" class="form-control" id="nombreL" placeholder="Introduce tu nombre"><input type="password" class="form-control" id="claveL" placeholder="Introduce tu clave"></div>';
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
        $("#confirmaRegBtn").on("click", function () {
            eliminarUsuarioServer($("#nombreUsuario").val(), $("#password1").val());
        });
    });
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