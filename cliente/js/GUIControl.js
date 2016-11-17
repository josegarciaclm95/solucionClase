function limpiarLogin(){
    $("#login").remove();
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
    $("#nombreL,#claveL").on("focus", function (e) {
        $(this).removeAttr("style");
        $(this).val('');
    });
    $("#loginBtn").on("click", function (e) {
        console.log($("#nombreL").val() + " - " + $("#claveL").val());
        comprobarUsuarioMongo($("#nombreL").val(), $("#claveL").val(), false);
    });
    $("#registrBtn").on("click", function (e) {
        limpiarEstilosLogin();
        mostrarFormularioRegistro();
    });
}


function limpiarEstilosLogin(){
    $("#nombreL,#claveL").removeAttr("style");
    $("#nombreL,#claveL").val('');
}

function construirRegistro(){
    $("#juegoContainer").empty();
    $("#juegoContainer").load('../registro.html', function () {
        $("#password1,#password2,#nombreUsuario").on("focus", function (e) {
            $(this).removeAttr("style");
            $(this).val('');
        });
        $("#confirmaRegBtn").on("click", function () {
            console.log($("#nombreUsuario").val() + " - " + $("#password1").val());
            if ($("#password2").val() != $("#password1").val()) {
                $('#password2').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
                $('#password1').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
                $("#formRegistro").prepend('<span id="warning" style="color:#FF0000; font-weight: bold;">Contraseñas no coinciden!!!</span>');
            } else {
                crearUsuario($("#nombreUsuario").val(), $("#password2").val(), false);
            }
        });
    });
}

function pruebaEffects(){
    $("#info1").fadeIn(3000, function(){
         $("#info2").fadeIn(200,function(){
             $("#info3").fadeIn(3000,function(){
                 $("#info4").fadeIn(2000);
                 $("#info5").fadeIn(2000);
             })
         })
    });
}