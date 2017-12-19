//**********************/
//En este fichero se encuentra la lógica de la aplicación relacionada con la interfaz del cliente: se construyen formularios,
// tablas de resultados, controles del juego, se manipulan estilos, etc.
//**********************/

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

function construirAvisoLegal(){
    $("footer").remove();
    limpiarJuegoContainer();
    ocultarInformacion();
    $("#juegoContainer").load('../html/aviso-legal.html', function(){});
}

function construirAjustes() {
    $("#juegoContainer").load('../html/ajustes.html', function(){
        $("#checkAffectiva")[0].checked = proxy.user_accept_affective.affectiva;
        $("#checkBeyond")[0].checked = proxy.user_accept_affective.beyond;
        $("#checkKeys")[0].checked = proxy.user_accept_affective.keys;
        $("#confirmarCambios").on("click", function(){
            proxy.actualizarPermisosDeteccion();
        });
    });
}

function construirLogin() {
    $("#modal-login").load('../html/login.html', function () {
        $("#claveL").on("keyup", function (e) {
            if (e.keyCode == 13) {
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
            console.log("Evento Click en registrBtn")
            limpiarEstilos("#nombreL,#claveL");
            $("#myModal").css("display","none");
            $("#myBtn").css("display","none");
            $(".info").css("display","none");
            $(".intro").css("display","none");
            $("#header-intro").css("display", "none");
            construirRegistro();
        });
    });

}

function construirRegistro() {
    //$("#intro-row").empty();
    limpiarJuegoContainer();
    ocultarInformacion();
    $("#juegoContainer").load('../html/registro.html', function () {
        $("#control").append("<img style='padding-top:50px' src='./assets/hat.png' width='300'>");
        $("#control").append("<h3>Aprende jugando</h3>");
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
    ocultarInformacion();
    $("#juegoContainer").load('../html/registro.html', function () {
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
            } else {
                modificarUsuarioServer($("#userName").val(), $("#correoUsuario").val(), $("#password1").val());
                $("#warning").remove();
            }
        });
    });
}

/*
else if ($("#password1").val() == "") {
                estilosAlerta('#password2,#password1');
                $("#formRegistro").prepend('<span id="warning" style="color:#FF0000">Contraseña no puede ir en blanco!!!</span>');
                */
function construirFormularioEliminar() {
    ocultarInformacion();
    limpiarJuegoContainer();
    $("#juegoContainer").load('../html/registro.html', function () {
        $("#formRegistro").prepend('<span style="color:#FF0000; font-weight:bold">Confirma tus credenciales. Vas a eliminar tus datos</span>');
        $("#camposContra2, #userName, #labelUserName").remove();
        $("#confirmaRegBtn").text("Eliminar credenciales");
        $("#labelCorreo").text("Correo electrónico");
        $("#confirmaRegBtn").on("click", function () {
            eliminarUsuarioServer($("#correoUsuario").val(), $("#password1").val());
        });
    });
}

function construirAyuda(){
    //$("#myModal").css("display","none");
    $("#myModal").css("display","block");
    $(".modal").css("display","block");
    $("#modal-login").load('../html/ayuda.html', function () {
        console.log("AYUDA CARGADA");
    });
}

function construirFinJuego(){
    limpiarJuegoContainer();
    var nombre = $.cookie("user_name");
    var nivel = $.cookie("nivel");
    var percen = 100;
    $('#datos, #cabeceraP, #cabecera, #prog').remove();
    $('#control').append('<div id="datos"><h4>Usuario: ' + nombre + '<br />Nivel: ' + nivel + '</h4></div>');
    $('#control').append('<div class="progress" id="prog"><div class="progress-bar progress-bar-success progress-bar-striped" aria-valuemin="0" aria-valuemax="100" style="width:' + percen + '%">' + percen + '%</div></div>');
    $("#juegoContainer").load("../html/fin.html", function(){
        $("#volverBtn").on("click", showGameControls);
        $("#cerrarSBtn").on("click", resetControl);
    });


}

/**
 * Haciendo uso de una cookie previa, presentamos la info del jugador (tras haber actualizado la cookie)
 */
function showGameControls() {
    var nombre = $.cookie("user_name");
    var nivel = $.cookie("nivel");
    var percen = Math.floor(((nivel - 1) / $.cookie("maxNivel")) * 100);
    $("#control, #juegoContainer").empty();
    $('#datos, #cabeceraP, #cabecera, #prog').remove();
    $('#control').append('<div id="datos"><h4>Usuario: ' + nombre + '<br />Nivel: ' + nivel + '</h4></div>');
    $('#control').append('<div class="progress" id="prog"><div class="progress-bar progress-bar-success progress-bar-striped" aria-valuemin="0" aria-valuemax="100" style="width:' + percen + '%">' + percen + '%</div></div>');
    $("#registerGroup").remove();
    $("#modificar").show();
    $("#eliminar").show();
    $("#ajustes").show();
    //setModal('myModal', 'help', construirAyuda);
    proxy.datosJuego_ID();
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
        evaluator.startPlaying();
        $(this).remove();
        $("#hearMe").remove();
        //$("#cerrarSesBtn").remove();
        $("#juegoContainer").empty();
        $("#juegoContainer").append('<div id="juegoId"></div>');
        console.log("Llamamos a crear nivel sin parametros en siguienteNivel()");
        crearNivel();
    })
    $("#cerrarSesBtn").on("click", resetControl);
}

function resetControl() {
    borrarCookies();
    limpiarJuegoContainer();
    $("#control").empty();
    $("#modificar").hide();
    $("#social").hide();
    $("#ajustes").hide();
    $("#eliminar").hide();
    location.reload();
    //construirLogin();
}

function borrarSiguienteNivel() {
    $("#siguienteBtn").remove();
    $("#cerrarSesBtn").remove();
    $('#datos').remove();
    $('#cabeceraP').remove();
    $('#cabecera').remove();
    $('#prog').remove();
}

function mostrarResultadosUsuario(datos) {
    console.log("Mostrar resultados con parametros")
    $('#res, #ingredients, #resultados, #cerrarSesBtn').remove();
    $('#juegoId').append('<h3 id="res">Resultados</h3>');
    var cadena = "<table id='resultados' class='table table-bordered table-condensed'><tr><th>Nombre</th><th>Nivel</th><th>Tiempo</th></tr>";
    for (var i = 0; i < datos.length; i++) {
        cadena = cadena + "<tr><td>" + $.cookie("user_name") + "</td><td> " + datos[i].nivel + "</td>" + "</td><td> " + datos[i].tiempo + "</td></tr>";
    }
    cadena = cadena + "</table>";
    $('#juegoId').append(cadena);
    $("#juegoId").append('<button type="button" id="sigRecBtn" class="btn btn-primary btn-md" style="margin-top:5px">Siguiente receta</button>');
    if(datos.length == $.cookie("maxNivel")){
        $("#sigRecBtn").on("click", function(){
            construirFinJuego();
        });
    } else {
        $("#sigRecBtn").on("click", function(){
            showGameControls();
        });
    }
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

var startListening = function(){
    recognition.startRecognition();
    $("#recordMe").addClass("recording");
    $("#recordMe").text("Parar");
};

var stopListening = function(){
    recognition.stopRecognition();
    $("#recordMe").removeClass("recording");
    $("#recordMe").text("Clic para empezar");
};

function setDictation(sentences, tiempo, vidas){
    console.log("LLAMADA A SETDICTARION");
    $("#juegoContainer").empty();
    $("#juegoContainer").append('<div style="display: block; margin: 0 auto; width:50%;" id="sentences" class="dotstyle dotstyle-hop center">');
    $("#juegoContainer").append('<div style="display: block; margin: 0 auto; width:75%" id="sentence-holder">');
    var html = "<ul>";
    var grammar = [];
    recognition.sentences = sentences.length;
    recognition.infoJuegoPrevio = {"tiempo": tiempo, "vidas":vidas};
    for(var i = 0; i < sentences.length; i++){
        grammar.push(sentences[i][0].toLowerCase().split("-").join(" ").split(" "));
        html += '<li><a href="#" id="sentence' + i + '"></a></a></li>';
        console.log("#sentence" + i);
        $("#sentences").on("click", "#sentence" + i, function(event){
            $("#sentence-holder").empty();
            $("#sentence-holder").append('<h2 class="center">' + sentences[parseInt(this.id.slice(8))][0] + '</h2>')
        });
    }
    recognition.setGrammar(grammar,"fruits","fruit");
    $("#sentences").append(html);
    $("#sentence0").parent("li").addClass("current");
    $("#sentence-holder").html('<h2 class="center">' + sentences[0][0] + '</h2>');
    $("#juegoContainer").append('<div class="center" id="record-button"><button id="recordMe" class="btn btn-success" type="button">Clic para empezar</button></div>');
    $("#recordMe").addClass("glow");
    $("#juegoContainer").append('<div class="center" id="result-sent"><h2 id="resultado-oracion"></h2></div>');
    /*
    $("#juegoContainer").on("click", "#recordMe", function(event){
        console.log("Callback set on button");
        $("#sentence-holder").css("color", "#000000");
        if($("#recordMe").text() == "Clic para empezar") startListening();
        else stopListening();
     });
     */
    $("#recordMe").on("click", function(){
        $("#sentence-holder").css("color", "#000000");
        if($("#recordMe").text() == "Clic para empezar") startListening();
        else stopListening();
    });
     toggleRecording(recognition);
    [].slice.call( document.querySelectorAll( '.dotstyle > ul' ) ).forEach( function( nav ) {
        new DotNav( nav, {
            callback : function( idx ) {
                //console.log( idx )
            }
        } );
    } );
    infoJuego = {};
    console.log("Info juego borrado")
    $("#juegoContainer").append('<div id="juegoId"></div>');
}

function validateMail(email) {
    console.log("Validando Mail");
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;;
    console.log(re.test(email))
    return re.test(email);
}

function ocultarInformacion(){
    $("#myModal").css("display","none");
    $("#myBtn").css("display","none");
    $(".info").css("display","none");
    $(".intro").css("display","none");
    $("#header-intro").css("display", "none");
    $("#affect-info").css("display", "none");
}

function setModal(modal_id, element_id, callback){
    // Get the modal
    var modal = document.getElementById(modal_id);
    // Get the button that opens the modal
    var btn = document.getElementById(element_id);
    // Get the <span> element that closes the modal
    //var span = document.getElementsByClassName("close")[0];
    // When the user clicks on the button, open the modal 
    console.log(btn);
    btn.onclick = function() {
        modal.style.display = "block";
        callback();
    }
    // When the user clicks on <span> (x), close the modal
    /*
    span.onclick = function() {
        modal.style.display = "none";
    }
    */
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function setScoreCounters(recipe){
    console.log("llegamos aqui");
    var ingredients = recipe.ingredients;
    var html ='<ul id="scores" class="no-list">';
    console.log(ingredients);
    for(var i = 0; i < ingredients.length; i++){
        console.log(ingredients[i]);
        html += '<li> ' + ingredients[i].name.charAt(0).toUpperCase() + ingredients[i].name.slice(1);
        html += '<span id="' +ingredients[i].name + 'Score">0</span> / '+ ingredients[i].goal + '</li>';
    }
    html+= '</ul>';
    $("#juegoContainer").prepend(html);
    $("#juegoContainer").prepend('<h3>Receta: ' + recipe.name + '</h3>');
    $()
}

function upperCaseFirstLetter(string){
    return string.toUpperCase() + string.slice(1);
}