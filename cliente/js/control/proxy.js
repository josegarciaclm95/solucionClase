function proxy() {
    /**
     * Se comprueba la validez de las credenciales de login. El ultimo atributo indica si los datos se están comprobando
     * desde una cookie o desde el formulario de login. Si es desde cookie, no comprobamos la contraseña.
     */
    var self = this;
    this.comprobarUsuarioMongo = function (nombre, pass, fromCookie) {
        if (pass == "" && !fromCookie) {
            estilosAlerta('#claveL')
        } else {
            //Definimos el callback que trate los datos que devuelva el servidor
            //El servidor puede devolver {"user_name":"ERROR"...} o {"user_name":datos validos, ....}
            var callback = function (data) {
                if (data.user_name == "ERROR") {
                    console.log("El usuario no existe");
                    borrarCookies();
                    loginIncorrecto();
                } else {
                    setCookies(data);
                    console.log(data);
                    console.log("El usuario es correcto");
                    $("#myModal").css("display","none");
                    $("#myBtn").css("display","none");
                    $(".info").css("display","none");
                    showGameControls();
                }
            }
            peticionAjax("POST", "/login/", true, JSON.stringify({
                email_name: nombre,
                password: pass
            }), callback);
        }
    };
    /**
     * El servidor registra los resultados del nivel actual y nos indica el siguiente nivel.
     */
    this.nivelCompletado = function (tiempo, vidas) {
            var callback = function (datos) {
                $.cookie("nivel", datos.nivel);
                console.log()
                showGameControls();
            }
            $.get("/nivelCompletado/" + $.cookie("id") + "/" + tiempo + "/" + vidas, callback);
        }
        /**
         * Obtenemos los resultados de la partida actual
         */
    this.obtenerResultados = function () {
        var callback = function (datos) {
            console.log("Callback de obtener resultados con " + datos.length + " resultados");
            mostrarResultadosUsuario(datos);
        }
        $.get("/obtenerResultados/" + $.cookie("id"), callback);
    }

    this.crearUsuario = function (user_name, email, pass, url) {
        var callback = function (data) {
            $.loadingBlockHide();
            if (data.result == "userExists") {
                estilosAlerta('#estilosAlerta');
                $('#nombreUsuario').val('Usuario existente');
            } else {
                $("#formRegistro").remove();
                $("#juegoContainer").prepend('<span id="warning" style="font-weight: bold;">Te acabamos de mandar un mensaje con un link para confirmar tu cuenta. </span>');
                $("#juegoContainer").prepend('<span id="warning" style="font-weight: bold;">Comprueba tu bandeja de correo electrónico. </span>');
            }
        }
        peticionAjax("POST", "/crearUsuario/", true, JSON.stringify({
            user_name:user_name,
            email: email,
            password: pass,
            url: url
        }), callback);
    }
    this.modificarUsuario = function (user_name, email, pass) {
        var callback = function (data) {
            if (data.nModified != 1) {
                estilosAlerta('#nombreUsuario, #correoUsuario');
                $('#nombreUsuario').val('Usuario existente');
            } else {
                $("#juegoContainer").prepend('<span id="warning" style="color:#04B404">Yay!!! Todo ha ido bien</span>');
                $("#juegoContainer").prepend('<span id="warning" style="font-weight: bold;">Modificación realizada correctamente. </span>');
                $("#formRegistro").remove();
                borrarSiguienteNivel();
                resetControl();
            }
        }
        peticionAjax("POST", "/modificarUsuario/", true,
            JSON.stringify({
                old_email: $.cookie('email'),
                new_email: email,
                new_password: pass,
                new_user_name: user_name
            }), callback);
    }

    this.eliminarUsuario = function (nombre, pass) {
        var callback = function (data) {
            if (data.n != 1) {
                $('#nombreUsuario').attr('style', "border-radius: 5px; border:#FF0000 1px solid;");
                $('#nombreUsuario').val('Error al borrar. Comprueba que usuario y contraseña son correctos');
            } else {
                $("#formRegistro").remove();
                borrarSiguienteNivel();
                resetControl();
                $("#juegoContainer").prepend('<span id="warning" style="font-weight: bold;">Eliminación realizada correctamente. </span>');
            }
        }
        peticionAjax("DELETE", "/eliminarUsuario/", true, JSON.stringify({
            email: nombre,
            password: pass
        }), callback);
    }
}

function peticionAjax(peticion, url, async, body, successCallback) {
    $.ajax({
        type: peticion,
        contentType: "application/json",
        async: async,
        url: url,
        data: body,
        success: successCallback
    });
}

function meterUsuario(nombre, pass, activo){
    peticionAjax("POST","/meterEnUsuarios/",true,JSON.stringify({email: nombre, password: pass, activo:activo}),function(data){
        console.log(data)
    });
}
//email: nombre, password: pass, activo:activo
