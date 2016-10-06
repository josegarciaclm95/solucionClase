//Funciones que modifican el index
function inicio(){
    mostrarCabecera();
}
function borrarControl() {
    $("#control").remove();
}

function mostrarCabecera() {
    $("#cabecera").remove();
    $("#control").append('<div id="cabecera"> <h2> Panel de Control</h2> <input type="text" id="nombre" placeholder="Introduce tu nombre"></div> ');
    botonNombre();
}

function botonNombre() {
    $("#cabecera").append('<button type="button" id="nombreBtn" class="btn btn-primary btn-md">Enviar</button>');
    $("#nombreBtn").on("click", function() {
        $(this).remove();
        crearUsuario($("#nombre").val());
    });
}
//Funciones de comunicación

function crearUsuario(nombre) {
    if(nombre == ""){
        nombre = "jugador";
    }
    $.getJSON('/crearUsuario/'+nombre, function(datos){
        //datos contiene la respuesta
        //mostrar los datos del usuario
        
    });
}