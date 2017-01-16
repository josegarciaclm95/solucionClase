function proxy() {
    /**
     * Se comprueba la validez de unos datos. El ultimo atributo indica si los datos se están comprobando
     * desde una cookie o desde el formulario de login. Si es desde cookie, no comprobamos la contrasena
     */
    //this.socket = io();
    this.setListener = function(){
        this.socket.on("chat message " + $.cookie("nivel"), nuevoMensaje);
    }
    this.removeListener = function(){
        this.socket.off("chat message " +  $.cookie("nivel"));
    }
    this.enviarMensaje = function(msg){
        this.socket.emit("chat message " + $.cookie("nivel"), {msg:msg, nombre:$.cookie("email"), nivel:$.cookie("nivel")})
        //nuevoMensaje(msg);
    }
    this.deleteSocket = function(){
        proxy.socket = undefined;
    }
    this.startSocket = function(){
        proxy.socket = io();
    }
    this.comprobarUsuarioMongo = function (nombre, pass, fromCookie) {
        if (pass == "" && !fromCookie) {
            estilosAlerta('#claveL')
        } else {
            var callback = function (data) {
                if (data.nivel == -1) {
                    console.log("El usuario no existe");
                    borrarCookies();
                    loginIncorrecto();
                } else {
                    this.startSocket();
                    setCookies(data);
                    limpiarLogin();
                    mostrarInfoJuego2();
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
                proxy.removeListener();
                $.cookie("nivel", datos.nivel);
                proxy.setListener();
                mostrarInfoJuego2();
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
                $("#juegoContainer").prepend('<span id="warning" style="color:#FF0000; font-weight: bold;">Confirma tu correo!!!</span>');
            }
        }
        peticionAjax("POST", "/crearUsuario/", true, JSON.stringify({
            user_name:user_name,
            email: email,
            password: pass,
            url: url
        }), callback);
    }
    this.modificarUsuario = function (nombre, pass) {
        var callback = function (data) {
            if (data.nModified != 1) {
                estilosAlerta('#nombreUsuario');
                $('#nombreUsuario').val('Usuario existente');
            } else {
                $("#juegoContainer").prepend('<span id="warning" style="color:#04B404">Yay!!! Todo ha ido bien</span>');
                $("#formRegistro").remove();
                borrarSiguienteNivel();
                resetControl();
            }
        }
        peticionAjax("POST", "/modificarUsuario/", true,
            JSON.stringify({
                old_email: $.cookie('email'),
                new_email: nombre,
                new_password: pass
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