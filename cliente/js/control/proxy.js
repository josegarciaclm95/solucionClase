function proxy() {
    /**
     * Se comprueba la validez de las credenciales de login. El ultimo atributo indica si los datos se están comprobando
     * desde una cookie o desde el formulario de login. Si es desde cookie, no comprobamos la contraseña.
     */
    this.keylogger = undefined;
    this.affdexDetector = undefined;
    this.beyondVerbal = undefined;
    this.user_accept_affective = {}
    var self = this;
    this.setAffective = function(accept_affective){
        this.user_accept_affective = accept_affective;
        if(accept_affective.affectiva) {
            self.initializeAffdexDetector();
        }
        if(accept_affective.beyond){
            self.initializeBeyondVerbal();
        }
        if(accept_affective.keys){
            self.initializeKeylogger();
        }
    }
    this.initializeAffdexDetector = function(){
        this.affdexDetector = new Affdex();
        this.affdexDetector.onInitializeSuccess(onInitializeSuccessDEMO);
        this.affdexDetector.onWebcamConnectSuccess(onWebcamConnectSuccessDEMO);
        this.affdexDetector.onWebcamConnectFailure(onWebcamConnectFailureDEMO);
        this.affdexDetector.onStopSuccess(onStopSuccessDEMO);
        this.affdexDetector.onImageResultsSuccess(onImageResultsSuccessDEMO);
    }
    this.initializeBeyondVerbal = function(){
        this.beyondVerbal = new BeyondVerbalAPI('https://token.beyondverbal.com/token','https://apiv3.beyondverbal.com/v3/recording/');
        this.authenticateBV(this.beyondVerbal.options);
    }
    this.initializeKeylogger = function() {
        this.keylogger = new KeyLogger();
    }
    this.actualizarPermisosDeteccion = function(){
        this.user_accept_affective.affectiva = $("#checkAffectiva")[0].checked;
        this.user_accept_affective.beyond = $("#checkBeyond")[0].checked;
        this.user_accept_affective.keys = $("#checkKeys")[0].checked;
        var callback = function(data){
            window.scrollTo(0, 0);
            if(data == {}){
                console.log("Algo ha ido mal. Ajustes no realizados");
                $("#resultAjustes").css("color","#ff0000").text("Ha habido un problema. Intentelo más tarde");
            } else {
                console.log("Cambios realizados");
                $("#resultAjustes").css("color","#e91e63").text("Cambios realizados");
            }
        }
        peticionAjax("POST", "/updateDetectionPermission/", true, JSON.stringify({
                affectiva: this.user_accept_affective.affectiva,
                beyond: this.user_accept_affective.beyond,
                keys:this.user_accept_affective.keys,
                usuario: $.cookie('id')
            }), callback);

    }
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
                    console.log(data);
                    setCookies(data);
                    console.log("El usuario es correcto");
                    self.setAffective(data.accept_affective);
                    $("#myModal").css("display","none");
                    $("#myBtn").css("display","none");
                    $(".info").css("display","none");
                    $(".intro").css("display","none");
                    $("#header-intro").css("display", "none");
                    showGameControls();
                    //self.datosJuego_ID();
                }
            }
            peticionAjax("POST", "/login/", true, JSON.stringify({
                email_name: nombre,
                password: pass
            }), callback);
        }
    };

    this.datosJuego_ID = function(){
        var callback = function(data){
            console.log(data);
            if(data.nivel == -1 || data == {}){
                finJuego("Lo siento, no tenemos más niveles",resetControl);
            } else {
                infoJuego = data;
                //self.keylogger = new KeyLogger(infoJuego.nivel);
                console.log("Datos recibidos correctos: " + (infoJuego.nivel != -1));
                //siguienteNivel();
                $("#juegoContainer").load("../assets/recipes_info/" + data.recipe.recipe_info, function(){
                    console.log("Info de receta cargado");
                });
            }
        }
        peticionAjax("GET", '/datosJuego/'+$.cookie("id"), true, JSON.stringify(), callback);
    }
    /**
     * El servidor registra los resultados del nivel actual y nos indica el siguiente nivel.
     */
    this.nivelCompletado = function (tiempo, vidas) {
            var callback = function (datos) {
                $.cookie("nivel", datos.nivel);
                console.log()
            }
            peticionAjax("POST", "/nivelCompletado/" + $.cookie("id") + "/" + tiempo + "/" + vidas,
            true, 
            JSON.stringify({
                affectiva: self.getAffdexDetectorInformation(),
                beyond: self.getBeyondVerbalInformation(),
                keys: self.getKeysInformation() 
            }), callback);
            //$.post("/nivelCompletado/" + $.cookie("id") + "/" + tiempo + "/" + vidas, callback);
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
            console.log(data);
            $.loadingBlockHide();
            if (data.result == "userExists") {
                estilosAlerta('#estilosAlerta');
                $('#nombreUsuario').val('Usuario existente');
            } else {
                $("#formRegistro").remove();
                $("#juegoContainer").prepend('<span id="warning" style="font-weight: bold;">Te acabamos de mandar un mensaje con un link para confirmar tu cuenta. </span>');
                $("#juegoContainer").prepend('<span id="warning" style="font-weight: bold;">Comprueba tu bandeja de correo electrónico. </span><br/>');
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
    this.startAffectivaDetection = function () {
        if(self.affdexDetector != undefined) this.affdexDetector.startDetection();
    }
    this.stopAffectivaDetection = function () {
        if(self.affdexDetector != undefined) this.affdexDetector.stopDetection();
    }
    this.getAffdexDetectorInformation = function(){
        if(self.affdexDetector != undefined) {
            return this.affdexDetector.FaceInformation;
        } else {
            return {}
        }
    }
    this.getBeyondVerbalInformation = function(){
        if(self.beyondVerbal != undefined) {
            return this.beyondVerbal.SpeechInformation;
        } else {
            return {}
        }
    }
    this.getKeysInformation = function(){
        if(self.keylogger != undefined) {
            return this.keylogger.getKeysInformation();
        } else {
            return {}
        }
    }
    this.startKeylogger = function(){
        if(self.keylogger != undefined) this.keylogger.start();
    }
    this.stopKeylogger = function(){
        if(self.keylogger != undefined) this.keylogger.stop();
    }
    this.authenticateBV = function (options) {
        console.log('url token:' + options.url.tokenUrl);
        console.log("LLEGAMOS A AUTHENTICATE");
        //options.apiKey = "f5a2d998-132e-41c3-b4f4-e36822e3da9a";
        $.ajax({
            url: options.url.tokenUrl,
            type: "POST",
            dataType: 'text',
            contentType: 'application/x-www-form-urlencoded',
            data: {
                grant_type: "client_credentials",
                apiKey: options.apiKey
            }
        }).fail(function (jqXHR, textStatus, errorThrown)
            {
                console.log(JSON.stringify(jqXHR) + errorThrown);
            })
            .done(function (data)
            {
                console.log("AUTHENTICATE CON EXITO");
                console.log('sucess::' + JSON.stringify(data));
                var token = JSON.parse(data);
                self.beyondVerbal.options.token = token.access_token;
            });
    }
    this.analyzeFileBV = function (blob){
        if(this.beyondVerbal != undefined){
            this.beyondVerbal.analyzeFile(blob)
            .done(function (res)
            {
                console.log("CALLBACK DONE DE ANALYZE_FILE");
                Show(res);
                res = JSON.parse(res);
                console.log("Arousal Mean - " + res.result.analysisSummary.AnalysisResult.Arousal.Mean);
                console.log("Temper Mean - " + res.result.analysisSummary.AnalysisResult.Temper.Mean);
                console.log("Valence Mean - " + res.result.analysisSummary.AnalysisResult.Valence.Mean);
                console.log("Group11_Primary - " + res.result.analysisSegments[0].analysis.Mood.Group11.Primary.Phrase);
                console.log("Composite_Primary - " + res.result.analysisSegments[0].analysis.Mood.Composite.Primary.Phrase);
                self.beyondVerbal.SpeechInformation = {
                    "Arousal":res.result.analysisSummary.AnalysisResult.Arousal.Mean,
                    "Temper":res.result.analysisSummary.AnalysisResult.Temper.Mean,
                    "Valence": res.result.analysisSummary.AnalysisResult.Valence.Mean,
                    "Group11_Primary": res.result.analysisSegments[0].analysis.Mood.Group11.Primary.Phrase,
                    "Composite_Primary":res.result.analysisSegments[0].analysis.Mood.Composite.Primary.Phrase
                }
            })
            .fail(function (err)
            {
                console.log(err);
                self.beyondVerbal.SpeechInformation = {
                    "Arousal":null,
                    "Temper":null,
                    "Valence": null,
                    "Group11_Primary": null,
                    "Composite_Primary":null
                }
                //Show(err);
            });
        }
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
