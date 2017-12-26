//************************//
// En este fichero se encuentra la lógica relacionada con el control del cliente: comprobación de cookies,
// llamadas al servidor (a través de Proxy), métodos de fin del juego, configuración del audio, etc.
//************************//

function inicio() {
    proxy.stopKeylogger();
    proxy.stopAffectivaDetection();
    if ($.cookie('email') != undefined) {
        proxy.comprobarUsuarioMongo($.cookie('email'), undefined, true)
    } else if (typeof $.cookie('visitado') === 'undefined') {
        console.log("No hay una cookie");
        construirLogin();
        $(function(){
            $("#footer").append('<p id="warning" style="color:#FF0000; font-weight: bold;">¿Es la primera vez que entras aquí? Echa un vistazo a nuestro aviso legal en la barra superior </p>');
        });
        $.cookie("visitado", 1);
    } else {
        console.log("Has estado aqui antes");
    }
}

function limpiarMongo() {
    $.getJSON('/limpiarMongo/', function (datos) {
        console.log("Coleccion vacia");
        console.log(datos);
    });
}

function nivelCompletado(tiempo,vidas) {
    $('#juegoId').append("<h2 id='enh'>¡Enhorabuena!</h2>");
    $('#juegoId').append("<div id='loading' class='center'><img src='./assets/loading.gif'><h3 id='load-info'></h3></div>");
    $("#load-info").text("Procesando datos...").delay(1000).fadeOut(1000, function(){
        $("#load-info").text("Analizando emociones...").fadeIn(1000, function(){
            proxy.stopPlaying(false);            
            proxy.nivelCompletado(tiempo,vidas);
        }).delay(2000).fadeOut(1000, function(){
            $("#load-info").text("Extrayendo resultados...").fadeIn(1000, function(){
                proxy.obtenerResultados();
            });
        })
    });
}

//Funciones de comunicación
/**
 * Registramos al usuario
 * @param user_name - nombre de usuario (nick)
 * @param nombre - email validado
 * @param pass - contrasena introducida
 */
function crearUsuario(user_name, email, pass) {
    console.log(user_name + " - " + email + " - " + pass);
    if (user_name == "") {
        user_name = "jugador";
    }
    var url = '';
    url = "https://emocook.herokuapp.com";
    proxy.crearUsuario(user_name, email, pass, url);
    
}

function modificarUsuarioServer(user_name, email, pass) {
    proxy.modificarUsuario(user_name, email, pass);
}

function eliminarUsuarioServer(nombre, pass) {
    proxy.eliminarUsuario(nombre,pass);
}

/**
 * Borramos la cookie que hubiera en el navegador
 */
function borrarCookies() {
    $.removeCookie('user_name');
    $.removeCookie('email');
    $.removeCookie('id');
    $.removeCookie('nivel');
    $.removeCookie('maxNivel');
}

function setCookies(data) {
    $.cookie('user_name', data.user_name);
    $.cookie('email', data.email);
    $.cookie('id', data.id);
    $.cookie('nivel', data.nivel);
    $.cookie('maxNivel', data.maxNivel);
}

function finJuego(text,callback){
    $("#gameMusic").animate({volume:0},1000);
    $('#juegoId').append("<h2 id='enh'>"+text+"</h2>");
    $('#control').append('<button type="button" id="volverBtn" class="btn btn-primary btn-md" style="margin-top:5px; margin-left:5px;">Volver a empezar</button>')
    $('#volverBtn').on('click', function () {
        $(this).remove();
        $('#datos, #prog, #cerrarSesBtn').remove();
        callback();
    });
}

function cambiarUsuario(action){
    eval("construirFormulario"+action+"()")
}

function evaluationDataProcessing(data){
    /*var ord_data = data.sort(function(a, b){
        if(a[1] <= b[1]){
            return -1;
        } else {
            return 1;
        }
        return 0;
    });
    console.log(ord_data);
    */
    var ar = Array.from(new Set(Array.from(data, function(x){return x[0]})));
    console.log(ar);
    append_str = "";
    for(var i = 0; i < ar.length; i++){
        console.log("Iteracion - " + i);
        append_str += "<h3>" + ar[i] + "</h3>";
        append_str += "<div class='player-data'><div class='player-header'>" + 
            "<div class='player-eval-cell'>Fecha</div>" + 
            "<div class='player-eval-cell'>Nivel</div>" + 
            "<div class='player-eval-cell'>Intentos</div>" + 
            "<div class='player-eval-cell'>Cara perdida</div>" + 
            "<div class='player-eval-cell'>Tiempo</div>" + 
            "<div class='player-eval-cell'>Fallos</div>" + 
            "<div class='player-eval-cell'>Pulsaciones</div>" + 
            "<div class='player-eval-cell'>Excesivas</div>" + 
            "<div class='player-eval-cell'>Afectivo</div></div>";

        player_data = data.filter(function(eval_data){return eval_data[0] == ar[i]});
        console.log(player_data)
        var level_data = player_data.sort(function(a,b){
            if(a[2] <= b[2]){
                return -1;
            } else {
                return 1;
            }
            return 0;
        });
        console.log(level_data);
        for(var j = 0; j < level_data.length; j++){
            console.log("Iteracion - " + i + " | Datos de " + level_data[j][0] + ", nivel " + level_data[j][2]);
            console.log(level_data[j]);
            var eval_date =level_data[j][1];
            //var eval_date = moment(level_data[j][1]).format("DD/MM/YYYY - HH:mm:ss");
            var time = Math.floor(level_data[j][5])
            append_str += "<div class='player-eval-row'>";//Abre fila
            append_str += "<div class='player-eval-cell'>" + eval_date + "</div>" + 
                            "<div class='player-eval-cell'>" + level_data[j][2] + "</div>" + 
                            "<div class='player-eval-cell'>" + level_data[j][3] + "</div>" + 
                            "<div class='player-eval-cell'>" + level_data[j][4] + "</div>" + 
                            "<div class='player-eval-cell'>" + time + "</div>" + 
                            "<div class='player-eval-cell'>" + level_data[j][6] + "</div>" + 
                            "<div class='player-eval-cell'>" + level_data[j][7] + "</div>" + 
                            "<div class='player-eval-cell'>" + level_data[j][8] + "</div>" + 
                            "<div class='player-eval-cell'>" + level_data[j][9] + "</div>";
            append_str += "</div>"; //Cierra fila
        }
        append_str += "</div>"; //Cierra tabla
    }
    $("#table-results").append(append_str); //Anade tabla a div

    /*
    for(var i = 0; i < ord_data.length ; i++) {
        append_str += "<p>Partida " + moment(ord_data[i][1]).format("DD/MM/YYYY - HH:mm:ss") + " de " + ord_data[i][0] + " </p>";
    }
    /*
    $("#table-results").DataTable({ 
        data: data,
        columns: [
            {title: "Usuario"},
            {title: "Partida"},
            {title: "Nivel"},
            {title: "Intentos"},
            {title: "Cara perdida"},
            {title: "Tiempo (s)"},
            {title: "Fallos"},
            {title: "Pulsaciones"},
            {title: "Excesivas"},
            {title: "Affective flags"}
        ]
    });
    */
}