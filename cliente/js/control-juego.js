//Funciones que modifican el index
var sora = undefined;
var maxVida = undefined;
function inicio(){
    mostrarCabecera();
}
function borrarControl() {
    $("#control").remove();
}

function mostrarCabecera() {
    $("#cabecera").remove();
    $("#control").append('<div id="cabecera"><input type="text" id="nombre" placeholder="Introduce tu nombre"></div> ');
    $("#nombre").on("keyup", function(e){
        if (e.keyCode == 13){
            SetGame();
        }
    })
    botonNombre();
}

function botonNombre() {
    $("#cabecera").append('<button type="button" id="nombreBtn" class="btn btn-primary btn-md" style="margin-left:5px">Enviar</button>');
    //$("#cabecera").append('<button type="button" id="vidasBtn" class="btn btn-primary btn-md" style="margin-left:5px">Quitar vidas</button>');
    $("#nombreBtn").on("click", function() {
        SetGame();
    });
    /*
    $("#vidasBtn").on("click", function() {
        console.log("Quitando vidas");
        actualizarVida(-1);
    });
    */
}

function SetGame(){
    $("#nombreBtn").remove();
    $("#juegoContainer").append('<div id="juegoId"></div>');
    crearUsuario($("#nombre").val());
    $("#nombre").val('');
}
//Funciones de comunicación

function crearUsuario(nombre) {
    if(nombre == ""){
        nombre = "jugador";
    }
    $.getJSON('/crearUsuario/'+nombre, function(datos){
        console.log("Datos recibidos en getJSON");
        juego = datos;
        crearJuego();
        console.log(juego.usuarios[juego.usuarios.length -1]);
        mostrarInfoJuego(juego.usuarios[juego.usuarios.length -1]);
        });
}

function mostrarInfoJuego(jugador){
    sora = jugador;
    maxVida = sora.vidas;
    var infoJuegoHtml = '';
    infoJuegoHtml += '<ul><li><span class="infoPersonaje">Nombre</span></li>';
    infoJuegoHtml += '<li id="nombreJug"><span class="normal">' + sora.nombre + '</span></li>';
    infoJuegoHtml += '<li><span class="infoPersonaje">Vidas</span></li>';
    infoJuegoHtml += '<ul class="vidas" id="vidasJug">';
    for(var i = 0; i <sora.vidas ; i++){
        infoJuegoHtml += '<li><img style="height:40px; width:40px" src="./assets/live.png"></li>';
    }
    infoJuegoHtml += '</ul>';
    infoJuegoHtml += '<li><span class="infoPersonaje">Puntuación</span></li>';
    infoJuegoHtml += '<li id="puntosJug"><span class="normal">0</span></li>';
    infoJuegoHtml += '</ul>';
    $('#infoJuego').append(infoJuegoHtml);
}

function actualizarPuntuacion(score){
    $("#puntosJug").contents().text(score);
}

function actualizarVida(vida){
    console.log(vida + " , " + sora.vidas + " , " + maxVida);
    if(vida > 0){
        for (var i = 0; i < vida && sora.vidas <= maxVida; i++){
            $('#vidasJug').append('<img style="height:40px; width:40px" src="./assets/live.png">');
            sora.vidas += 1;
        }
    } else{
        if(vida < 0){
        console.log("Vida negativa");
        for (var i = 0; i < -vida && sora.vidas > 0; i++){
            $("#vidasJug li").first().remove();
            console.log("Eliminado corazon");
            sora.vidas -= 1;
        }
    }
    } 

}

function salvarPuntuacion(puntos){
    $.getJSON('/puntuaciones/'+juego.usuarios[juego.usuarios.length -1].nombre+'/'+puntos,function(datos){
        juego.usuarios = datos.usuarios;
        console.log("Puntuacion guardada");
    });
}

function mostrarResultados(){
    var resultadosJuego = undefined;
    var resultJuegoHtml = "Hola mundo";
    $.ajax({
        url: '/resultados/',
        dataType: 'json',
        async: false,
        success: function(data) {
            resultadosJuego = data;
        }
    });
    /*$.getJSON('/resultados/', function(datos){
        console.log("Datos recibidos en getJSON");
        console.log(datos);
        resultadosJuego = datos;
    });*/
    for (var key in resultadosJuego) {
        if (resultadosJuego.hasOwnProperty(key)) {
            resultJuegoHtml += key + " - " + resultadosJuego[key] + "<br/>";
        }
    }
    $("#resultadosContainer").append(resultJuegoHtml);
}