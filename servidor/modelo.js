function Juego(){
    this.nombre = "Niveles";
    this.niveles = [];
    this.usuarios = [];
    this.agregarNivel = function(nivel){
        this.niveles.push(nivel);
    };
    this.agregarUsuario = function(usuario){
        this.usuarios.push(usuario);
    }
}

function Nivel(num){
    this.nivel = num;
}

function Usuario(nombre){
    this.nombre = nombre;
    this.puntuacion = 0;
    this.incrementarPuntuacion = function(puntos){
        this.puntuacion += puntos;
    }
}


module.exports.Juego = Juego;
module.exports.Usuario = Usuario;
module.exports.Nivel = Nivel;