//Funciones que modifican el index
function inicio(){
    mostrarCabecera();
}
function borrarControl() {
    $("#control").remove();
}

function mostrarCabecera() {
    $("#cabecera").remove();
    $("#control").append('<div id="cabecera"><input type="text" id="nombre" placeholder="Introduce tu nombre"></div> ');
    botonNombre();
}

function botonNombre() {
    $("#cabecera").append('<button type="button" id="nombreBtn" class="btn btn-primary btn-md" style="margin-left:5px">Enviar</button>');
    $("#nombreBtn").on("click", function() {
        $(this).remove();
        $("#juegoContainer").append('<div id="juegoId"></div>');
        crearUsuario($("#nombre").val());
    });
}
//Funciones de comunicación

function crearUsuario(nombre) {
    if(nombre == ""){
        nombre = "jugador";
    }
    $.getJSON('/crearUsuario/'+nombre, function(datos){
        console.log("Datos recibidos en getJSON");
        juego = datos;
        jugador = juego.usuarios[0];
        crearJuego();
        });
    }